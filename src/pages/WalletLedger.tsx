import { useMemo, useState } from 'react'
import {
  RiWallet3Line,
  RiArrowDownLine,
  RiArrowUpLine,
  RiExchangeLine,
  RiEyeLine,
  RiSearchLine,
  RiDownload2Line,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput } from '@/components/ui/Field'
import { LedgerTypeBadge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { ledger, walletSummary } from '@/data/mock'
import { money, signedMoney, formatDate, formatTime, count } from '@/lib/format'
import { cn } from '@/lib/cn'

const SOURCES = ['Disbursement', 'Fund Load', 'Reversal', 'Bank Verification']

export default function WalletLedger() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [source, setSource] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ledger.filter((row) => {
      if (type !== 'all' && row.type !== type) return false
      if (source !== 'all' && row.source !== source) return false
      if (from && row.date < from) return false
      if (to && row.date > `${to}T23:59:59`) return false
      if (!needle) return true
      return [row.reference, row.source, row.sourceNote ?? ''].join(' ').toLowerCase().includes(needle)
    })
  }, [query, type, source, from, to])

  const reset = () => {
    setQuery('')
    setType('all')
    setSource('all')
    setFrom('')
    setTo('')
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Wallet Ledger' }]}
        title="Wallet ledger"
        description="Every credit and debit against your wallet, with running balance tracking."
        actions={
          <Button icon={RiDownload2Line}>Export CSV</Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          label="Current balance"
          value={money(walletSummary.balance)}
          meta="Available to disburse"
          icon={RiWallet3Line}
          tone="brand"
        />
        <StatCard
          label="Total credit"
          value={money(walletSummary.totalCredit)}
          meta="Payins and reversals"
          icon={RiArrowDownLine}
          tone="success"
        />
        <StatCard
          label="Total debit"
          value={money(walletSummary.totalDebit)}
          meta="Payouts, fees and verifications"
          icon={RiArrowUpLine}
          tone="neutral"
        />
        <StatCard
          label="Transactions"
          value={count(walletSummary.transactions)}
          meta="Lifetime ledger entries"
          icon={RiExchangeLine}
          tone="info"
        />
      </StatGrid>

      <FilterBar onReset={reset} className="mt-6 mb-4">
        <Field label="Search" htmlFor="ledger-search" className="w-full sm:w-72">
          <SearchInput
            id="ledger-search"
            placeholder="Reference or description"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Type" htmlFor="ledger-type" className="w-full sm:w-40">
          <Select id="ledger-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </Select>
        </Field>
        <Field label="Source" htmlFor="ledger-source" className="w-full sm:w-48">
          <Select id="ledger-source" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From" htmlFor="ledger-from" className="w-full sm:w-40">
          <DateInput id="ledger-from" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="ledger-to" className="w-full sm:w-40">
          <DateInput id="ledger-to" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </FilterBar>

      <Card>
        <CardHeader
          title="Transactions"
          description="Txn amount is the gross value; amount is what actually moved after fees."
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No entries match these filters"
            description="Try another source, or widen the date range."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH>Date</TH>
                <TH className="w-24">Type</TH>
                <TH>Source</TH>
                <TH>Reference</TH>
                <TH align="right">Txn amount</TH>
                <TH align="right">Amount</TH>
                <TH align="right">Action</TH>
              </THead>
              <TBody>
                {rows.map((row, index) => (
                  <TR key={`${row.reference}-${index}`}>
                    <TD>
                      <CellStack primary={formatDate(row.date)} secondary={formatTime(row.date)} />
                    </TD>
                    <TD>
                      <LedgerTypeBadge type={row.type} />
                    </TD>
                    <TD>
                      <CellStack primary={row.source} secondary={row.sourceNote} />
                    </TD>
                    <TD>
                      <MonoCell>{row.reference}</MonoCell>
                    </TD>
                    <TD align="right">
                      <span className="tnum text-ink-600">{money(row.txnAmount)}</span>
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
                    <TD align="right">
                      <IconButton
                        icon={RiEyeLine}
                        label={`View entry ${row.reference}`}
                        size="sm"
                        variant="ghost"
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </TableWrap>
            <CardFooter>
              <p className="tnum text-sm text-ink-500">
                Showing {count(rows.length)} of {count(walletSummary.transactions)} entries
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}
