import {
  RiLayoutGridLine,
  RiBankCardLine,
  RiQrCodeLine,
  RiPercentLine,
  RiTeamLine,
  RiTicket2Line,
  RiQuestionLine,
  RiSettings3Line,
  type RemixiconComponentType,
} from '@remixicon/react'

export type NavLeaf = { label: string; to: string }

export type NavItem = {
  label: string
  icon: RemixiconComponentType
  to?: string
  children?: NavLeaf[]
}

export type NavSection = { label: string; items: NavItem[] }

export const navigation: NavSection[] = [
  {
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
  },
  {
    label: 'Users',
    items: [
      {
        label: 'User Management',
        icon: RiTeamLine,
        children: [
          { label: 'My Team & Activity', to: '/users' },
          { label: 'Add User', to: '/users/add' },
        ],
      },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Tickets', icon: RiTicket2Line, to: '/tickets' },
      { label: 'Help & Support', icon: RiQuestionLine, to: '/help' },
      { label: 'Account Settings', icon: RiSettings3Line, to: '/settings' },
    ],
  },
]
