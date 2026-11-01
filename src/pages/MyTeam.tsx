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
  RiEyeLine,
  RiDownload2Line,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { FilterBar } from '@/components/ui/FilterBar'
import { Field, SearchInput, Select, DateInput } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { team, type TeamMember, type TeamStatus } from '@/data/mock'
import { money, count, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const STATUS_TONE: Record<TeamStatus, { tone: 'success' | 'neutral' | 'danger'; label: string }> = {
  active: { tone: 'success', label: 'Active' },
  inactive: { tone: 'neutral', label: 'Inactive' },
  banned: { tone: 'danger', label: 'Banned' },
}

const flatten = (members: TeamMember[]): TeamMember[] =>
  members.flatMap((member) => [member, ...flatten(member.team)])

export default function MyTeam() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return team.filter((member) => {
      if (role !== 'all' && member.role !== role) return false
      if (status !== 'all' && member.status !== status) return false
      if (!needle) return true
      return `${member.name} ${member.email} ${member.mobile} ${member.id}`
        .toLowerCase()
        .includes(needle)
    })
  }, [query, role, status])

  const everyone = useMemo(() => flatten(team), [])
  const summary = useMemo(
    () => ({
      direct: team.length,
      hierarchy: everyone.length,
      active: everyone.filter((m) => m.status === 'active').length,
      blocked: everyone.filter((m) => m.status !== 'active').length,
      wallet: rows.reduce((sum, m) => sum + m.wallet, 0),
    }),
    [everyone, rows],
  )

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
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'My team & activity' }]}
        title="My team & activity"
        description="Everyone you onboarded directly, and how they are trading. Expand a row to see their own team."
        actions={
          <Button as={Link} to="/users/add" variant="primary" icon={RiUserAddLine}>
            Add user
          </Button>
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
        <Field label="Role" htmlFor="team-role" className="w-full sm:w-44">
          <Select id="team-role" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="all">All roles</option>
            <option value="Sub-Distributor">Sub-Distributor</option>
            <option value="Retailer">Retailer</option>
          </Select>
        </Field>
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
          label="Directly added"
          value={count(summary.direct)}
          icon={RiUserAddLine}
          tone="brand"
        />
        <StatCard
          label="Total users in hierarchy"
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
          title="Team members"
          description="Totals are lifetime unless a date range is applied."
          actions={
            <Button size="sm" icon={RiDownload2Line}>
              Export CSV
            </Button>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={RiSearchLine}
            title="No team members match these filters"
            description="Try another role or status, or clear the search."
            action={<Button onClick={reset}>Clear filters</Button>}
            compact
          />
        ) : (
          <>
            <TableWrap>
              <THead>
                <TH className="w-10" />
                <TH>Member</TH>
                <TH>Contact</TH>
                <TH className="w-36">Role</TH>
                <TH className="w-28">Status</TH>
                <TH>Joined</TH>
                <TH align="right">Payin</TH>
                <TH align="right">Disbursement</TH>
                <TH align="right">Wallet</TH>
                <TH align="right">Action</TH>
              </THead>
              <TBody>
                {rows.map((member) => (
                  <MemberRows
                    key={member.id}
                    member={member}
                    expanded={expanded.includes(member.id)}
                    onToggle={() => toggle(member.id)}
                  />
                ))}
              </TBody>
            </TableWrap>
            <CardFooter>
              <p className="tnum text-sm text-ink-500">
                Showing {count(rows.length)} of {count(team.length)} direct members
                <span className="mx-1.5 text-ink-300">·</span>
                {count(summary.hierarchy)} in the full hierarchy
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}

function MemberRows({
  member,
  expanded,
  onToggle,
}: {
  member: TeamMember
  expanded: boolean
  onToggle: () => void
}) {
  const hasTeam = member.team.length > 0

  return (
    <>
      <MemberRow member={member} expanded={expanded} onToggle={hasTeam ? onToggle : undefined} />
      {expanded && member.team.map((child) => <MemberRow key={child.id} member={child} nested />)}
    </>
  )
}

function MemberRow({
  member,
  nested = false,
  expanded = false,
  onToggle,
}: {
  member: TeamMember
  nested?: boolean
  expanded?: boolean
  onToggle?: () => void
}) {
  const status = STATUS_TONE[member.status]

  return (
    <TR className={cn(nested && 'bg-ink-50')}>
      <TD className="pr-0">
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} the team under ${member.name}`}
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
        <Badge tone={member.role === 'Sub-Distributor' ? 'brand' : 'neutral'}>{member.role}</Badge>
      </TD>
      <TD>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </TD>
      <TD className="tnum text-ink-600">{formatDate(member.joined)}</TD>
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
          icon={RiEyeLine}
          label={`View ${member.name}`}
          size="sm"
          variant="ghost"
        />
      </TD>
    </TR>
  )
}
