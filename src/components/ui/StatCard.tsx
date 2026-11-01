import type { ReactNode } from 'react'
import type { RemixiconComponentType } from '@remixicon/react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'brand'

const GLYPH: Record<Tone, string> = {
  neutral: 'text-ink-400',
  success: 'text-success-600',
  danger: 'text-danger-600',
  warning: 'text-warning-600',
  info: 'text-info-600',
  brand: 'text-brand-600',
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
        'rounded-xl border border-ink-200 bg-white px-5 py-4 shadow-xs transition-colors hover:border-ink-300',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} className={cn('shrink-0', GLYPH[tone])} aria-hidden />}
        <span className="text-xs font-medium text-ink-500">{label}</span>
      </div>
      {/* Proportional figures: at this size equal-width digits read loose */}
      <p className="mt-2.5 text-3xl font-semibold tracking-[-0.025em] text-ink-900">{value}</p>
      {meta && <p className="mt-1 truncate text-xs text-ink-400">{meta}</p>}
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
