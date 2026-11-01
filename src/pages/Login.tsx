import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiEyeLine, RiEyeOffLine, RiArrowRightLine } from '@remixicon/react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate('/mpin')
  }

  return (
    <AuthLayout>
      <h1 className="text-4xl font-semibold tracking-[-0.03em] text-ink-900">Sign in</h1>
      <p className="mt-1.5 text-md text-ink-500">
        Manage credit card bill payments from one console.
      </p>

      <form className="mt-8 space-y-4" onSubmit={submit}>
        <Field label="Email or mobile number" htmlFor="identifier">
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

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="rounded-sm text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" iconAfter={RiArrowRightLine} className="w-full">
          Continue
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
