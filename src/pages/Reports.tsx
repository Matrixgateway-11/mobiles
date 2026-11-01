import { useMemo, useState } from 'react'
import {
  RiLinkM,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiFileTextLine,
  RiEyeLine,
  RiSearchLine,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput } from '@/components/ui/Field'
import { Tabs, SegmentedControl } from '@/components/ui/Tabs'
import { StatusBadge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarSeriesChart } from '@/components/BarSeriesChart'
import {
  paymentLinks,
  paymentLinkSummary,
  gateways,
  monthlyVolume,
  yearlyVolume,
} from '@/data/mock'
import { money, formatDate, formatTime, count } from '@/lib/format'

const SCOPES = [
  { value: 'mine', label: 'My report' },
  { value: 'team', label: 'My team report' },
] as const

const GRAINS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

export default function Reports() {
  const [scope, setScope] = useState<(typeof SCOPES)[number]['value']>('mine')
  const [grain, setGrain] = useState<(typeof GRAINS)[number]['value']>('monthly')

  const [reportType, setReportType] = useState('payin')
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
      return [String(row.id), row.customer, row.mobile].join(' ').toLowerCase().includes(needle)
    })
  }, [query, status, gateway, from, to])

  const reset = () => {
    setQuery('')
    setStatus('all')
    setGateway('all')
    setFrom('')
    setTo('')
  }

  const series = (grain === 'monthly' ? monthlyVolume : yearlyVolume).map((d) => ({
    label: d.month,
    value: d.value,
  }))

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Reports' }]}
        title="Reports"
        description="Browse, filter and download transaction reports across payment gateways."
      />

      <Tabs tabs={SCOPES} value={scope} onChange={setScope} className="mb-5" />

      {/* One filter row above everything it scopes — chart and table share it */}
      <FilterBar
        onReset={reset}
        submitLabel="Apply"
        extraActions={<Button icon={RiFileTextLine}>Download CSV</Button>}
        className="mb-4"
      >
        <Field label="Report type" htmlFor="report-type" className="w-full sm:w-48">
          <Select
            id="report-type"
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
          >
            <option value="payin">Payin report</option>
            <option value="payout">Payout report</option>
            <option value="commission">Commission report</option>
          </Select>
        </Field>
        <Field label="Search" htmlFor="report-search" className="w-full sm:w-64">
          <SearchInput
            id="report-search"
            placeholder="Customer name, email or mobile"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="report-status" className="w-full sm:w-40">
          <Select id="report-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </Select>
        </Field>
        <Field label="Gateway" htmlFor="report-gateway" className="w-full sm:w-52">
          <Select id="report-gateway" value={gateway} onChange={(e) => setGateway(e.target.value)}>
            <option value="all">All gateways</option>
            {gateways.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From" htmlFor="report-from" className="w-full sm:w-40">
          <DateInput id="report-from" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="report-to" className="w-full sm:w-40">
          <DateInput id="report-to" value={to} onChange={(e) => setTo(e.target.value)} />
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
          title="Transactions overview"
          description={
            grain === 'monthly'
              ? 'Successful payin amount, last 12 months'
              : 'Successful payin amount by year'
          }
          actions={<SegmentedControl options={GRAINS} value={grain} onChange={setGrain} />}
        />
        <div className="flex items-baseline gap-2 px-5 pt-5">
          <span className="text-4xl font-semibold tracking-[-0.025em] text-ink-900">
            {money(paymentLinkSummary.collected)}
          </span>
          <span className="text-sm text-ink-500">collected in period</span>
        </div>
        <div className="px-2 pb-4">
          <BarSeriesChart data={series} emptyMessage="No volume in this period." />
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader
          title={scope === 'mine' ? 'My transactions' : 'Team transactions'}
          description={`${count(rows.length)} records match the current filters`}
        />
        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="Nothing to report for this slice"
            description="Adjust the report type or widen the date range."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
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
                      <span className="text-ink-300">—</span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableWrap>
        )}
      </Card>
    </>
  )
}
