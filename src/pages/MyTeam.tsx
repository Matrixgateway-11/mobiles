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
  RiPercentLine,
  RiDownload2Line,
  RiLinkM,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput, Input } from '@/components/ui/Field'
import { AccountStatusBadge, RoleBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { ROLE_LABEL, type Account } from '@/data/network'
import {
  useCurrentAccount,
  useNetwork,
  networkOf,
  childrenOf,
  inboxFor,
  setCommissionPercent,
} from '@/lib/network'
import { money, count, formatDate } from '@/lib/format'
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
  const [rateFor, setRateFor] = useState<Account | null>(null)

  const isAdmin = account.role === 'admin'
  const everyone = networkOf(network, account)

  // The admin's table lists distributors with their retailers folded inside;
  // a distributor's table is flat, because a retailer has nobody below them.
  const topLevel = useMemo(
    () => (isAdmin ? everyone.filter((a) => a.parentId === account.id) : everyone),
    [everyone, isAdmin, account.id],
  )

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return topLevel.filter((member) => {
      if (role !== 'all' && member.role !== role) return false
      if (status !== 'all' && member.status !== status) return false
      if (!needle) return true
      return `${member.name} ${member.email} ${member.mobile} ${member.id}`
        .toLowerCase()
        .includes(needle)
    })
  }, [topLevel, query, role, status])

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
          description="Rate is the share that comes up to you on everything they collect."
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
                  const kids = isAdmin ? childrenOf(network, member.id) : []
                  const open = expanded.includes(member.id)
                  return (
                    <AccountRows
                      key={member.id}
                      member={member}
                      team={kids}
                      expanded={open}
                      onToggle={kids.length ? () => toggle(member.id) : undefined}
                      onSetRate={setRateFor}
                    />
                  )
                })}
              </TBody>
            </TableWrap>
            <CardFooter>
              <p className="tnum text-sm text-ink-500">
                Showing {count(rows.length)} of {count(topLevel.length)}
                {isAdmin ? ' distributors' : ' retailers'}
                <span className="mx-1.5 text-ink-300">·</span>
                {count(summary.hierarchy)} accounts in total
              </p>
            </CardFooter>
          </>
        )}
      </Card>

      {rateFor && <RateDialog member={rateFor} onClose={() => setRateFor(null)} />}
    </>
  )
}

function AccountRows({
  member,
  team,
  expanded,
  onToggle,
  onSetRate,
}: {
  member: Account
  team: Account[]
  expanded: boolean
  onToggle?: () => void
  onSetRate: (account: Account) => void
}) {
  return (
    <>
      <AccountRow member={member} expanded={expanded} onToggle={onToggle} onSetRate={onSetRate} />
      {expanded &&
        team.map((child) => (
          <AccountRow key={child.id} member={child} nested onSetRate={onSetRate} />
        ))}
    </>
  )
}

function AccountRow({
  member,
  nested = false,
  expanded = false,
  onToggle,
  onSetRate,
}: {
  member: Account
  nested?: boolean
  expanded?: boolean
  onToggle?: () => void
  onSetRate: (account: Account) => void
}) {
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
        <IconButton
          icon={RiPercentLine}
          label={`Set the rate for ${member.name}`}
          size="sm"
          variant="ghost"
          onClick={() => onSetRate(member)}
        />
      </TD>
    </TR>
  )
}

function RateDialog({ member, onClose }: { member: Account; onClose: () => void }) {
  const [percent, setPercent] = useState(String(member.commissionPercent))
  const rate = Number(percent)
  const valid = Number.isFinite(rate) && rate >= 0 && rate <= 100
  const keep = (SAMPLE * rate) / 100

  const save = () => {
    setCommissionPercent(member.id, rate)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Commission rate"
      description={`${member.name} · ${ROLE_LABEL[member.role]}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={save}>
            Save rate
          </Button>
        </>
      }
    >
      <Field label="Rate" htmlFor="member-rate" className="w-32">
        <div className="relative">
          <Input
            id="member-rate"
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
      {valid && (
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          On {money(SAMPLE)} collected,{' '}
          <span className="tnum font-semibold text-success-700">{money(keep)}</span> comes up to you
          and <span className="tnum font-semibold text-ink-900">{money(SAMPLE - keep)}</span> stays
          with {member.name}.
        </p>
      )}
    </Modal>
  )
}
