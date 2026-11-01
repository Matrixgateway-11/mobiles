import { Link } from 'react-router-dom'
import {
  RiAddLine,
  RiSendPlaneLine,
  RiUserAddLine,
  RiWallet3Line,
  RiArrowDownLine,
  RiArrowUpLine,
  RiArrowRightLine,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { LedgerTypeBadge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack } from '@/components/ui/Table'
import { recentActivity, walletSummary, merchant } from '@/data/mock'
import { money, signedMoney, formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/cn'

export default function Overview() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Overview' }]}
        title="Overview"
        description={`Welcome back, ${merchant.name}.`}
        actions={
          <>
            <Button as={Link} to="/credit-card-payments/load-money" variant="primary" icon={RiAddLine}>
              Load money
            </Button>
            <Button as={Link} to="/credit-card-payments/disbursements" icon={RiSendPlaneLine}>
              Disburse
            </Button>
            <Button as={Link} to="/credit-card-payments/bank-list" icon={RiUserAddLine}>
              Add bank account
            </Button>
          </>
        }
      />

      <StatGrid columns={3}>
        <StatCard
          label="Wallet balance"
          value={money(walletSummary.balance)}
          meta="Available for disbursement"
          icon={RiWallet3Line}
          tone="brand"
        />
        <StatCard
          label="Total credit"
          value={money(walletSummary.totalCredit)}
          meta="Lifetime payins and reversals"
          icon={RiArrowDownLine}
          tone="success"
        />
        <StatCard
          label="Total debit"
          value={money(walletSummary.totalDebit)}
          meta="Lifetime payouts and fees"
          icon={RiArrowUpLine}
          tone="neutral"
        />
      </StatGrid>

      <Card className="mt-6">
        <CardHeader
          title="Recent transactions"
          description="The last movements across your credit card payments wallet."
          actions={
            <Button
              as={Link}
              to="/credit-card-payments/wallet-ledger"
              size="sm"
              variant="ghost"
              iconAfter={RiArrowRightLine}
            >
              Full ledger
            </Button>
          }
        />
        <TableWrap>
          <THead>
            <TH className="w-48">Date &amp; time</TH>
            <TH className="w-28">Type</TH>
            <TH align="right" className="w-44">
              Amount
            </TH>
            <TH>Description</TH>
          </THead>
          <TBody>
            {recentActivity.map((row, index) => (
              <TR key={`${row.date}-${index}`}>
                <TD>
                  <CellStack primary={formatDate(row.date)} secondary={formatTime(row.date)} />
                </TD>
                <TD>
                  <LedgerTypeBadge type={row.type} />
                </TD>
                <TD align="right">
                  <span
                    className={cn(
                      'tnum font-medium',
                      row.amount >= 0 ? 'text-success-700' : 'text-ink-900',
                    )}
                  >
                    {signedMoney(row.amount)}
                  </span>
                </TD>
                <TD>
                  <CellStack primary={row.description} secondary={row.note} />
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
      </Card>
    </>
  )
}
