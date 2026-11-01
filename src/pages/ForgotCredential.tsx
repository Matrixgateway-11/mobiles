import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine, RiMailSendLine, RiCheckLine } from '@remixicon/react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export function ForgotCredential({ kind }: { kind: 'password' | 'mpin' }) {
  const [sent, setSent] = useState(false)
  const [identifier, setIdentifier] = useState('')

  const label = kind === 'password' ? 'password' : 'MPIN'

  return (
    <AuthLayout>
      {sent ? (
        <>
          <span
            className="inline-flex size-10 items-center justify-center rounded-xl bg-success-50 text-success-700"
            aria-hidden
          >
            <RiCheckLine size={20} />
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-ink-900">
            Check your messages
          </h1>
          <p className="mt-1.5 text-md leading-relaxed text-ink-500">
            If an account exists for <span className="font-medium text-ink-800">{identifier}</span>,
            a one-time code to reset your {label} is on its way. It expires in 10 minutes.
          </p>
          <Button className="mt-6 w-full" onClick={() => setSent(false)}>
            Use a different account
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-ink-900">
            Reset your {label}
          </h1>
          <p className="mt-1.5 text-md text-ink-500">
            We'll send a one-time code to the email and mobile on your account.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (identifier.trim()) setSent(true)
            }}
          >
            <Field label="Email or mobile number" htmlFor="recover-id">
              <Input
                id="recover-id"
                autoComplete="username"
                placeholder="you@company.com"
                className="h-11"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="primary" size="lg" icon={RiMailSendLine} className="w-full">
              Send code
            </Button>
          </form>
        </>
      )}

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <RiArrowLeftLine size={15} />
        Back to sign in
      </Link>
    </AuthLayout>
  )
}

export function ForgotPassword() {
  return <ForgotCredential kind="password" />
}

