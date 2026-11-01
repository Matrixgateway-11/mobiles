import type { ReactNode } from 'react'
import { RiCustomerService2Line, RiTranslate2, RiCheckLine } from '@remixicon/react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

const YEAR = new Date().getFullYear()

const HIGHLIGHTS = [
  'Collect by payment link, QR or gateway',
  'Disburse over IMPS to verified accounts',
  'Reconcile against one wallet ledger',
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Narrative panel — hidden on small screens where the form is the task */}
      <aside className="relative hidden w-[44%] max-w-2xl shrink-0 flex-col justify-between overflow-hidden bg-ink-950 p-10 lg:flex xl:p-12">
        {/* Depth without decoration: a faint grid for structure, two offset
            glows so the panel has a light source rather than a flat fill. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at 30% 20%, #000 40%, transparent 75%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-48 -right-40 size-[34rem] rounded-full bg-brand-600/30 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-56 -left-32 size-[28rem] rounded-full bg-brand-500/15 blur-[120px]"
          aria-hidden
        />

        <div className="relative">
          <Logo showTagline />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[2.375rem] leading-[1.1] font-semibold tracking-[-0.035em] text-white">
            Every rupee,
            <br />
            accounted for.
          </h2>
          <p className="mt-5 max-w-sm text-md leading-relaxed text-white/60">
            Collections, payouts and settlement in one console.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-base text-white/70">
                <span
                  className="mt-0.5 inline-flex size-[1.125rem] shrink-0 items-center justify-center rounded-full bg-brand-500/25 ring-1 ring-brand-400/30"
                  aria-hidden
                >
                  <RiCheckLine size={11} className="text-brand-200" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/35">
          <span>© {YEAR} Sai Mobiles</span>
          <span className="flex items-center gap-2">
            <span className="rounded-md border border-white/12 bg-white/5 px-2 py-1 font-medium tracking-wide">
              Bharat Connect
            </span>
            <span className="rounded-md border border-white/12 bg-white/5 px-2 py-1 font-medium tracking-wide">
              NPCI
            </span>
          </span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 p-5 lg:justify-end">
          <span className="lg:hidden">
            <Logo variant="dark" />
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" icon={RiCustomerService2Line}>
              Contact
            </Button>
            <Button size="sm" variant="ghost" icon={RiTranslate2}>
              English
            </Button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  )
}
