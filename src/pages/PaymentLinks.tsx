import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiAddLine,
  RiLinkM,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiEyeLine,
  RiSearchLine,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { paymentLinks, paymentLinkSummary, gateways } from '@/data/mock'
import { money, formatDate, formatTime, count } from '@/lib/format'

export default function PaymentLinks() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [gateway, setGateway] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return paymentLinks.filter((row) => {
      if (status !== 'all' && row.status !== status) return false
      if (gateway !== 'all' && `${row.gateway} | ${row.product}` !== gateway) return false
      if (from && row.date < from) return false
      if (to && row.date > `${to}T23:59:59`) return false
      if (!needle) return true
      return [String(row.id), row.customer, row.mobile, row.gateway]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [query, status, gateway, from, to])

  const reset = () => {
    setQuery('')
    setStatus('all')
    setGateway('all')
    setFrom('')
    setTo('')
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Payment Links' }]}
        title="Payment links"
        description="Every link generated for a customer, and where it ended up."
        actions={
          <Button
            as={Link}
            to="/credit-card-payments/load-money"
            variant="primary"
            icon={RiAddLine}
          >
            New link
          </Button>
        }
      />

      <FilterBar onReset={reset} className="mb-4">
        <Field label="Search" htmlFor="link-search" className="w-full sm:w-72">
          <SearchInput
            id="link-search"
            placeholder="Customer name, email or mobile"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="link-status" className="w-full sm:w-40">
          <Select id="link-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </Field>
        <Field label="Gateway" htmlFor="link-gateway" className="w-full sm:w-52">
          <Select id="link-gateway" value={gateway} onChange={(e) => setGateway(e.target.value)}>
            <option value="all">All gateways</option>
            {gateways.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From" htmlFor="link-from" className="w-full sm:w-40">
          <DateInput id="link-from" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="link-to" className="w-full sm:w-40">
          <DateInput id="link-to" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </FilterBar>

      <StatGrid columns={4}>
        <StatCard
          label="Links created"
          value={count(paymentLinkSummary.total)}
          meta={paymentLinkSummary.range}
          icon={RiLinkM}
          tone="brand"
        />
        <StatCard
          label="Collected"
          value={money(paymentLinkSummary.collected)}
          meta="Paid successfully"
          icon={RiCheckboxCircleLine}
          tone="success"
        />
        <StatCard
          label="Awaiting payment"
          value={money(paymentLinkSummary.awaiting)}
          meta="Created, not yet paid"
          icon={RiTimeLine}
          tone="warning"
        />
        <StatCard
          label="Failed links"
          value={count(paymentLinkSummary.failed)}
          meta="Expired or declined"
          icon={RiCloseCircleLine}
          tone="danger"
        />
      </StatGrid>

      <Card className="mt-6">
        <CardHeader
          title="Recent payment links"
          description={`${count(rows.length)} of ${count(paymentLinks.length)} links shown`}
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No links match these filters"
            description="Widen the date range or clear the gateway filter."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH className="w-24">Ref</TH>
                <TH>Date</TH>
                <TH>Gateway</TH>
                <TH>Customer</TH>
                <TH align="right">Amount</TH>
                <TH>Status</TH>
                <TH align="right">Link</TH>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <span className="tnum font-medium text-ink-900">{row.id}</span>
                    </TD>
                    <TD>
                      <CellStack primary={formatDate(row.date)} secondary={formatTime(row.date)} />
                    </TD>
                    <TD>
                      <CellStack primary={row.gateway} secondary={row.product} />
                    </TD>
                    <TD>
                      <CellStack primary={row.customer} secondary={row.mobile} />
                    </TD>
                    <TD align="right">
                      <span className="tnum font-medium text-ink-900">{money(row.amount)}</span>
                    </TD>
                    <TD>
                      <StatusBadge status={row.status} />
                    </TD>
                    <TD align="right">
                      {row.status === 'success' ? (
                        <IconButton
                          icon={RiEyeLine}
                          label={`View link ${row.id}`}
                          size="sm"
                          variant="ghost"
                        />
                      ) : (
                        <span className="text-ink-300" aria-label="No link available">
                          —
                        </span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </TableWrap>
            <CardFooter>
              <p className="tnum text-sm text-ink-500">Showing {count(rows.length)} links</p>
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}
