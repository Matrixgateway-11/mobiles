import { useMemo, useState } from 'react'
import { RiQrScan2Line, RiImageLine, RiEyeLine, RiSearchLine, RiAlertLine } from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { qrPayments, qrPaymentTotal } from '@/data/mock'
import { money, formatDate, formatTime, count } from '@/lib/format'

const PAGE_COUNT = Math.ceil(qrPaymentTotal / 20)

export default function QrTransactions() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return qrPayments.filter((row) => {
      if (status !== 'all' && row.status !== status) return false
      if (!needle) return true
      return [row.id, row.utr, row.gateway].join(' ').toLowerCase().includes(needle)
    })
  }, [query, status])

  const reset = () => {
    setQuery('')
    setStatus('all')
    setPage(1)
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'QR Payments' }]}
        title="QR transactions"
        description="Submitted UPI payments against your static QR, matched by UTR."
      />

      <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 px-5 py-4">
        <RiAlertLine size={18} className="mt-0.5 shrink-0 text-warning-600" aria-hidden />
        <div>
          <p className="text-base font-medium text-warning-700">QR collection is closed</p>
          <p className="mt-1 text-base text-warning-700/85">
            No QR gateway is active on your account right now. Payments already submitted continue
            to settle and remain visible below.
          </p>
        </div>
      </div>

      <FilterBar onReset={reset} submitLabel="Apply" className="mb-4">
        <Field label="Search" htmlFor="qr-search" className="w-full sm:w-80">
          <SearchInput
            id="qr-search"
            placeholder="QR payin ID or UTR"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="qr-status" className="w-full sm:w-44">
          <Select id="qr-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </Field>
      </FilterBar>

      <Card>
        <CardHeader
          title="QR payments"
          description={`${count(qrPaymentTotal)} payments submitted to date`}
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No QR payments match these filters"
            description="Check the UTR, or clear the filters to see everything."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH>QR payin ID</TH>
                <TH>Date</TH>
                <TH>Gateway</TH>
                <TH>UTR</TH>
                <TH align="center">Proof</TH>
                <TH align="right">Amount</TH>
                <TH>Status</TH>
                <TH>Reason</TH>
                <TH align="right">Action</TH>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <MonoCell className="text-ink-900">{row.id}</MonoCell>
                    </TD>
                    <TD>
                      <CellStack primary={formatDate(row.date)} secondary={formatTime(row.date)} />
                    </TD>
                    <TD>
                      <span className="inline-flex items-center gap-1.5 text-ink-700">
                        <RiQrScan2Line size={14} className="text-ink-400" aria-hidden />
                        {row.gateway}
                      </span>
                    </TD>
                    <TD>
                      <MonoCell>{row.utr}</MonoCell>
                    </TD>
                    <TD align="center">
                      <button
                        type="button"
                        aria-label={`View payment proof for ${row.id}`}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-ink-200 bg-ink-50 text-ink-400 transition-colors hover:border-ink-300 hover:bg-ink-100 hover:text-ink-600"
                      >
                        <RiImageLine size={15} />
                      </button>
                    </TD>
                    <TD align="right">
                      <span className="tnum font-medium text-ink-900">{money(row.amount)}</span>
                    </TD>
                    <TD>
                      <StatusBadge status={row.status} />
                    </TD>
                    <TD>
                      <span className="text-ink-400">{row.reason ?? '—'}</span>
                    </TD>
                    <TD align="right">
                      <IconButton
                        icon={RiEyeLine}
                        label={`View ${row.id}`}
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
                page={page}
                pageCount={PAGE_COUNT}
                total={qrPaymentTotal}
                noun="payments"
                onChange={setPage}
              />
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}
