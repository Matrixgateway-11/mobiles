import type { ReactNode } from 'react'
import type { RemixiconComponentType } from '@remixicon/react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'brand'

const TILES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  success: 'bg-success-50 text-success-700',
  danger: 'bg-danger-50 text-danger-700',
  warning: 'bg-warning-50 text-warning-700',
  info: 'bg-info-50 text-info-700',
  brand: 'bg-brand-50 text-brand-700',
}

type StatCardProps = {
  label: string
  value: ReactNode
  meta?: ReactNode
  icon?: RemixiconComponentType
  tone?: Tone
  className?: string
}

export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  tone = 'neutral',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink-200 bg-white px-5 py-4 shadow-xs',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span
            className={cn('inline-flex size-7 items-center justify-center rounded-md', TILES[tone])}
            aria-hidden
          >
            <Icon size={16} />
          </span>
        )}
        <span className="text-xs font-medium tracking-[0.01em] text-ink-500">{label}</span>
      </div>
      {/* Proportional figures: at this size equal-width digits read loose */}
      <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink-900">{value}</p>
      {meta && <p className="mt-1 text-xs text-ink-400">{meta}</p>}
    </div>
  )
}

export function StatGrid({
  columns = 3,
  children,
  className,
}: {
  columns?: 2 | 3 | 4 | 5
  children: ReactNode
  className?: string
}) {
  const cols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[columns]
  return <div className={cn('grid grid-cols-1 gap-4', cols, className)}>{children}</div>
}
