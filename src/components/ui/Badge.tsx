import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Status } from '@/data/mock'

type Tone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'brand'

const TONES: Record<Tone, { chip: string; dot: string }> = {
  neutral: { chip: 'bg-ink-100 text-ink-700 ring-ink-200', dot: 'bg-ink-400' },
  success: { chip: 'bg-success-50 text-success-800 ring-success-200', dot: 'bg-success-600' },
  danger: { chip: 'bg-danger-50 text-danger-800 ring-danger-200', dot: 'bg-danger-600' },
  warning: { chip: 'bg-warning-50 text-warning-700 ring-warning-200', dot: 'bg-warning-600' },
  info: { chip: 'bg-info-50 text-info-700 ring-info-200', dot: 'bg-info-600' },
  brand: { chip: 'bg-brand-50 text-brand-800 ring-brand-200', dot: 'bg-brand-600' },
}

type BadgeProps = {
  tone?: Tone
  dot?: boolean
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', dot = false, children, className }: BadgeProps) {
  const t = TONES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
        'text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        t.chip,
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', t.dot)} aria-hidden />}
      {children}
    </span>
  )
}

const STATUS_MAP: Record<Status, { tone: Tone; label: string }> = {
  success: { tone: 'success', label: 'Success' },
  verified: { tone: 'success', label: 'Verified' },
  failed: { tone: 'danger', label: 'Failed' },
  pending: { tone: 'warning', label: 'Pending' },
  refunded: { tone: 'info', label: 'Refunded' },
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { tone, label } = STATUS_MAP[status]
  return (
    <Badge tone={tone} dot className={className}>
      {label}
    </Badge>
  )
}

/** Credit / Debit marker for ledger rows — deliberately quieter than a status. */
export function LedgerTypeBadge({ type }: { type: 'credit' | 'debit' }) {
  return (
    <Badge tone={type === 'credit' ? 'success' : 'neutral'}>
      {type === 'credit' ? 'Credit' : 'Debit'}
    </Badge>
  )
}
