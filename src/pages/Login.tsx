import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RiEyeLine, RiEyeOffLine, RiArrowRightLine } from '@remixicon/react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Alert'
import { SegmentedControl } from '@/components/ui/Tabs'
import { PinInput } from '@/components/ui/PinInput'
import { startSignIn, completeSignIn } from '@/lib/session'
import { signInWithPassword } from '@/lib/auth'
import { isLive } from '@/lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  /* Admin signs in with a password; merchants with the 6-digit MPIN issued on
     approval. Both are Supabase Auth credentials, so this only changes the
     input — not the request. The user picks, which avoids looking the role up
     from an email and telling the internet which addresses exist. */
  const [mode, setMode] = useState<'password' | 'mpin'>('password')
  const [mpin, setMpin] = useState('')
  const secret = mode === 'mpin' ? mpin : password

  // Where the gate turned them away from, carried through to the MPIN step.
  const from = (location.state as { from?: string } | null)?.from
  const ready = Boolean(
    identifier.trim() && (mode === 'mpin' ? mpin.length === 6 : password.length > 0),
  )

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!ready || busy) return
    setError('')

    // No project configured: the console runs on fixtures, so the form is a
    // doorway rather than a check.
    if (!isLive()) {
      startSignIn()
      completeSignIn()
      navigate(from ?? '/dashboard', { replace: true })
      return
    }

    setBusy(true)
    try {
      await signInWithPassword(identifier, secret)
      navigate(from ?? '/dashboard', { replace: true })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not sign you in.'
      setError(
        /invalid login credentials/i.test(message)
          ? mode === 'mpin'
            ? 'That email and MPIN do not match an account.'
            : 'That email and password do not match an account.'
          : message,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-4xl font-semibold tracking-[-0.03em] text-ink-900">Sign in</h1>
      <p className="mt-1.5 text-md text-ink-500">
        Manage credit card bill payments from one console.
      </p>

      <SegmentedControl
        className="mt-6"
        options={[
          { value: 'password', label: 'Password' },
          { value: 'mpin', label: 'MPIN' },
        ]}
        value={mode}
        onChange={(next) => {
          setMode(next)
          setError('')
        }}
      />

      <form className="mt-5 space-y-4" onSubmit={(event) => void submit(event)}>
        {error && (
          <Alert tone="danger" className="mb-2">
            {error}
          </Alert>
        )}
        <Field label="Email address" htmlFor="identifier">
          <Input
            id="identifier"
            name="identifier"
            autoComplete="username"
            placeholder="you@company.com"
            className="h-11"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </Field>

        {mode === 'password' ? (
          <Field label="Password" htmlFor="password">
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-11 pr-11"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
          </Field>
        ) : (
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700">MPIN</p>
            <PinInput
              label="6 digit MPIN"
              value={mpin}
              onChange={setMpin}
              disabled={busy}
            />
            <p className="mt-1.5 text-xs text-ink-500">
              The six digits emailed to you when your account was approved.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="rounded-sm text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            {mode === 'mpin' ? 'Forgot MPIN?' : 'Forgot password?'}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          iconAfter={RiArrowRightLine}
          disabled={!ready || busy}
          className="w-full"
        >
          {busy ? 'Signing in…' : 'Continue'}
        </Button>
      </form>

      <p className="mt-8 border-t border-ink-200 pt-6 text-center text-sm leading-relaxed text-ink-500">
        By signing in you agree to our{' '}
        <Link to="/terms" className="font-medium text-ink-700 underline-offset-2 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="font-medium text-ink-700 underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthLayout>
  )
}
