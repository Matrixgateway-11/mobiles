import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiUserAddLine,
  RiTeamLine,
  RiUserFollowLine,
  RiUserForbidLine,
  RiWallet3Line,
  RiArrowRightSLine,
  RiCornerDownRightLine,
  RiSearchLine,
  RiDownload2Line,
  RiLinkM,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput, Input } from '@/components/ui/Field'
import { AccountStatusBadge, RoleBadge } from '@/components/ui/Badge'
import { SegmentedControl } from '@/components/ui/Tabs'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { ROLE_LABEL, type Account, type AccountStatus } from '@/data/network'
import {
  useCurrentAccount,
  useNetwork,
  networkOf,
  childrenOf,
  inboxFor,
  canManage,
  setCommissionPercent,
  setAccountStatus,
  commissionHistoryFor,
  accountById,
} from '@/lib/network'
import { money, count, formatDate, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'

const SAMPLE = 100000

export default function MyTeam() {
  const account = useCurrentAccount()
  const network = useNetwork()

  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])
  const [managing, setManaging] = useState<Account | null>(null)

  const isAdmin = account.role === 'admin'
  const everyone = networkOf(network, account)

  // The admin's table lists distributors with their retailers folded inside;
  // a distributor's table is flat, because a retailer has nobody below them.
  const topLevel = useMemo(
    () => (isAdmin ? everyone.filter((a) => a.parentId === account.id) : everyone),
    [everyone, isAdmin, account.id],
  )

  /* Grouping is for browsing. The moment a filter is on, the admin is after
     somebody in particular -- and a retailer folded inside a distributor they
     have not expanded is one they would never find, because the table would
     just say nobody matches. So a filter widens the search to the whole
     hierarchy and the result is drawn flat. */
  const filtering = query.trim() !== '' || role !== 'all' || status !== 'all'

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (filtering ? everyone : topLevel).filter((member) => {
      if (role !== 'all' && member.role !== role) return false
      if (status !== 'all' && member.status !== status) return false
      if (!needle) return true
      return `${member.name} ${member.email} ${member.mobile} ${member.id}`
        .toLowerCase()
        .includes(needle)
    })
  }, [everyone, topLevel, filtering, query, role, status])

  const summary = useMemo(
    () => ({
      direct: topLevel.length,
      hierarchy: everyone.length,
      active: everyone.filter((a) => a.status === 'active').length,
      blocked: everyone.filter((a) => a.status !== 'active').length,
      wallet: rows.reduce((sum, a) => sum + a.wallet, 0),
    }),
    [topLevel, everyone, rows],
  )

  const pending = inboxFor(network, account).length

  const reset = () => {
    setQuery('')
    setRole('all')
    setStatus('all')
    setFrom('')
    setTo('')
  }

  const toggle = (id: string) =>
    setExpanded((ids) => (ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]))

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Home', to: '/dashboard' },
          { label: isAdmin ? 'All accounts' : 'My team & activity' },
        ]}
        title={isAdmin ? 'All accounts' : 'My team & activity'}
        description={
          isAdmin
            ? 'Every distributor and retailer on the platform. Expand a distributor to see their retailers.'
            : 'The retailers you onboarded, and how they are trading.'
        }
        actions={
          <>
            {pending > 0 && (
              <Button as={Link} to="/users/invitations" icon={RiLinkM}>
                {pending} waiting
              </Button>
            )}
            <Button as={Link} to="/users/add" variant="primary" icon={RiUserAddLine}>
              Add user
            </Button>
          </>
        }
      />

      <FilterBar onReset={reset} className="mb-4">
        <Field label="Search" htmlFor="team-search" className="w-full sm:w-72">
          <SearchInput
            id="team-search"
            placeholder="Name, email, phone or code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        {isAdmin && (
          <Field label="Role" htmlFor="team-role" className="w-full sm:w-44">
            <Select id="team-role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="all">All roles</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </Select>
          </Field>
        )}
        <Field label="Status" htmlFor="team-status" className="w-full sm:w-40">
          <Select
            id="team-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </Select>
        </Field>
        <Field label="From date" htmlFor="team-from" className="w-full sm:w-40">
          <DateInput id="team-from" value={from} onChange={(event) => setFrom(event.target.value)} />
        </Field>
        <Field label="To date" htmlFor="team-to" className="w-full sm:w-40">
          <DateInput id="team-to" value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>
        <p className="w-full max-w-xs pb-2 text-xs leading-relaxed text-ink-500 sm:w-auto">
          Dates narrow the payin and disbursement totals only — they do not change who is listed.
        </p>
      </FilterBar>

      <StatGrid columns={5}>
        <StatCard
          label={isAdmin ? 'Distributors' : 'Retailers onboarded'}
          value={count(summary.direct)}
          icon={RiUserAddLine}
          tone="brand"
        />
        <StatCard
          label={isAdmin ? 'Accounts in hierarchy' : 'In your network'}
          value={count(summary.hierarchy)}
          icon={RiTeamLine}
          tone="info"
        />
        <StatCard
          label="Active"
          value={count(summary.active)}
          icon={RiUserFollowLine}
          tone="success"
        />
        <StatCard
          label="Inactive or banned"
          value={count(summary.blocked)}
          icon={RiUserForbidLine}
          tone="danger"
        />
        <StatCard
          label="Wallet total on page"
          value={money(summary.wallet)}
          icon={RiWallet3Line}
          tone="neutral"
        />
      </StatGrid>

      <Card className="mt-4">
        <CardHeader
          title={isAdmin ? 'Accounts' : 'Team members'}
          description="Rate is the share that comes up to you."
          actions={
            <Button size="sm" icon={RiDownload2Line}>
              Export CSV
            </Button>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="Nobody matches these filters"
            description="Try another role or status, or clear the search."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH className="w-10" />
                <TH>Account</TH>
                <TH>Contact</TH>
                <TH className="w-32">Role</TH>
                <TH className="w-28">Status</TH>
                <TH>Joined</TH>
                <TH align="right">Rate</TH>
                <TH align="right">Payin</TH>
                <TH align="right">Disbursement</TH>
                <TH align="right">Wallet</TH>
                <TH align="right">Action</TH>
              </THead>
              <TBody>
                {rows.map((member) => {
                  const kids = isAdmin && !filtering ? childrenOf(network, member.id) : []
                  const open = expanded.includes(member.id)
                  return (
                    <AccountRows
                      key={member.id}
                      member={member}
                      team={kids}
                      expanded={open}
                      onToggle={kids.length ? () => toggle(member.id) : undefined}
                      actor={account}
                      onManage={setManaging}
                    />
                  )
                })}
              </TBody>
            </TableWrap>
            <CardFooter>
              <p className="tnum text-sm text-ink-500">
                {filtering ? (
                  <>
                    Showing {count(rows.length)} of {count(summary.hierarchy)} accounts
                  </>
                ) : (
                  <>
                    Showing {count(rows.length)} of {count(topLevel.length)}
                    {isAdmin ? ' distributors' : ' retailers'}
                    <span className="mx-1.5 text-ink-300">·</span>
                    {count(summary.hierarchy)} accounts in total
                  </>
                )}
              </p>
            </CardFooter>
          </>
        )}
      </Card>

      {managing && (
        <ManageDialog actor={account} member={managing} onClose={() => setManaging(null)} />
      )}
    </>
  )
}

function AccountRows({
  member,
  team,
  expanded,
  onToggle,
  actor,
  onManage,
}: {
  member: Account
  team: Account[]
  expanded: boolean
  onToggle?: () => void
  actor: Account
  onManage: (account: Account) => void
}) {
  return (
    <>
      <AccountRow
        member={member}
        expanded={expanded}
        onToggle={onToggle}
        actor={actor}
        onManage={onManage}
      />
      {expanded &&
        team.map((child) => (
          <AccountRow key={child.id} member={child} nested actor={actor} onManage={onManage} />
        ))}
    </>
  )
}

function AccountRow({
  member,
  nested = false,
  expanded = false,
  onToggle,
  actor,
  onManage,
}: {
  member: Account
  nested?: boolean
  expanded?: boolean
  onToggle?: () => void
  actor: Account
  onManage: (account: Account) => void
}) {
  const editable = canManage(actor, member)
  return (
    <TR className={cn(nested && 'bg-ink-50')}>
      <TD className="pr-0">
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} the retailers under ${member.name}`}
            className="inline-flex size-6 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <RiArrowRightSLine
              size={16}
              className={cn('transition-transform duration-150', expanded && 'rotate-90')}
            />
          </button>
        ) : (
          nested && (
            <RiCornerDownRightLine size={15} className="ml-1.5 text-ink-300" aria-hidden />
          )
        )}
      </TD>
      <TD className={cn('max-w-56', nested && 'pl-6')}>
        <CellStack primary={member.name} secondary={<MonoCell>{member.id}</MonoCell>} />
      </TD>
      <TD className="max-w-56">
        <CellStack
          primary={<span className="font-normal text-ink-700">{member.email}</span>}
          secondary={<span className="tnum">{member.mobile}</span>}
        />
      </TD>
      <TD>
        <RoleBadge role={member.role} />
      </TD>
      <TD>
        <AccountStatusBadge status={member.status} />
      </TD>
      <TD className="tnum text-ink-600">{formatDate(member.joined)}</TD>
      <TD align="right" className="tnum font-medium text-ink-900">
        {member.commissionPercent}%
      </TD>
      <TD align="right" className="tnum text-ink-800">
        {money(member.payin)}
      </TD>
      <TD align="right" className="tnum text-ink-800">
        {money(member.disbursement)}
      </TD>
      <TD align="right" className="tnum font-medium text-ink-900">
        {money(member.wallet)}
      </TD>
      <TD align="right">
        <Button size="sm" disabled={!editable} onClick={() => onManage(member)}>
          Manage
        </Button>
      </TD>
    </TR>
  )
}

/* Rate and status in one dialog. They are the two things an account's parent
   actually changes after approval, and splitting them across two buttons made
   the row busier without making either easier to find. */

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'On hold' },
  { value: 'banned', label: 'Banned' },
] as const

function ManageDialog({
  actor,
  member,
  onClose,
}: {
  actor: Account
  member: Account
  onClose: () => void
}) {
  const network = useNetwork()
  const [percent, setPercent] = useState(String(member.commissionPercent))
  const [status, setStatus] = useState<AccountStatus>(member.status)
  const [reason, setReason] = useState('')

  const rate = Number(percent)
  const validRate = Number.isFinite(rate) && rate >= 0 && rate <= 100
  const keep = (SAMPLE * rate) / 100

  const isAdmin = actor.role === 'admin'
  const history = commissionHistoryFor(network, member.id)
  const last = history[0]

  const rateChanged = validRate && rate !== member.commissionPercent
  const statusChanged = status !== member.status
  const dirty = rateChanged || statusChanged

  const save = () => {
    if (rateChanged) setCommissionPercent(member.id, rate, actor.id, reason.trim())
    if (statusChanged) setAccountStatus(member.id, status)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Manage account"
      description={`${member.name} · ${ROLE_LABEL[member.role]} · ${member.id}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!dirty || !validRate} onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <section>
          <h3 className="text-md font-semibold text-ink-900">Commission rate</h3>
          <p className="mt-0.5 text-sm text-ink-500">
            The share that comes up to you on everything they collect.
          </p>

          <div className="mt-3 flex flex-wrap items-end gap-4">
            <Field label="Rate" htmlFor="manage-rate" className="w-32">
              <div className="relative">
                <Input
                  id="manage-rate"
                  inputMode="decimal"
                  className="tnum pr-7"
                  value={percent}
                  onChange={(event) => setPercent(event.target.value.replace(/[^\d.]/g, ''))}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-base text-ink-500">
                  %
                </span>
              </div>
            </Field>
            {validRate && (
              <p className="pb-2 text-base leading-relaxed text-ink-600">
                On {money(SAMPLE)} collected,{' '}
                <span className="tnum font-semibold text-success-700">{money(keep)}</span> comes up
                to you and{' '}
                <span className="tnum font-semibold text-ink-900">{money(SAMPLE - keep)}</span>{' '}
                stays with them.
              </p>
            )}
          </div>

          {rateChanged && (
            <Field
              label="Reason"
              htmlFor="rate-reason"
              hint="Optional, but it is what the rate history will show months from now."
              className="mt-4"
            >
              <Input
                id="rate-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Volume held up through Diwali"
              />
            </Field>
          )}

          {last && (
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              Last changed from {last.previousPercent}% to {last.newPercent}% on{' '}
              {formatDateTime(last.at)} by{' '}
              {accountById(network, last.changedBy)?.name ?? 'Sai Mobiles'}
              {last.reason ? ` — ${last.reason}` : ''}.
            </p>
          )}
        </section>

        <section className="border-t border-ink-100 pt-5">
          <h3 className="text-md font-semibold text-ink-900">Account status</h3>
          <p className="mt-0.5 text-sm text-ink-500">
            On hold stops them transacting and is reversible. A ban is a verdict and only the admin
            can issue one.
          </p>

          <SegmentedControl
            className="mt-3"
            options={STATUSES.filter((option) => option.value !== 'banned' || isAdmin)}
            value={status}
            onChange={setStatus}
          />

          {statusChanged && status !== 'active' && (
            <Alert tone={status === 'banned' ? 'danger' : 'warning'} className="mt-3">
              {member.name} will not be able to sign in or move money once you save.
              {member.role === 'distributor' &&
                ' Their retailers keep trading — suspend them separately if that is what you mean.'}
            </Alert>
          )}

          {statusChanged && status === 'active' && member.status !== 'active' && (
            <Alert tone="success" className="mt-3">
              {member.name} will be able to sign in and transact again once you save.
            </Alert>
          )}
        </section>
      </div>
    </Modal>
  )
}
