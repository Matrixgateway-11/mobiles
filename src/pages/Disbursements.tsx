import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiSendPlaneLine,
  RiGroupLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiEyeLine,
  RiSearchLine,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput } from '@/components/ui/Field'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import {
  TableWrap,
  THead,
  TH,
  TBody,
  TR,
  TD,
  CellStack,
  MonoCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { payouts, disbursementSummary } from '@/data/mock'
import { money, formatDate, formatTime, maskAccount, count } from '@/lib/format'

export default function Disbursements() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return payouts.filter((payout) => {
      if (status !== 'all' && payout.status !== status) return false
      if (from && payout.date < from) return false
      if (to && payout.date > `${to}T23:59:59`) return false
      if (!needle) return true
      return [payout.orderId, payout.beneficiary, payout.account, payout.mobile, payout.ifsc]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [query, status, from, to])

  const reset = () => {
    setQuery('')
    setStatus('all')
    setFrom('')
    setTo('')
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Payout' }]}
        title="Disbursements"
        description="Send money from your wallet to a verified beneficiary."
        actions={
          <>
            <Button as={Link} to="/credit-card-payments/bank-list" icon={RiGroupLine}>
              Beneficiaries
            </Button>
            <Button variant="primary" icon={RiSendPlaneLine}>
              New payout
            </Button>
          </>
        }
      />

      <FilterBar onReset={reset} className="mb-4">
        <Field label="Search" htmlFor="payout-search" className="w-full sm:w-72">
          <SearchInput
            id="payout-search"
            placeholder="Order ID, UTR, beneficiary or account"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="payout-status" className="w-full sm:w-44">
          <Select
            id="payout-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </Field>
        <Field label="From" htmlFor="payout-from" className="w-full sm:w-40">
          <DateInput id="payout-from" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="payout-to" className="w-full sm:w-40">
          <DateInput id="payout-to" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </FilterBar>

      <StatGrid columns={3}>
        <StatCard
          label="Settled disbursements"
          value={money(disbursementSummary.settled)}
          meta="Credited to beneficiary accounts"
          icon={RiCheckboxCircleLine}
          tone="success"
        />
        <StatCard
          label="In progress"
          value={money(disbursementSummary.inProgress)}
          meta="Awaiting bank confirmation"
          icon={RiTimeLine}
          tone="warning"
        />
        <StatCard
          label="Failed or refunded"
          value={count(disbursementSummary.failedCount)}
          meta={disbursementSummary.failedRange}
          icon={RiCloseCircleLine}
          tone="danger"
        />
      </StatGrid>

      <Card className="mt-6">
        <CardHeader
          title="Recent payouts"
          description={`${count(rows.length)} of ${count(payouts.length)} payouts`}
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No payouts match these filters"
            description="Try a wider date range, or clear the search to see every payout."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH>Order ID</TH>
                <TH>Date</TH>
                <TH>Beneficiary</TH>
                <TH>Mobile</TH>
                <TH>Mode</TH>
                <TH align="right">Amount</TH>
                <TH>Status</TH>
                <TH align="right">Action</TH>
              </THead>
              <TBody>
                {rows.map((payout) => (
                  <TR key={payout.orderId}>
                    <TD>
                      <MonoCell className="text-ink-900">{payout.orderId}</MonoCell>
                    </TD>
                    <TD>
                      <CellStack
                        primary={formatDate(payout.date)}
                        secondary={formatTime(payout.date)}
                      />
                    </TD>
                    <TD className="max-w-64">
                      <CellStack
                        primary={payout.beneficiary}
                        secondary={`${maskAccount(payout.account)} · ${payout.ifsc}`}
                      />
                    </TD>
                    <TD>
                      <span className="tnum text-ink-700">{payout.mobile}</span>
                    </TD>
                    <TD>
                      <Badge tone="neutral">{payout.mode}</Badge>
                    </TD>
                    <TD align="right">
                      <span className="tnum font-medium text-ink-900">{money(payout.amount)}</span>
                    </TD>
                    <TD>
                      <StatusBadge status={payout.status} />
                    </TD>
                    <TD align="right">
                      <Button size="sm" variant="ghost" icon={RiEyeLine}>
                        View
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </TableWrap>
            <CardFooter>
              <p className="tnum text-sm text-ink-500">
                Showing {count(rows.length)} payouts
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}
