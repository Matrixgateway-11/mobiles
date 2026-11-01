import { cn } from '@/lib/cn'

type TabsProps<T extends string> = {
  tabs: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('border-b border-ink-200', className)} role="tablist">
      <div className="-mb-px flex items-center gap-6">
        {tabs.map((tab) => {
          const active = tab.value === value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.value)}
              className={cn(
                'relative -mb-px border-b-2 pb-2.5 text-base font-medium transition-colors',
                active
                  ? 'border-brand-700 text-ink-900'
                  : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Compact segmented control — Monthly / Yearly on the reports chart. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      className={cn('inline-flex items-center gap-0.5 rounded-lg bg-ink-100 p-0.5', className)}
      role="group"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[0.3125rem] px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-white text-ink-900 shadow-xs'
                : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
