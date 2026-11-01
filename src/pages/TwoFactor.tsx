import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiShieldKeyholeLine, RiSmartphoneLine, RiArrowLeftLine } from '@remixicon/react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { PinInput } from '@/components/ui/PinInput'
import { CopyButton } from '@/components/ui/DataList'
import { useAuthState, signOutOfSupabase } from '@/lib/auth'
import { signOut } from '@/lib/session'
import {
  factorState,
  startEnrollment,
  verifyCode,
  readableMfaError,
  type Enrollment,
  type FactorState,
} from '@/lib/mfa'

/* The second step of signing in.

   Either the account already has an authenticator, in which case this asks for
   a code, or it does not, in which case it shows a QR to scan first. Both end
   the same way: a verified code lifts the session to aal2, which is the only
   thing that opens the console. */

export default function TwoFactor() {
  const navigate = useNavigate()
  const { profile, session, loading } = useAuthState()

  const [state, setState] = useState<FactorState | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Nobody should land here without having passed the password step.
  useEffect(() => {
    if (!loading && !session) navigate('/login', { replace: true })
  }, [loading, session, navigate])

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    void (async () => {
      try {
        const next = await factorState(profile.role)
        if (cancelled) return
        if (next.kind === 'satisfied') {
          navigate('/dashboard', { replace: true })
          return
        }
        setState(next)
        if (next.kind === 'enroll') setEnrollment(await startEnrollment())
      } catch (caught) {
        if (!cancelled) setError(readableMfaError(caught))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [profile, navigate])

  const submit = async (value: string) => {
    const factorId = state?.kind === 'challenge' ? state.factorId : enrollment?.factorId
    if (!factorId || busy) return

    setBusy(true)
    setError('')
    try {
      await verifyCode(factorId, value)
      navigate('/dashboard', { replace: true })
    } catch (caught) {
      setError(readableMfaError(caught))
      // Wrong code: clear the boxes so the next attempt starts clean rather
      // than making them backspace six times.
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  const abandon = () => {
    void signOutOfSupabase()
    signOut()
    navigate('/login', { replace: true })
  }

  const enrolling = state?.kind === 'enroll'

  return (
    <AuthLayout>
      <span
        className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
        aria-hidden
      >
        <RiShieldKeyholeLine size={20} />
      </span>

      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-ink-900">
        {enrolling ? 'Set up your authenticator' : 'Enter your code'}
      </h1>
      <p className="mt-1.5 text-md leading-relaxed text-ink-500">
        {enrolling
          ? 'Scan this with Google Authenticator, then type the six digits it shows. You will need the app each time you sign in.'
          : 'Six digits from your authenticator app. They change every 30 seconds.'}
      </p>

      {error && (
        <Alert tone="danger" className="mt-5">
          {error}
        </Alert>
      )}

      {enrolling && enrollment && (
        <div className="mt-6 rounded-xl border border-ink-200 bg-white p-5">
          <img
            src={enrollment.qr}
            alt="QR code for your authenticator app"
            className="mx-auto block size-44"
          />
          <div className="mt-4 border-t border-ink-100 pt-4">
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <RiSmartphoneLine size={15} className="text-ink-400" aria-hidden />
              Cannot scan?
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-ink-200 bg-ink-25 px-3 py-2 font-mono text-xs text-ink-700">
                {enrollment.secret}
              </code>
              <CopyButton value={enrollment.secret} label="setup key" />
            </div>
            <p className="mt-1.5 text-xs text-ink-500">
              Enter this key into the app by hand instead.
            </p>
          </div>
        </div>
      )}

      {(state?.kind === 'challenge' || enrollment) && (
        <div className="mt-6">
          <PinInput
            label="6 digit authentication code"
            value={code}
            onChange={setCode}
            onComplete={(value) => void submit(value)}
            disabled={busy}
            autoFocus
          />
          <p className="mt-2 text-sm text-ink-500">
            {busy ? 'Checking…' : 'It submits itself once the sixth digit is in.'}
          </p>
        </div>
      )}

      {!state && !error && <p className="mt-6 text-base text-ink-500">Checking your account…</p>}

      <button
        type="button"
        onClick={abandon}
        className="mt-8 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <RiArrowLeftLine size={15} />
        Back to sign in
      </button>
    </AuthLayout>
  )
}
