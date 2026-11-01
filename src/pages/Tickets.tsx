import { useMemo, useRef, useState } from 'react'
import {
  RiAddLine,
  RiInboxLine,
  RiFolderOpenLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiRefreshLine,
  RiSearchLine,
  RiEyeLine,
  RiAttachment2,
  RiDeleteBinLine,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput, Input, Textarea } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { tickets, type TicketStatus } from '@/data/mock'
import { count, formatDate, formatDateTime } from '@/lib/format'

/* The progression runs neutral → blue → amber → green, so a ticket's state is
   readable at a glance and no status borrows the brand maroon. */
const STATUS: Record<
  TicketStatus,
  { tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger'; label: string }
> = {
  submitted: { tone: 'neutral', label: 'Submitted' },
  opened: { tone: 'info', label: 'Opened' },
  in_progress: { tone: 'warning', label: 'In progress' },
  resolved: { tone: 'success', label: 'Resolved' },
  rejected: { tone: 'danger', label: 'Rejected' },
}

const PAGE_SIZE = 10
const MAX_FILES = 3

export default function Tickets() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [composing, setComposing] = useState(false)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tickets.filter((ticket) => {
      if (status !== 'all' && ticket.status !== status) return false
      if (from && ticket.raisedOn < from) return false
      if (to && ticket.raisedOn > `${to}T23:59:59`) return false
      if (!needle) return true
      return `${ticket.id} ${ticket.title} ${ticket.subject}`.toLowerCase().includes(needle)
    })
  }, [query, status, from, to])

  const tally = useMemo(
    () => ({
      submitted: tickets.filter((t) => t.status === 'submitted').length,
      opened: tickets.filter((t) => t.status === 'opened').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      rejected: tickets.filter((t) => t.status === 'rejected').length,
    }),
    [],
  )

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const reset = () => {
    setQuery('')
    setStatus('all')
    setFrom('')
    setTo('')
    setPage(1)
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Tickets' }]}
        title="Tickets"
        description="Raise a complaint and follow it through review to resolution."
        actions={
          <Button variant="primary" icon={RiAddLine} onClick={() => setComposing(true)}>
            New ticket
          </Button>
        }
      />

      <FilterBar
        onReset={reset}
        extraActions={<Button icon={RiRefreshLine}>Refresh</Button>}
        className="mb-4"
      >
        <Field label="Search" htmlFor="ticket-search" className="w-full sm:w-72">
          <SearchInput
            id="ticket-search"
            placeholder="Ticket ID, title or subject"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="Status" htmlFor="ticket-status" className="w-full sm:w-44">
          <Select
            id="ticket-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From" htmlFor="ticket-from" className="w-full sm:w-40">
          <DateInput id="ticket-from" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" htmlFor="ticket-to" className="w-full sm:w-40">
          <DateInput id="ticket-to" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </FilterBar>

      <StatGrid columns={5}>
        <StatCard
          label="Submitted"
          value={count(tally.submitted)}
          icon={RiInboxLine}
          tone="neutral"
        />
        <StatCard label="Opened" value={count(tally.opened)} icon={RiFolderOpenLine} tone="info" />
        <StatCard
          label="In progress"
          value={count(tally.in_progress)}
          icon={RiTimeLine}
          tone="warning"
        />
        <StatCard
          label="Resolved"
          value={count(tally.resolved)}
          icon={RiCheckboxCircleLine}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={count(tally.rejected)}
          icon={RiCloseCircleLine}
          tone="danger"
        />
      </StatGrid>

      <Card className="mt-4">
        <CardHeader
          title="Recent tickets"
          description="Newest first."
        />

        {visible.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No tickets match these filters"
            description="Try another status, or widen the date range."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH>Ticket</TH>
                <TH>Subject</TH>
                <TH className="w-32">Status</TH>
                <TH>Raised</TH>
                <TH>Last update</TH>
                <TH align="right">Replies</TH>
                <TH align="right">Action</TH>
              </THead>
              <TBody>
                {visible.map((ticket) => (
                  <TR key={ticket.id}>
                    <TD className="max-w-64">
                      <CellStack primary={ticket.title} secondary={<MonoCell>{ticket.id}</MonoCell>} />
                    </TD>
                    <TD className="max-w-72">
                      <span className="block truncate text-ink-700">{ticket.subject}</span>
                    </TD>
                    <TD>
                      <Badge tone={STATUS[ticket.status].tone} dot>
                        {STATUS[ticket.status].label}
                      </Badge>
                    </TD>
                    <TD className="tnum text-ink-600">{formatDate(ticket.raisedOn)}</TD>
                    <TD className="tnum text-ink-600">{formatDateTime(ticket.updatedOn)}</TD>
                    <TD align="right" className="tnum text-ink-700">
                      {count(ticket.replies)}
                    </TD>
                    <TD align="right">
                      <IconButton
                        icon={RiEyeLine}
                        label={`Open ticket ${ticket.id}`}
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
                noun="tickets"
                onChange={setPage}
              />
            </CardFooter>
          </>
        )}
      </Card>

      <NewTicketDialog open={composing} onClose={() => setComposing(false)} />
    </>
  )
}

function NewTicketDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const close = () => {
    setTitle('')
    setSubject('')
    setMessage('')
    setFiles([])
    onClose()
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const names = Array.from(list).map((file) => file.name)
    setFiles((current) => [...current, ...names].slice(0, MAX_FILES))
    if (inputRef.current) inputRef.current.value = ''
  }

  const complete = title.trim() && subject.trim() && message.trim()

  return (
    <Modal
      open={open}
      onClose={close}
      title="New ticket"
      description="Support replies to the email on your account."
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button variant="primary" disabled={!complete} onClick={close}>
            Submit ticket
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="ticket-title">
          <Input
            id="ticket-title"
            placeholder="A short summary"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Subject" htmlFor="ticket-subject">
          <Input
            id="ticket-subject"
            placeholder="What is this about?"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </Field>
        <Field
          label="Message"
          htmlFor="ticket-message"
          hint="Include the order ID or reference if you have one — it halves the time to a reply."
        >
          <Textarea
            id="ticket-message"
            rows={5}
            placeholder="Describe the issue in detail"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-ink-700">Attachments</span>
            <span className="tnum text-xs text-ink-500">
              {files.length} of {MAX_FILES}
            </span>
          </div>

          {files.length > 0 && (
            <ul className="mb-2 space-y-1.5">
              {files.map((name, index) => (
                <li
                  key={`${name}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-25 px-3 py-2"
                >
                  <RiAttachment2 size={15} className="shrink-0 text-ink-400" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-base text-ink-800">{name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                    className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-danger-600"
                  >
                    <RiDeleteBinLine size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button
            icon={RiAttachment2}
            disabled={files.length >= MAX_FILES}
            onClick={() => inputRef.current?.click()}
          >
            Add files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={(event) => addFiles(event.target.files)}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Up to {MAX_FILES} files · JPEG, PNG, WEBP or PDF · 3 MB each
          </p>
        </div>
      </div>
    </Modal>
  )
}
