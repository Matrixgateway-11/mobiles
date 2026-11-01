import { useMemo, useState } from 'react'
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiExchangeFundsLine,
  RiWallet3Line,
  RiLineChartLine,
  RiExchangeLine,
  RiCalendarEventLine,
  RiTrophyLine,
  RiSearchLine,
  RiEyeLine,
  RiDownload2Line,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { Tabs, SegmentedControl } from '@/components/ui/Tabs'
import { Alert } from '@/components/ui/Alert'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput } from '@/components/ui/Field'
import { Badge, LedgerTypeBadge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { BarSeriesChart } from '@/components/BarSeriesChart'
import {
  commissionSummary,
  commissionTxns,
  commissionRates,
  topEarningDays,
  type CommissionSource,
} from '@/data/mock'
import { money, signedMoney, count, formatDate, formatTime } from '@/lib/format'

const TABS = [
  { value: 'wallet', label: 'Commission wallet' },
  { value: 'structure', label: 'Commission structure' },
] as const

const SOURCES: CommissionSource[] = ['QR Payments', 'Utility Payments', 'Credit Card Payments']
const PAGE_SIZE = 10

export default function Commission() {
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('wallet')

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Commission' }]}
        title="Commission"
        description="What you earn, and the rates behind it."
        actions={
          <Button
            variant="primary"
            icon={RiExchangeFundsLine}
            disabled={commissionSummary.withdrawalPaused}
          >
            Transfer to CC wallet
          </Button>
        }
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-6" />

      {tab === 'wallet' ? <WalletTab /> : <StructureTab />}
    </>
  )
}

/* ------------------------------------------------------------------ wallet */

function WalletTab() {
  return (
    <>
      {commissionSummary.withdrawalPaused && (
        <Alert tone="warning" title="Withdrawals are paused" className="mb-6">
          Transfers to your CC wallet are temporarily unavailable while settlement runs are
          reconciled. Commission keeps accruing in the meantime — nothing is lost.
        </Alert>
      )}

      <StatGrid columns={3}>
        <StatCard
          label="Current balance"
          value={money(commissionSummary.balance)}
          meta="Awaiting transfer to CC wallet"
          icon={RiWallet3Line}
          tone="brand"
        />
        <StatCard
          label="Total earned"
          value={money(commissionSummary.totalEarned)}
          meta="Lifetime, across all services"
          icon={RiLineChartLine}
          tone="success"
        />
        <StatCard
          label="Transactions"
          value={count(commissionSummary.transactions)}
          meta="Earning events recorded"
          icon={RiExchangeLine}
          tone="info"
        />
      </StatGrid>

      <StatGrid columns={4} className="mt-4">
        <StatCard
          label="Today, transactions"
          value={count(commissionSummary.todayTransactions)}
          icon={RiCalendarEventLine}
        />
        <StatCard
          label="Today, commission"
          value={money(commissionSummary.todayCommission)}
          icon={RiLineChartLine}
        />
        <StatCard
          label="This month, commission"
          value={money(commissionSummary.monthCommission)}
          icon={RiLineChartLine}
        />
        <StatCard
          label="This month, transactions"
          value={count(commissionSummary.monthTransactions)}
          icon={RiCalendarEventLine}
        />
      </StatGrid>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <OverviewCard className="lg:col-span-2" />
        <TopEarningDays />
      </div>

      <CommissionTable />
    </>
  )
}

/* ------------------------------------------------------------------- chart */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number) => String(n).padStart(2, '0')

const GRAINS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

function OverviewCard({ className }: { className?: string }) {
  const [grain, setGrain] = useState<(typeof GRAINS)[number]['value']>('monthly')
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(10) // November, zero-indexed

  const step = (delta: number) => {
    if (grain === 'yearly') {
      setYear((y) => y + delta)
      return
    }
    const next = month + delta
    if (next < 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else if (next > 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth(next)
    }
  }

  const series = useMemo(() => {
    if (grain === 'yearly') {
      return MONTHS.map((name, index) => ({
        label: name,
        value: total(commissionTxns.filter((t) => t.date.slice(0, 7) === `${year}-${pad(index + 1)}`)),
      }))
    }
    const days = new Date(year, month + 1, 0).getDate()
    const prefix = `${year}-${pad(month + 1)}-`
    return Array.from({ length: days }, (_, index) => ({
      label: String(index + 1),
      value: total(commissionTxns.filter((t) => t.date.slice(0, 10) === prefix + pad(index + 1))),
    }))
  }, [grain, year, month])

  const periodLabel = grain === 'yearly' ? String(year) : `${MONTHS[month]} ${year}`
  const periodTotal = total(series)

  return (
    <Card className={className}>
      <CardHeader
        title="Commission overview"
        description={
          grain === 'yearly' ? 'Earned month by month' : 'Earned day by day'
        }
        actions={<SegmentedControl options={GRAINS} value={grain} onChange={setGrain} />}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-0.5">
          <IconButton
            icon={RiArrowLeftSLine}
            label="Previous period"
            size="sm"
            variant="ghost"
            onClick={() => step(-1)}
          />
          <span className="min-w-[5.5rem] text-center text-sm font-medium text-ink-800">
            {periodLabel}
          </span>
          <IconButton
            icon={RiArrowRightSLine}
            label="Next period"
            size="sm"
            variant="ghost"
            onClick={() => step(1)}
          />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
            {money(periodTotal)}
          </span>
          <span className="text-sm text-ink-500">earned in period</span>
        </div>
      </div>
      <div className="px-2 pb-4">
        <BarSeriesChart
          data={series}
          height={264}
          labels="peak"
          labelFormat={money}
          tickInterval={grain === 'monthly' ? 2 : 0}
          emptyMessage={`No commission earned in ${periodLabel}.`}
        />
      </div>
    </Card>
  )
}

function TopEarningDays() {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Top earning days"
        actions={<span className="text-xs font-medium text-ink-400">All time</span>}
      />
      <CardBody className="flex-1 p-0">
        <ol className="divide-y divide-ink-100">
          {topEarningDays.map((day, index) => (
            <li key={day.date} className="flex items-center gap-3 px-5 py-3">
              <span
                className="tnum inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-xs font-semibold text-ink-600"
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-base text-ink-800">
                {formatDate(day.date)}
              </span>
              <span className="tnum text-base font-semibold text-success-700">
                {money(day.amount)}
              </span>
            </li>
          ))}
        </ol>
      </CardBody>
      <CardFooter className="justify-start gap-2 text-sm text-ink-500">
        <RiTrophyLine size={15} className="shrink-0 text-ink-400" aria-hidden />
        Best single day: {money(topEarningDays[0].amount)} on {formatDate(topEarningDays[0].date)}
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------- table */

function CommissionTable() {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return commissionTxns.filter((row) => {
      if (source !== 'all' && row.source !== source) return false
      if (from && row.date < from) return false
      if (to && row.date > `${to}T23:59:59`) return false
      if (!needle) return true
      return `${row.orderId} ${row.earnedFrom} ${row.source}`.toLowerCase().includes(needle)
    })
  }, [query, source, from, to])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const reset = () => {
    setQuery('')
    setSource('all')
    setFrom('')
    setTo('')
    setPage(1)
  }

  return (
    <>
      <FilterBar onReset={reset} className="mt-4 mb-4">
        <Field label="Search" htmlFor="commission-search" className="w-full sm:w-72">
          <SearchInput
            id="commission-search"
            placeholder="Order ID or merchant"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="Source" htmlFor="commission-source" className="w-full sm:w-52">
          <Select
            id="commission-source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From" htmlFor="commission-from" className="w-full sm:w-40">
          <DateInput id="commission-from" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="commission-to" className="w-full sm:w-40">
          <DateInput id="commission-to" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </FilterBar>

      <Card>
        <CardHeader
          title="Commission transactions"
          description="Every earning event, with the transaction it was earned against."
          actions={
            <Button size="sm" icon={RiDownload2Line}>
              Export CSV
            </Button>
          }
        />

        {visible.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No commission matches these filters"
            description="Try another source, or widen the date range."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH className="w-12">#</TH>
                <TH>Date</TH>
                <TH className="w-24">Type</TH>
                <TH align="right">Amount</TH>
                <TH>Order ID</TH>
                <TH>Source</TH>
                <TH>Earned from</TH>
                <TH align="right">Action</TH>
              </THead>
              <TBody>
                {visible.map((row, index) => (
                  <TR key={row.orderId}>
                    <TD className="tnum text-ink-400">
                      {(current - 1) * PAGE_SIZE + index + 1}
                    </TD>
                    <TD>
                      <CellStack primary={formatDate(row.date)} secondary={formatTime(row.date)} />
                    </TD>
                    <TD>
                      <LedgerTypeBadge type="credit" />
                    </TD>
                    <TD align="right">
                      <span className="tnum font-medium text-success-700">
                        {signedMoney(row.amount)}
                      </span>
                    </TD>
                    <TD>
                      <MonoCell>{row.orderId}</MonoCell>
                    </TD>
                    <TD>
                      <Badge tone="neutral">{row.source}</Badge>
                    </TD>
                    <TD className="max-w-56">
                      <span className="block truncate text-ink-700">{row.earnedFrom}</span>
                    </TD>
                    <TD align="right">
                      <IconButton
                        icon={RiEyeLine}
                        label={`View commission ${row.orderId}`}
                        size="sm"
                        variant="ghost"
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </TableWrap>
            <CardFooter>
              <Pagination
                page={current}
                pageCount={pageCount}
                total={rows.length}
                noun="transactions"
                onChange={setPage}
              />
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}

/* --------------------------------------------------------------- structure */

function StructureTab() {
  return (
    <>
      <Alert tone="info" className="mb-4">
        These are the rates resolved for your account today. A rate change takes effect from its
        stated date and never applies retrospectively.
      </Alert>

      <Card>
        <CardHeader
          title="Resolved rates"
          description="Per service, after your slab and any override."
        />
        <TableWrap>
          <THead>
            <TH>Service</TH>
            <TH className="w-28">Basis</TH>
            <TH>Your rate</TH>
            <TH>Cap</TH>
            <TH>Credited</TH>
            <TH align="right">Effective from</TH>
          </THead>
          <TBody>
            {commissionRates.map((rate) => (
              <TR key={rate.service}>
                <TD>
                  <CellStack primary={rate.service} secondary={rate.note} />
                </TD>
                <TD>
                  <Badge tone={rate.basis === 'Percentage' ? 'info' : 'neutral'}>{rate.basis}</Badge>
                </TD>
                <TD className="font-medium text-ink-900">{rate.rate}</TD>
                <TD className="text-ink-600">{rate.cap}</TD>
                <TD className="text-ink-600">{rate.credited}</TD>
                <TD align="right" className="tnum text-ink-600">
                  {formatDate(rate.effectiveFrom)}
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
        <CardFooter>
          <p className="text-sm text-ink-500">
            Rates are applied at the moment a transaction succeeds, not when it is reconciled.
          </p>
        </CardFooter>
      </Card>
    </>
  )
}

function total(rows: { amount?: number; value?: number }[]) {
  return rows.reduce((sum, row) => sum + (row.amount ?? row.value ?? 0), 0)
}
