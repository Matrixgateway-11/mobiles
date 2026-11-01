import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

import Login from '@/pages/Login'
import Mpin from '@/pages/Mpin'
import { ForgotPassword, ForgotMpin } from '@/pages/ForgotCredential'

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mpin" element={<Mpin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-mpin" element={<ForgotMpin />} />

        <Route element={<AppLayout />}>
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

          <Route path="/users" element={<MyTeam />} />
          <Route path="/users/add" element={<AddUser />} />

          <Route path="/tickets" element={<Tickets />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
