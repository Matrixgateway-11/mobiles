import type { ReactNode } from 'react'
import { RiCustomerService2Line, RiTranslate2, RiCheckLine } from '@remixicon/react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

const YEAR = new Date().getFullYear()

const HIGHLIGHTS = [
  'Collect by payment link, QR or gateway',
  'Disburse over IMPS to penny-drop verified accounts',
  'Reconcile every movement against one wallet ledger',
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Narrative panel — hidden on small screens where the form is the task */}
      <aside className="relative hidden w-[44%] max-w-2xl shrink-0 flex-col justify-between overflow-hidden bg-brand-900 p-10 lg:flex xl:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-40 -right-32 size-[30rem] rounded-full bg-brand-500/25 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <Logo showTagline />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[2.125rem] leading-[1.15] font-semibold tracking-[-0.03em] text-white">
            Every rupee, accounted for.
          </h2>
          <p className="mt-4 text-md leading-relaxed text-white/70">
            The merchant console for credit card bill payments — collections, payouts and
            settlement in one place.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-base text-white/80">
                <span
                  className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-white/15"
                  aria-hidden
                >
                  <RiCheckLine size={11} className="text-white" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/45">
          <span>© {YEAR} Sai Mobiles</span>
          <span className="flex items-center gap-2">
            <span className="rounded border border-white/20 px-1.5 py-0.5 font-medium tracking-wide">
              Bharat Connect
            </span>
            <span className="rounded border border-white/20 px-1.5 py-0.5 font-medium tracking-wide">
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
