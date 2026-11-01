# Sai Mobiles — Merchant Console

The Sai Mobiles merchant console — credit card bill payments, settled over Bharat
Connect / NPCI. It follows the information architecture of the EESHAPE portal it
replaces, with the interface rebuilt on a real design system.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Stack

| | |
|---|---|
| Framework | React 19 + TypeScript, Vite |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 (tokens declared in `@theme`, no config file) |
| Icons | `@remixicon/react` |
| Charts | Recharts — one shared chunk, loaded only by the two charting routes |
| Data | `src/data/mock.ts` — fixtures mirroring the live account |

## Design decisions

The reference console reads as machine-generated: pastel gradient tiles, saturated
icon blobs, emoji in headings, 48px display type on the login screen, 16px corner
radii everywhere, drop shadows on buttons. The rebuild deliberately departs from
each of those.

**Type.** Geist for the interface, Geist Mono for identifiers and references. The
base size is **14px, not 16px** — this is a data product, and the default web scale
costs a third of every table row. The scale is fixed at 11 / 12 / 13 / 14 / 15 / 16 /
18 / 20 / 24 / 30 and nothing sits between those steps.

**Colour is rationed.** The maroon (`--color-brand-700: #931f08`, taken from the
live CSS) is reserved for navigation, the primary action and the brand mark. Warm
neutrals carry everything else. Semantic colour appears only in status chips and
small icon tiles.

**Debits are not red.** The brand *is* red, so colouring every debit red would put
failure and identity in the same hue. Credits read green, debits stay neutral ink
with a true minus sign (`−`, not a hyphen), and red is kept for genuine failure.

**No status wears the brand.** For the same reason, ticket states run neutral →
blue → amber → green → red (submitted, opened, in progress, resolved, rejected).
Reaching for the maroon as "just another hue" is what makes a status strip stop
meaning anything.

**Hairlines over shadows.** Cards are 1px borders with at most a 1px shadow; real
elevation is reserved for overlays. Radii top out at 12px, and full pills are used
only for status chips.

**Numbers behave.** `Intl.NumberFormat('en-IN')` gives true Indian grouping
(₹2,10,68,649.66). Tabular figures are applied where numbers stack vertically —
table columns, axis ticks — and *not* on stat-tile or hero figures, where equal-width
digits read loose.

**The chart follows the dataviz rules.** Single series, so no legend; the card title
names it. Solid hairline gridlines (dashes read as "projection"), a baseline at zero,
recessive axes, both non-zero bars directly labelled so no value is tooltip-only, and
the brand hex validated for lightness, chroma and contrast against the chart surface.

## Layout

- `src/components/ui/` — primitives: `Button`, `Card`, `Badge`, `StatCard`, `Table`,
  `Field`, `FilterBar`, `Tabs`, `Pagination`, `EmptyState`, `PageHeader`, `Modal`,
  `Alert`, `DataList`, `Logo`
- `src/components/layout/` — `AppLayout`, `Sidebar`, `Topbar`, `Footer`, `AuthLayout`
- `src/pages/` — one file per route
- `src/lib/format.ts` — currency, dates, account masking

Filters, search and status selects run against the fixtures, so the tables actually
filter rather than just looking like they do. The sidebar collapses to an icon rail
(persisted to `localStorage`) and becomes a drawer below `lg`.

Figures that appear twice are derived once. The commission overview chart and the
"top earning days" ranking both read from `commissionTxns`, so the two cannot drift
apart the way hand-entered totals do.

## Screens

Built from the live console: Dashboard; Credit Card Payments (Overview, Load Money,
Disbursements, Bank List, Payment Links, Wallet Ledger, Reports); QR Transactions;
Commission (wallet and structure); User Management (My Team & Activity, Add User);
Tickets; Help & Support; Account Settings (Profile, KYC, Security, Activity); Login
and MPIN.

Named placeholders with real empty states: Terms, Privacy — both await copy from
legal rather than design.

Where the live console shows only an error or an empty table — the commission
structure, the KYC panel, the support contacts — this rebuild shows the screen the
page is *for*, populated from fixtures. An error state is not a design.
