import { useRef } from 'react'
import { cn } from '@/lib/cn'

/* One box per digit, for the MPIN merchants sign in with.

   The fiddly parts are the ones people actually hit: pasting the whole code
   into any box fills forward from there, backspace on an empty box clears the
   one before it and moves back, and the arrows walk between boxes. */

export function PinInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  label,
}: {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  label: string
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focus = (index: number) => inputs.current[Math.max(0, Math.min(index, length - 1))]?.focus()

  const write = (next: string) => onChange(next.replace(/\D/g, '').slice(0, length))

  const handleChange = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, '')
    if (!typed) {
      write(value.slice(0, index) + value.slice(index + 1))
      return
    }
    // A paste or a fast run of keys fills forward from this box.
    const next = (value.slice(0, index) + typed + value.slice(index + typed.length)).slice(0, length)
    write(next)
    focus(index + typed.length)
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      write(value.slice(0, index - 1) + value.slice(index))
      focus(index - 1)
    }
    if (event.key === 'ArrowLeft') focus(index - 1)
    if (event.key === 'ArrowRight') focus(index + 1)
  }

  return (
    <div className="flex gap-2" role="group" aria-label={label}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element
          }}
          type="password"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1}`}
          disabled={disabled}
          maxLength={length}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            'h-13 w-full min-w-0 rounded-lg border bg-white text-center text-xl font-semibold text-ink-900',
            'transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none',
            'disabled:bg-ink-50 disabled:text-ink-400',
            digit ? 'border-ink-300' : 'border-ink-200',
          )}
        />
      ))}
    </div>
  )
}
