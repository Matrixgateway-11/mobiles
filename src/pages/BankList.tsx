import { useMemo, useState } from 'react'
import { RiUserAddLine, RiVerifiedBadgeFill, RiSearchLine } from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { beneficiaries, beneficiaryTotal } from '@/data/mock'
import { formatDate, formatTime, count } from '@/lib/format'

const PAGE_COUNT = Math.ceil(beneficiaryTotal / 20)

export default function BankList() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return beneficiaries.filter((row) => {
      if (status !== 'all' && row.status !== status) return false
      if (date && !row.date.startsWith(date)) return false
      if (!needle) return true
      return [row.account, row.ifsc, row.name, row.mobile].join(' ').toLowerCase().includes(needle)
    })
  }, [query, status, date])

  const reset = () => {
    setQuery('')
    setStatus('all')
    setDate('')
    setPage(1)
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Bank List' }]}
        title="Bank list"
        description="Every beneficiary account registered against your merchant profile."
        actions={
          <Button variant="primary" icon={RiUserAddLine}>
            Add bank account
          </Button>
        }
      />

      <FilterBar onReset={reset} className="mb-4">
        <Field label="Search" htmlFor="bank-search" className="w-full sm:w-80">
          <SearchInput
            id="bank-search"
            placeholder="Account number, IFSC or name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="bank-status" className="w-full sm:w-44">
          <Select id="bank-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </Field>
        <Field label="Added on" htmlFor="bank-date" className="w-full sm:w-44">
          <DateInput id="bank-date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </FilterBar>

      <Card>
        <CardHeader
          title="Beneficiaries"
          description={`${count(beneficiaryTotal)} accounts verified via penny drop`}
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No beneficiaries match these filters"
            description="Check the account number, or clear the filters to see the full list."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH className="w-16">#</TH>
                <TH>Added</TH>
                <TH>IFSC</TH>
                <TH>Account</TH>
                <TH>Mobile</TH>
                <TH align="right">Status</TH>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <span className="tnum text-ink-400">{row.id}</span>
                    </TD>
                    <TD>
                      <div className="min-w-0">
                        <div className="font-medium text-ink-900">{formatDate(row.date)}</div>
                        <div className="mt-0.5 text-xs text-ink-500">{formatTime(row.date)}</div>
                      </div>
                    </TD>
                    <TD>
                      <MonoCell>{row.ifsc}</MonoCell>
                    </TD>
                    <TD className="max-w-72">
                      <div className="tnum truncate font-medium text-ink-900">{row.account}</div>
                      <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500">
                        {row.name}
                        {row.status === 'verified' && (
                          <RiVerifiedBadgeFill
                            size={13}
                            className="shrink-0 text-success-600"
                            aria-label="Name verified"
                          />
                        )}
                      </div>
                    </TD>
                    <TD>
                      <span className="tnum text-ink-700">{row.mobile}</span>
                    </TD>
                    <TD align="right">
                      <StatusBadge status={row.status} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </TableWrap>
            <CardFooter>
              <Pagination
                page={page}
                pageCount={PAGE_COUNT}
                total={beneficiaryTotal}
                noun="beneficiaries"
                onChange={setPage}
              />
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}
