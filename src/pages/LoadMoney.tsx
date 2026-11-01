import { Link } from 'react-router-dom'
import { RiBankCardLine, RiCustomerService2Line, RiInformationLine } from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function LoadMoney() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Load Money' }]}
        title="Load money"
        description="Collect into your wallet through any gateway enabled on your account."
      />

      <Card>
        <EmptyState
          icon={RiBankCardLine}
          title="No active gateways"
          description="A gateway appears here once it is configured."
          action={
            <Button as={Link} to="/help" variant="primary" icon={RiCustomerService2Line}>
              Request a gateway
            </Button>
          }
        />
      </Card>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-25 px-5 py-4">
        <RiInformationLine size={18} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
        <div>
          <p className="text-base font-medium text-ink-800">What a gateway gives you</p>
          <p className="mt-1 max-w-2xl text-base text-ink-500">
            Each gateway is a separate collection rail with its own limits and settlement cycle.
            Payins land in your wallet net of fees, and every load is traceable from the{' '}
            <Link
              to="/credit-card-payments/wallet-ledger"
              className="font-medium text-brand-700 underline-offset-2 hover:underline"
            >
              wallet ledger
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  )
}
