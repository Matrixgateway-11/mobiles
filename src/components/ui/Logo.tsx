import { cn } from '@/lib/cn'

/** Wordmark drawn in CSS so it stays crisp at every size and in both the
    maroon sidebar and the white auth panel. */
export function Logo({
  variant = 'light',
  showTagline = false,
  className,
}: {
  variant?: 'light' | 'dark'
  showTagline?: boolean
  className?: string
}) {
  const onDark = variant === 'light'
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-md',
          'text-[0.6875rem] font-bold tracking-[0.02em]',
          onDark ? 'bg-brand-600 text-white' : 'bg-brand-600 text-white',
        )}
        aria-hidden
      >
        SM
      </span>
      <span className="flex flex-col leading-none">
        {/* Two words, so the tracking eases off — at 0.1em the gap between
            them opens into a hole. */}
        <span
          className={cn(
            'text-[0.9375rem] font-bold tracking-[0.07em] uppercase',
            onDark ? 'text-white' : 'text-ink-900',
          )}
        >
          Sai Mobiles
        </span>
        {showTagline && (
          <span
            className={cn(
              'mt-1 text-[0.5rem] font-medium tracking-[0.18em] uppercase',
              onDark ? 'text-white/55' : 'text-ink-400',
            )}
          >
            Powering seamless payments
          </span>
        )}
      </span>
    </span>
  )
}
