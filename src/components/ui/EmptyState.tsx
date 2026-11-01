import type { ReactNode } from 'react'
import type { RemixiconComponentType } from '@remixicon/react'
import { cn } from '@/lib/cn'

type EmptyStateProps = {
  icon: RemixiconComponentType
  title: string
  description?: string
  action?: ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-12' : 'py-20',
        className,
      )}
    >
      <span
        className="inline-flex size-11 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-ink-400"
        aria-hidden
      >
        <Icon size={20} />
      </span>
      <p className="mt-4 text-md font-medium text-ink-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-base text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
