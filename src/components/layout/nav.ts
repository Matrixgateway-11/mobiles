import {
  RiLayoutGridLine,
  RiBankCardLine,
  RiQrCodeLine,
  RiPercentLine,
  RiTeamLine,
  RiInboxLine,
  RiTicket2Line,
  RiQuestionLine,
  RiSettings3Line,
  type RemixiconComponentType,
} from '@remixicon/react'
import type { Role } from '@/data/network'

export type NavLeaf = { label: string; to: string; badge?: number }

export type NavItem = {
  label: string
  icon: RemixiconComponentType
  to?: string
  badge?: number
  children?: NavLeaf[]
}

export type NavSection = { label: string; items: NavItem[] }

const CONSOLE: NavSection = {
  label: 'Main menu',
  items: [
    { label: 'Dashboard', icon: RiLayoutGridLine, to: '/dashboard' },
    {
      label: 'Credit Card Payments',
      icon: RiBankCardLine,
      children: [
        { label: 'Overview', to: '/credit-card-payments/overview' },
        { label: 'Load Money', to: '/credit-card-payments/load-money' },
        { label: 'Disbursements', to: '/credit-card-payments/disbursements' },
        { label: 'Bank List', to: '/credit-card-payments/bank-list' },
        { label: 'Payment Links', to: '/credit-card-payments/payment-links' },
        { label: 'Wallet Ledger', to: '/credit-card-payments/wallet-ledger' },
        { label: 'Reports', to: '/credit-card-payments/reports' },
      ],
    },
    {
      label: 'QR Payments',
      icon: RiQrCodeLine,
      children: [{ label: 'QR Transactions', to: '/qr-payments/transactions' }],
    },
    { label: 'Commission', icon: RiPercentLine, to: '/commission' },
  ],
}

const SUPPORT: NavSection = {
  label: 'Support',
  items: [
    { label: 'Tickets', icon: RiTicket2Line, to: '/tickets' },
    { label: 'Help & Support', icon: RiQuestionLine, to: '/help' },
    { label: 'Account Settings', icon: RiSettings3Line, to: '/settings' },
  ],
}

/** The retailer is the leaf of the hierarchy, so it gets no User Management
    section at all — not a disabled one, not an empty one. There is simply
    nobody for a retailer to manage. */
export function navigationFor(role: Role, pendingInvites = 0): NavSection[] {
  if (role === 'retailer') return [CONSOLE, SUPPORT]

  const network: NavSection = {
    label: role === 'admin' ? 'Network' : 'Users',
    items: [
      /* Invitations sits above User Management, and outside it. It is a queue
         of work waiting on you, not a directory you browse — and a count
         buried inside a collapsed group is a count nobody sees. */
      {
        label: 'Invitations',
        icon: RiInboxLine,
        to: '/users/invitations',
        badge: pendingInvites || undefined,
      },
      {
        label: 'User Management',
        icon: RiTeamLine,
        children: [
          { label: role === 'admin' ? 'All Accounts' : 'My Team & Activity', to: '/users' },
          { label: 'Add User', to: '/users/add' },
        ],
      },
    ],
  }

  return [CONSOLE, network, SUPPORT]
}
