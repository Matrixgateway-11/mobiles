import type { ReactNode } from 'react'
import { RiResetLeftLine, RiSearchLine } from '@remixicon/react'
import { Button } from './Button'
import { cn } from '@/lib/cn'

/** Filters sit on one wrapping row with the actions trailing, rather than
    stacking into a second block the way the original console does. */
export function FilterBar({
  children,
  onReset,
  onSubmit,
  submitLabel = 'Search',
  extraActions,
  className,
}: {
  children: ReactNode
  onReset?: () => void
  onSubmit?: () => void
  submitLabel?: string
  extraActions?: ReactNode
  className?: string
}) {
  return (
    <form
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-white px-5 py-4 shadow-xs',
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.()
      }}
      onReset={(event) => {
        event.preventDefault()
        onReset?.()
      }}
    >
      {children}
      <div className="ml-auto flex items-center gap-2 pb-px">
        {extraActions}
        {onReset && (
          <Button type="reset" icon={RiResetLeftLine} variant="ghost">
            Reset
          </Button>
        )}
        <Button type="submit" icon={RiSearchLine} variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
