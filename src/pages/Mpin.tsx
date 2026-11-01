import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RiArrowLeftLine, RiShieldKeyholeLine } from '@remixicon/react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { completeSignIn, signOut } from '@/lib/session'
import { cn } from '@/lib/cn'

const LENGTH = 6

export default function Mpin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // Land them where they were originally headed, not always the dashboard.
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const complete = digits.every(Boolean)

  const setDigit = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (!value) return setDigit(index, '')

    // A pasted or fast-typed run fills forward from the current box
    const chars = value.split('').slice(0, LENGTH - index)
    setDigits((prev) => {
      const next = [...prev]
      chars.forEach((char, offset) => {
        next[index + offset] = char
      })
      return next
    })
    inputs.current[Math.min(index + chars.length, LENGTH - 1)]?.focus()
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      setDigit(index - 1, '')
      inputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!complete) return
    completeSignIn()
    navigate(from, { replace: true })
  }

  return (
    <AuthLayout>
      <span
        className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
        aria-hidden
      >
        <RiShieldKeyholeLine size={20} />
      </span>

      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-ink-900">
        Enter your MPIN
      </h1>
      <p className="mt-1.5 text-md text-ink-500">
        Six digits to finish signing in. This keeps payouts behind a second factor.
      </p>

      <form className="mt-8" onSubmit={submit}>
        <div className="flex gap-2" role="group" aria-label="6 digit MPIN">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element
              }}
              type="password"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${index + 1}`}
              maxLength={LENGTH}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onFocus={(event) => event.currentTarget.select()}
              className={cn(
                'h-13 w-full min-w-0 rounded-lg border bg-white text-center text-xl font-semibold text-ink-900',
                'transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none',
                digit ? 'border-ink-300' : 'border-ink-200',
              )}
            />
          ))}
        </div>

        <div className="mt-3 flex justify-end">
          <Link
            to="/forgot-mpin"
            className="rounded-sm text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            Forgot MPIN?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!complete}
          className="mt-5 w-full"
        >
          Verify &amp; sign in
        </Button>
      </form>

      <Link
        to="/login"
        onClick={signOut}
        className="mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <RiArrowLeftLine size={15} />
        Back to sign in
      </Link>
    </AuthLayout>
  )
}
