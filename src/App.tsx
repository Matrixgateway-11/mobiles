import { Suspense, lazy, type ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { getStage } from '@/lib/session'
import { useCurrentAccount } from '@/lib/network'
import { AuthProvider } from '@/lib/AuthContext'
import { useAuthState } from '@/lib/auth'
import { isLive } from '@/lib/supabase'

import Login from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotCredential'

import Dashboard from '@/pages/Dashboard'
import Overview from '@/pages/Overview'
import LoadMoney from '@/pages/LoadMoney'
import Disbursements from '@/pages/Disbursements'
import BankList from '@/pages/BankList'
import PaymentLinks from '@/pages/PaymentLinks'
import WalletLedger from '@/pages/WalletLedger'
import QrTransactions from '@/pages/QrTransactions'
import MyTeam from '@/pages/MyTeam'
import AddUser from '@/pages/AddUser'
import Tickets from '@/pages/Tickets'
import Help from '@/pages/Help'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import { Terms, Privacy } from '@/pages/Placeholder'

// The two charting screens are the only ones that pull in Recharts, so they load
// on demand instead of riding along in the bundle every other page pays for.
const Reports = lazy(() => import('@/pages/Reports'))
const Commission = lazy(() => import('@/pages/Commission'))

// The applicant's form is never opened by signed-in staff, and the invitations
// inbox only by the two roles that can onboard — neither belongs in the chunk
// every page pays for.
const PublicOnboarding = lazy(() => import('@/pages/PublicOnboarding'))
const Invitations = lazy(() => import('@/pages/Invitations'))

/** Holds the page's shape while a lazy route resolves, so nothing jumps. */
function PageSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 rounded-lg bg-ink-200" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-ink-100" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-xl border border-ink-200 bg-white" />
        ))}
      </div>
      <div className="mt-6 h-80 rounded-xl border border-ink-200 bg-white" />
    </div>
  )
}

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

function RequireSession({ children }: { children: ReactElement }) {
  const location = useLocation()
  const { session, profile, loading } = useAuthState()

  if (isLive()) {
    if (loading) return <Splash />
    if (!session) {
      return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    }
    if (!profile) return <NoProfile />
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
              <AppLayout />
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
              <Suspense fallback={<PageSkeleton />}>
                <Reports />
              </Suspense>
            }
          />

          <Route path="/qr-payments/transactions" element={<QrTransactions />} />
          <Route
            path="/commission"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Commission />
              </Suspense>
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
                <Suspense fallback={<PageSkeleton />}>
                  <Invitations />
                </Suspense>
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
