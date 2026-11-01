import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiArrowRightDownLine,
  RiWallet3Line,
  RiErrorWarningLine,
  RiLinkM,
  RiFileCopyLine,
  RiCheckLine,
  RiShareForwardLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiEyeOffLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { Sparkline } from '@/components/Sparkline'
import {
  merchant,
  disbursementSummary,
  walletSummary,
  monthlyVolume,
  recentActivity,
  paymentLinkSummary,
  qrPaymentTotal,
} from '@/data/mock'
import { money, signedMoney, count, formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/cn'

/* The landing screen answers three questions, in this order: how much have I
   got, which way is it moving, and is anything broken. The channel tiles that
   used to fill this page answered none of them — they were a menu with
   figures on it, and three of the five only ever said "not enabled". */

const trend = monthlyVolume.map((point) => point.value)
const thisMonth = trend[trend.length - 1] ?? 0
const lastMonth = trend[trend.length - 2] ?? 0

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${merchant.name} · last 12 months`}
        actions={
          <Button as={Link} to="/credit-card-payments/reports" iconAfter={RiArrowRightLine}>
            Reports
          </Button>
        }
      />

      <section aria-label="Key figures" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={RiWallet3Line}
          label="Wallet balance"
          value={money(walletSummary.balance)}
          meta="Available to disburse"
        />
        <Metric
          icon={RiArrowRightDownLine}
          label="Collected this month"
          value={money(thisMonth)}
          delta={delta(thisMonth, lastMonth)}
          trend={trend}
          tone="success"
        />
        <Metric
          icon={RiArrowRightUpLine}
          label="Disbursed"
          value={money(disbursementSummary.settled)}
          meta={`${count(walletSummary.transactions)} movements`}
        />
        <Metric
          icon={RiErrorWarningLine}
          label="Needs attention"
          value={count(disbursementSummary.failedCount)}
          meta="Failed payouts to review"
          tone={disbursementSummary.failedCount > 0 ? 'danger' : 'neutral'}
          to="/credit-card-payments/disbursements"
        />
      </section>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <Activity />
        <div className="space-y-4">
          <PaymentLink />
          <Channels />
        </div>
      </div>
    </>
  )
}

function delta(current: number, previous: number) {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

/* ------------------------------------------------------------------ metric */

type Tone = 'neutral' | 'success' | 'danger'

function Metric({
  icon: Icon,
  label,
  value,
  meta,
  delta: change,
  trend: series,
  tone = 'neutral',
  to,
}: {
  icon: RemixiconComponentType
  label: string
  value: string
  meta?: string
  delta?: number | null
  trend?: number[]
  tone?: Tone
  to?: string
}) {
  const body = (
    <>
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className={cn(
            'shrink-0',
            tone === 'danger' ? 'text-danger-600' : tone === 'success' ? 'text-success-600' : 'text-ink-400',
          )}
          aria-hidden
        />
        <span className="text-xs font-medium text-ink-500">{label}</span>
        {to && (
          <RiArrowRightLine
            size={14}
            className="ml-auto text-ink-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-600"
            aria-hidden
          />
        )}
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink-900">{value}</p>

      <div className="mt-2 flex min-h-8 items-end justify-between gap-3">
        <div className="min-w-0">
          {change != null && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                change >= 0 ? 'text-success-700' : 'text-danger-700',
              )}
            >
              {change >= 0 ? <RiArrowRightUpLine size={13} /> : <RiArrowRightDownLine size={13} />}
              {Math.abs(change)}%
              <span className="font-normal text-ink-400">vs last month</span>
            </span>
          )}
          {meta && <p className="truncate text-xs text-ink-400">{meta}</p>}
        </div>
        {series && <Sparkline data={series} tone="success" className="h-8 w-24 shrink-0" />}
      </div>
    </>
  )

  const shell =
    'group block rounded-xl border border-ink-200 bg-white px-5 py-4 shadow-xs transition-colors'

  return to ? (
    <Link to={to} className={cn(shell, 'hover:border-ink-300 hover:bg-ink-25')}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  )
}

/* ---------------------------------------------------------------- activity */

function Activity() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Recent movement" description="Across every channel." />
      <ul className="divide-y divide-ink-100">
        {recentActivity.slice(0, 6).map((entry, index) => (
          <li key={`${entry.date}-${index}`} className="flex items-center gap-3 px-5 py-3">
            <span
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full',
                entry.type === 'credit'
                  ? 'bg-success-50 text-success-700'
                  : 'bg-ink-100 text-ink-600',
              )}
              aria-hidden
            >
              {entry.type === 'credit' ? (
                <RiArrowRightDownLine size={14} />
              ) : (
                <RiArrowRightUpLine size={14} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-ink-900">{entry.description}</p>
              <p className="truncate text-xs text-ink-500">
                {formatDate(entry.date)}
                <span className="mx-1.5 text-ink-300">·</span>
                {formatTime(entry.date)}
              </p>
            </div>

            <span
              className={cn(
                'tnum shrink-0 text-base font-medium',
                entry.amount >= 0 ? 'text-success-700' : 'text-ink-900',
              )}
            >
              {signedMoney(entry.amount)}
            </span>
          </li>
        ))}
      </ul>
      <CardFooter>
        <p className="text-sm text-ink-500">{count(walletSummary.transactions)} in total</p>
        <Button
          as={Link}
          to="/credit-card-payments/wallet-ledger"
          size="sm"
          iconAfter={RiArrowRightLine}
        >
          Wallet ledger
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ----------------------------------------------------------- payment link */

/** The URL is a bearer capability: anyone holding it can be sent to pay you.
    It stays masked until asked for, which also keeps it off the screen during
    a shoulder-surf or a screen share. */
function PaymentLink() {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(merchant.paymentLink).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  const share = () => {
    if (navigator.share) {
      void navigator.share({ title: 'Pay Sai Mobiles', url: merchant.paymentLink }).catch(() => {})
      return
    }
    copy()
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <span
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
          aria-hidden
        >
          <RiLinkM size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-md font-semibold tracking-[-0.01em] text-ink-900">Payment link</p>
          <p className="tnum text-xs text-ink-500">
            {count(paymentLinkSummary.total)} sent
            <span className="mx-1.5 text-ink-300">·</span>
            {money(paymentLinkSummary.collected)} collected
          </p>
        </div>
        <IconButton
          icon={revealed ? RiEyeOffLine : RiEyeLine}
          label={revealed ? 'Hide the link' : 'Reveal the link'}
          variant="secondary"
          size="sm"
          onClick={() => setRevealed((v) => !v)}
        />
      </div>

      {/* 0fr → 1fr animates height without measuring anything, so the panel
          opens at its natural size whatever the URL length. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          revealed ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              'border-t border-ink-200 bg-ink-25 px-5 py-4 transition-transform duration-300 ease-out',
              revealed ? 'translate-y-0' : '-translate-y-1',
            )}
          >
            <code className="block truncate rounded-lg border border-ink-200 bg-white px-3 py-2 font-mono text-xs text-ink-700">
              {merchant.paymentLink}
            </code>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'primary'}
                icon={copied ? RiCheckLine : RiFileCopyLine}
                onClick={copy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" icon={RiShareForwardLine} onClick={share}>
                Share
              </Button>
              <Button
                as="a"
                href={merchant.paymentLink}
                target="_blank"
                rel="noreferrer"
                size="sm"
                icon={RiExternalLinkLine}
              >
                Open
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ---------------------------------------------------------------- channels */

type Channel = {
  label: string
  state: 'live' | 'paused' | 'off' | 'soon'
  meta: string
  to?: string
}

const CHANNELS: Channel[] = [
  { label: 'Collections', state: 'live', meta: 'Payment link, QR', to: '/credit-card-payments/overview' },
  { label: 'Disbursements', state: 'live', meta: 'IMPS payouts', to: '/credit-card-payments/disbursements' },
  { label: 'QR Scan', state: 'paused', meta: `${count(qrPaymentTotal)} collected`, to: '/qr-payments/transactions' },
  { label: 'BBPS', state: 'off', meta: 'Bill payments' },
  { label: 'POS', state: 'soon', meta: 'Card present' },
]

const STATE: Record<Channel['state'], { tone: 'success' | 'warning' | 'neutral' | 'info'; label: string }> = {
  live: { tone: 'success', label: 'Live' },
  paused: { tone: 'warning', label: 'Paused' },
  off: { tone: 'neutral', label: 'Off' },
  soon: { tone: 'info', label: 'Soon' },
}

function Channels() {
  return (
    <Card>
      <CardHeader title="Channels" />
      <ul className="divide-y divide-ink-100">
        {CHANNELS.map((channel) => {
          const state = STATE[channel.state]
          const row = (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-ink-800">{channel.label}</p>
                <p className="truncate text-xs text-ink-500">{channel.meta}</p>
              </div>
              <Badge tone={state.tone} dot>
                {state.label}
              </Badge>
              {channel.to && (
                <RiArrowRightLine
                  size={15}
                  className="shrink-0 text-ink-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-600"
                  aria-hidden
                />
              )}
            </>
          )

          return (
            <li key={channel.label}>
              {channel.to ? (
                <Link
                  to={channel.to}
                  className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-25"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-5 py-3 opacity-70">{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
