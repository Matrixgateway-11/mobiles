import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiArrowRightLine,
  RiArrowLeftDownLine,
  RiArrowRightUpLine,
  RiBillLine,
  RiQrScan2Line,
  RiSmartphoneLine,
  RiLinkM,
  RiFileCopyLine,
  RiCheckLine,
  RiShareForwardLine,
  RiExternalLinkLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { merchant, disbursementSummary, walletSummary } from '@/data/mock'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Collections, disbursements and bill payments."
      />

      <section aria-label="Payment channels" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChannelCard
          icon={RiArrowLeftDownLine}
          tone="success"
          title="Collections"
          subtitle="Payin"
          value={money(walletSummary.balance)}
          caption="Settled to wallet, available now"
          to="/credit-card-payments/overview"
          linkLabel="View collections"
        />
        <ChannelCard
          icon={RiArrowRightUpLine}
          tone="brand"
          title="Disbursements"
          subtitle="Payout"
          value={money(disbursementSummary.inProgress)}
          caption="In flight to beneficiaries"
          to="/credit-card-payments/disbursements"
          linkLabel="View disbursements"
        />
        <ChannelCard
          icon={RiBillLine}
          tone="neutral"
          title="BBPS"
          subtitle="Bill payments"
          value="—"
          caption="Not enabled on this account yet"
          disabled
        />
      </section>

      <section aria-label="Acceptance" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FeatureCard
          icon={RiQrScan2Line}
          title="QR Scan"
          description="Accept UPI against your static QR, reconciled by UTR."
          state="paused"
          stateLabel="Temporarily closed"
          note="QR collection is closed right now. Submitted payments are still being settled."
          to="/qr-payments/transactions"
          linkLabel="View QR transactions"
        />
        <FeatureCard
          icon={RiSmartphoneLine}
          title="POS"
          description="Card-present acceptance, settled to the same wallet."
          state="soon"
          stateLabel="Coming soon"
          note="We'll let you know as soon as terminals are available in your region."
        />
      </section>

      <PaymentLinkCard />
    </>
  )
}

/* -------------------------------------------------------------------------- */

const TONE_TILE = {
  success: 'bg-success-50 text-success-700',
  brand: 'bg-brand-50 text-brand-700',
  neutral: 'bg-ink-100 text-ink-500',
} as const

function ChannelCard({
  icon: Icon,
  tone,
  title,
  subtitle,
  value,
  caption,
  to,
  linkLabel,
  disabled = false,
}: {
  icon: RemixiconComponentType
  tone: keyof typeof TONE_TILE
  title: string
  subtitle: string
  value: string
  caption: string
  to?: string
  linkLabel?: string
  disabled?: boolean
}) {
  return (
    <Card className={cn('flex flex-col', disabled && 'bg-ink-25 shadow-none')}>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-lg',
              TONE_TILE[tone],
            )}
            aria-hidden
          >
            <Icon size={18} />
          </span>
          {disabled && <Badge tone="neutral">Not enabled</Badge>}
        </div>

        <h2 className="mt-4 text-md font-semibold tracking-[-0.01em] text-ink-900">
          {title}
          <span className="ml-1.5 text-sm font-normal text-ink-400">{subtitle}</span>
        </h2>

        <p
          className={cn(
            'mt-2 text-4xl font-semibold tracking-[-0.025em]',
            disabled ? 'text-ink-300' : 'text-ink-900',
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-sm text-ink-500">{caption}</p>
      </div>

      {to && linkLabel ? (
        <CardLink to={to} label={linkLabel} />
      ) : (
        <p className="border-t border-ink-200 px-5 py-3 text-sm text-ink-400">
          Nothing to review yet
        </p>
      )}
    </Card>
  )
}

/** Shared footer row so every card in a grid resolves to the same height. */
function CardLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="group relative flex items-center justify-between border-t border-ink-200 px-5 py-3 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-25 hover:text-brand-700"
    >
      {label}
      <RiArrowRightLine
        size={16}
        className="transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </Link>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  state,
  stateLabel,
  note,
  to,
  linkLabel,
}: {
  icon: RemixiconComponentType
  title: string
  description: string
  state: 'paused' | 'soon'
  stateLabel: string
  note: string
  to?: string
  linkLabel?: string
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex size-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"
            aria-hidden
          >
            <Icon size={18} />
          </span>
          <Badge tone={state === 'paused' ? 'warning' : 'neutral'} dot={state === 'paused'}>
            {stateLabel}
          </Badge>
        </div>

        <h2 className="mt-4 text-md font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
        <p className="mt-1 max-w-sm text-base text-ink-500">{description}</p>
        <p className="mt-4 border-l-2 border-ink-200 pl-3 text-sm text-ink-500">{note}</p>
      </div>

      {to && linkLabel ? (
        <CardLink to={to} label={linkLabel} />
      ) : (
        <p className="border-t border-ink-200 px-5 py-3 text-sm text-ink-400">
          Nothing to review yet
        </p>
      )}
    </Card>
  )
}

function PaymentLinkCard() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(merchant.paymentLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the field is selectable as a fallback */
    }
  }

  const share = async () => {
    if (!navigator.share) return copy()
    try {
      await navigator.share({ title: 'Pay Sai Mobiles', url: merchant.paymentLink })
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <Card className="mt-4">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
            aria-hidden
          >
            <RiLinkM size={18} />
          </span>
          <div>
            <h2 className="text-md font-semibold tracking-[-0.01em] text-ink-900">
              Your payment link
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              Share this with customers to collect without raising an invoice.
            </p>
          </div>
        </div>
        <Badge tone="success" dot className="self-start lg:self-auto">
          Live
        </Badge>
      </div>

      <div className="flex flex-col gap-2 border-t border-ink-200 p-5 sm:flex-row sm:items-center">
        <input
          readOnly
          value={merchant.paymentLink}
          aria-label="Payment link"
          onFocus={(event) => event.currentTarget.select()}
          className="h-9 min-w-0 flex-1 truncate rounded-lg border border-ink-200 bg-ink-50 px-3 font-mono text-sm text-ink-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none"
        />
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant={copied ? 'secondary' : 'primary'}
            icon={copied ? RiCheckLine : RiFileCopyLine}
            onClick={copy}
            className={cn(copied && 'text-success-700')}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button icon={RiShareForwardLine} onClick={share}>
            Share
          </Button>
          <Button
            as="a"
            href={merchant.paymentLink}
            target="_blank"
            rel="noreferrer noopener"
            icon={RiExternalLinkLine}
          >
            Open
          </Button>
        </div>
      </div>
    </Card>
  )
}
