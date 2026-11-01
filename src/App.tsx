import { Suspense, lazy, type ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { getStage, signOut } from '@/lib/session'
import { useCurrentAccount } from '@/lib/network'
import { AuthProvider } from '@/lib/AuthContext'
import { useAuthState, signOutOfSupabase } from '@/lib/auth'
import { requiresTotp } from '@/lib/mfa'
import { isLive } from '@/lib/supabase'
import type { Account } from '@/data/network'

import Login from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotCredential'

import Dashboard from '@/pages/Dashboard'
import NotFound from '@/pages/NotFound'
import { Terms, Privacy } from '@/pages/Placeholder'

// The two charting screens are the only ones that pull in Recharts, so they load
// on demand instead of riding along in the bundle every other page pays for.
const Reports = lazy(() => import('@/pages/Reports'))
const Commission = lazy(() => import('@/pages/Commission'))

// The applicant's form is never opened by signed-in staff, and the invitations
// inbox only by the two roles that can onboard — neither belongs in the chunk
// every page pays for.
const Overview = lazy(() => import('@/pages/Overview'))
const LoadMoney = lazy(() => import('@/pages/LoadMoney'))
const Disbursements = lazy(() => import('@/pages/Disbursements'))
const BankList = lazy(() => import('@/pages/BankList'))
const PaymentLinks = lazy(() => import('@/pages/PaymentLinks'))
const WalletLedger = lazy(() => import('@/pages/WalletLedger'))
const QrTransactions = lazy(() => import('@/pages/QrTransactions'))
const MyTeam = lazy(() => import('@/pages/MyTeam'))
const AddUser = lazy(() => import('@/pages/AddUser'))
const Tickets = lazy(() => import('@/pages/Tickets'))
const Help = lazy(() => import('@/pages/Help'))
const Settings = lazy(() => import('@/pages/Settings'))
const TwoFactor = lazy(() => import('@/pages/TwoFactor'))
const PublicOnboarding = lazy(() => import('@/pages/PublicOnboarding'))
const Invitations = lazy(() => import('@/pages/Invitations'))

/* Route gates.

   Against a real project the only question is whether Supabase has a session.
   On fixtures it falls back to the local stage, so the console stays
   reviewable before the backend is wired in. */

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50">
      <p className="text-base text-ink-500">Checking your session…</p>
    </div>
  )
}

/** Signed in to Supabase, but nobody has onboarded this user. Better to say so
    than to drop them into a console with no identity. */
function NoProfile() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="max-w-md rounded-xl border border-ink-200 bg-white p-8 text-center shadow-xs">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
          No account attached
        </h1>
        <p className="mt-2 text-base leading-relaxed text-ink-500">
          You are signed in, but this login is not linked to a merchant account yet. Whoever
          invited you needs to approve the application first.
        </p>
        <a
          href="/login"
          className="mt-5 inline-flex h-9 items-center rounded-lg border border-ink-200 px-3.5 text-base font-medium text-ink-800 hover:bg-ink-50"
        >
          Back to sign in
        </a>
      </div>
    </div>
  )
}

/** Suspending an account does not take the password away -- the admin closed
    the account, not the credential -- so the check has to sit here, where every
    console route passes. Without it the switch in Manage account moved a badge
    and nothing else, while the dialog beside it promised the opposite. */
function Suspended({ account }: { account: Account }) {
  const banned = account.status === 'banned'
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="max-w-md rounded-xl border border-ink-200 bg-white p-8 text-center shadow-xs">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
          {banned ? 'This account is closed' : 'This account is on hold'}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-ink-500">
          {banned
            ? 'Sai Mobiles has closed this account, and payments through it have stopped.'
            : 'Sai Mobiles has put this account on hold, so it cannot transact for now.'}{' '}
          Talk to whoever onboarded you if you think that is wrong.
        </p>
        <button
          type="button"
          onClick={() => {
            void signOutOfSupabase()
            signOut()
          }}
          className="mt-5 inline-flex h-9 items-center rounded-lg border border-ink-200 px-3.5 text-base font-medium text-ink-800 transition-colors hover:bg-ink-50"
        >
          Back to sign in
        </button>
      </div>
    </div>
  )
}

function RequireActive({ children }: { children: ReactElement }) {
  const account = useCurrentAccount()
  if (account.status !== 'active') return <Suspended account={account} />
  return children
}

function RequireSession({ children }: { children: ReactElement }) {
  const location = useLocation()
  const { session, profile, aal, loading } = useAuthState()

  if (isLive()) {
    if (loading) return <Splash />
    if (!session) {
      return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    }
    if (!profile) return <NoProfile />
    // The password alone is not enough for anyone who owes a second factor.
    // RLS refuses them anyway; this is so they meet the screen, not a 403.
    if (requiresTotp(profile.role) && aal !== 'aal2') {
      return <Navigate to="/two-factor" replace />
    }
    return children
  }

  if (getStage() !== 'signed-in') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

function RedirectIfSignedIn({ children }: { children: ReactElement }) {
  const { session, loading } = useAuthState()

  if (isLive()) {
    if (loading) return <Splash />
    return session ? <Navigate to="/dashboard" replace /> : children
  }

  return getStage() === 'signed-in' ? <Navigate to="/dashboard" replace /> : children
}

/** User Management does not exist for a retailer — there is nobody below them
    to manage. Typing the URL lands on the dashboard rather than a 403. */
function RequireManager({ children }: { children: ReactElement }) {
  const account = useCurrentAccount()
  if (account.role === 'retailer') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfSignedIn>
              <Login />
            </RedirectIfSignedIn>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/two-factor"
          element={
            <Suspense fallback={null}>
              <TwoFactor />
            </Suspense>
          }
        />

        {/* Reached by token alone — the applicant has no account yet. */}
        <Route
          path="/onboard/:token"
          element={
            <Suspense fallback={null}>
              <PublicOnboarding />
            </Suspense>
          }
        />

        {/* The sign-in page links to these, so they stay outside the gate. */}
        <Route
          path="/terms"
          element={
            <PublicLayout>
              <Terms />
            </PublicLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <PublicLayout>
              <Privacy />
            </PublicLayout>
          }
        />

        <Route
          element={
            <RequireSession>
              <RequireActive>
                <AppLayout />
              </RequireActive>
            </RequireSession>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/credit-card-payments"
            element={<Navigate to="/credit-card-payments/overview" replace />}
          />
          <Route path="/credit-card-payments/overview" element={<Overview />} />
          <Route path="/credit-card-payments/load-money" element={<LoadMoney />} />
          <Route path="/credit-card-payments/disbursements" element={<Disbursements />} />
          <Route path="/credit-card-payments/bank-list" element={<BankList />} />
          <Route path="/credit-card-payments/payment-links" element={<PaymentLinks />} />
          <Route path="/credit-card-payments/wallet-ledger" element={<WalletLedger />} />
          <Route
            path="/credit-card-payments/reports"
            element={
                <Reports />
            }
          />

          <Route path="/qr-payments/transactions" element={<QrTransactions />} />
          <Route
            path="/commission"
            element={
                <Commission />
            }
          />

          <Route
            path="/users"
            element={
              <RequireManager>
                <MyTeam />
              </RequireManager>
            }
          />
          <Route
            path="/users/add"
            element={
              <RequireManager>
                <AddUser />
              </RequireManager>
            }
          />
          <Route
            path="/users/invitations"
            element={
              <RequireManager>
                <Invitations />
              </RequireManager>
            }
          />

          <Route path="/tickets" element={<Tickets />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
