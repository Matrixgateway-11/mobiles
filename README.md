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

## Roles and onboarding

Three levels: one **admin**, **distributors** under the admin, **retailers** under a
distributor. A retailer is the leaf — nobody is onboarded below one, which is why
the retailer console has no User Management section at all, rather than a disabled
or empty one.

| | Admin | Distributor | Retailer |
|---|---|---|---|
| Onboards | distributors and retailers | retailers | nobody |
| Approves | yes, the final decision | no — proposes and passes up | no |
| Sees | every account | its own retailers | itself |

**Onboarding by link.** Add User has a third tab that mints a tokenised URL. The
applicant opens `/onboard/:token`, which is outside the session gate, and fills in
their own details across four steps with their email verified by a one-time code.
Nobody is onboarded straight from the form: the finished application lands in the
inviter's Invitations inbox.

**Two-stage approval.** A distributor can review a retailer and propose a rate, but
only the admin creates the account. On approval an MPIN is issued and the account
appears in the hierarchy.

**Commission** is the share an account's parent keeps. The rate is set at approval
and the dialog shows what it means in rupees — at 1%, ₹1,000 of ₹1,00,000 collected
goes up and ₹99,000 stays.

## Authentication

Supabase Auth, email and password. The password is hashed and verified by
Supabase; nothing in this repo ever handles a credential. The signed-in user's
profile decides the role, so admin, distributor and retailer are three views of
the same console rather than three builds.

**There is no second factor yet, and that is a deliberate pause rather than an
oversight.** The plan was password plus a one-time code by email, but Supabase
will not *enforce* an email OTP as a second factor: `signInWithOtp` is a primary
sign-in method, and anyone holding the publishable key can call it directly, so
layering it on top of a password in the client would look like two factors
while being one. The options that are genuinely enforced are TOTP, which
Supabase gates at the token level with `aal2` and which RLS can require, or a
custom flow behind an edge function with its own SMTP. That decision is open.

Until a project is configured the console runs on fixtures and the sign-in form
is a doorway, not a check — `src/lib/config.ts` decides which, and the account
switcher in the user menu only appears in that mode.

## State

`src/lib/network.ts` is the single seam for persistence. Accounts and invitations
live in `localStorage` — deliberately, not `sessionStorage`, because an onboarding
link is opened in a second tab and the reviewer's inbox updates from a `storage`
event the moment the applicant submits. Swapping in Supabase replaces the mutations
in that one file; no component touches storage.

Transaction, wallet and ledger figures stay as fixtures in `src/data/mock.ts`.

## Screens

Built from the live console: Dashboard; Credit Card Payments (Overview, Load Money,
Disbursements, Bank List, Payment Links, Wallet Ledger, Reports); QR Transactions;
Commission (wallet and structure); User Management (network, Add User with three
onboarding modes, Invitations); the public onboarding form; Tickets; Help & Support;
Account Settings (Profile, KYC, Security, Activity); Login and MPIN.

Named placeholders with real empty states: Terms, Privacy — both await copy from
legal rather than design.

Where the live console shows only an error or an empty table — the commission
structure, the KYC panel, the support contacts — this rebuild shows the screen the
page is *for*, populated from fixtures. An error state is not a design.
