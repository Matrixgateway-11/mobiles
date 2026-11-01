import { useState } from 'react'
import {
  RiShieldCheckLine,
  RiMapPin2Line,
  RiMailLine,
  RiPhoneLine,
  RiLockPasswordLine,
  RiKey2Line,
  RiComputerLine,
  RiSmartphoneLine,
  RiLogoutCircleLine,
  RiFileShield2Line,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Alert } from '@/components/ui/Alert'
import { Field, Input } from '@/components/ui/Field'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { DataList, DataItem } from '@/components/ui/DataList'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import {
  merchant,
  profile,
  kycRecords,
  sessions,
  activityEvents,
  type ActivityEvent,
} from '@/data/mock'
import { formatDate, formatDateTime, count } from '@/lib/format'
import { cn } from '@/lib/cn'

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'kyc', label: 'KYC details' },
  { value: 'security', label: 'Security' },
  { value: 'activity', label: 'Activity' },
] as const

export default function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('profile')

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Account settings' }]}
        title="Account settings"
        description="Your profile, KYC and account security."
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-6" />

      {tab === 'profile' && <ProfileTab />}
      {tab === 'kyc' && <KycTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'activity' && <ActivityTab />}
    </>
  )
}

/* ----------------------------------------------------------------- profile */

function ProfileTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-start gap-5">
          <span
            className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xl font-semibold text-white"
            aria-hidden
          >
            {merchant.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
                {merchant.name}
              </h2>
              <RiShieldCheckLine size={18} className="text-success-600" aria-label="KYC verified" />
              <Badge tone="success" dot>
                {profile.accountStatus}
              </Badge>
            </div>
            <p className="mt-1 text-md text-ink-500">
              {profile.merchantType}
              <span className="mx-1.5 text-ink-300">·</span>
              Onboarded {formatDate(profile.onboardedOn)}
            </p>
          </div>
          <Button>Edit profile</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Business details" />
        <CardBody>
          <DataList columns={2}>
            <DataItem
              label="Merchant code"
              value={<span className="font-mono text-sm">{profile.merchantCode}</span>}
              copy={profile.merchantCode}
            />
            <DataItem label="Merchant type" value={profile.merchantType} />
            <DataItem label="Email" value={profile.email} />
            <DataItem label="Mobile number" value={<span className="tnum">{profile.mobile}</span>} />
            <DataItem label="Shop or business name" value={profile.shopName} />
            <DataItem label="Gender" value={profile.gender} />
          </DataList>

          <div className="mt-6 border-t border-ink-100 pt-5">
            <div className="flex items-start gap-2.5">
              <RiMapPin2Line size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink-500">Registered address</p>
                <p className="mt-1 max-w-2xl text-base leading-relaxed text-ink-800">
                  {profile.address}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ContactTile
          icon={RiMailLine}
          label="Registered email"
          value={profile.email}
          note="Statements and ticket replies go here"
        />
        <ContactTile
          icon={RiPhoneLine}
          label="Registered mobile"
          value={profile.mobile}
          note="OTPs and payout alerts go here"
        />
      </div>
    </div>
  )
}

function ContactTile({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof RiMailLine
  label: string
  value: string
  note: string
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-ink-200 bg-white p-5 shadow-xs">
      <span
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
        aria-hidden
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <p className="mt-0.5 truncate text-md font-semibold text-ink-900">{value}</p>
        <p className="mt-1 text-sm text-ink-500">{note}</p>
      </div>
      <Badge tone="success">Verified</Badge>
    </div>
  )
}

/* --------------------------------------------------------------------- kyc */

function KycTab() {
  const pending = kycRecords.filter((record) => record.status !== 'verified')

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <Alert tone="warning" title={`${pending.length} record still outstanding`}>
          {pending.map((record) => record.label).join(', ')} — your account continues to transact,
          but settlement limits stay capped until it is on file.
        </Alert>
      )}

      <Card>
        <CardHeader
          title="KYC records"
          description="What is on file, and when it was verified."
          actions={<Button icon={RiFileShield2Line}>Download pack</Button>}
        />
        <TableWrap>
          <THead>
            <TH>Record</TH>
            <TH>Value on file</TH>
            <TH className="w-32">Status</TH>
            <TH>Verified on</TH>
            <TH>Document</TH>
          </THead>
          <TBody>
            {kycRecords.map((record) => (
              <TR key={record.label}>
                <TD className="font-medium text-ink-900">{record.label}</TD>
                <TD className="text-ink-700">{record.value}</TD>
                <TD>
                  <StatusBadge status={record.status} />
                </TD>
                <TD className="tnum text-ink-600">
                  {record.verifiedOn ? formatDate(record.verifiedOn) : '—'}
                </TD>
                <TD>
                  {record.document ? (
                    <MonoCell>{record.document}</MonoCell>
                  ) : (
                    <span className="text-ink-400">Not uploaded</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
        <CardFooter>
          <p className="text-sm text-ink-500">
            To correct a record, raise a ticket — KYC fields cannot be edited from the console.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------------- security */

function SecurityTab() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <CredentialCard
        icon={RiLockPasswordLine}
        title="Change password"
        description="The password you sign in with."
        action="Update password"
        fields={[
          { label: 'Current password', id: 'current-password', type: 'password' },
          {
            label: 'New password',
            id: 'new-password',
            type: 'password',
            placeholder: 'At least 8 characters',
          },
          { label: 'Confirm new password', id: 'confirm-password', type: 'password' },
        ]}
      />
      <CredentialCard
        icon={RiKey2Line}
        title="Change MPIN"
        description="The 6-digit PIN entered alongside your password."
        action="Update MPIN"
        fields={[
          { label: 'Current MPIN', id: 'current-mpin', type: 'password', maxLength: 6 },
          {
            label: 'New MPIN',
            id: 'new-mpin',
            type: 'password',
            placeholder: '6 digits',
            maxLength: 6,
          },
          { label: 'Confirm new MPIN', id: 'confirm-mpin', type: 'password', maxLength: 6 },
        ]}
      />
    </div>
  )
}

type CredentialField = {
  label: string
  id: string
  type: string
  placeholder?: string
  maxLength?: number
}

function CredentialCard({
  icon: Icon,
  title,
  description,
  action,
  fields,
}: {
  icon: typeof RiKey2Line
  title: string
  description: string
  action: string
  fields: CredentialField[]
}) {
  return (
    <Card>
      <div className="border-b border-ink-200 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Icon size={17} className="shrink-0 text-brand-600" aria-hidden />
          <h2 className="text-md font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>
      <form className="space-y-4 p-5" onSubmit={(event) => event.preventDefault()}>
        {fields.map((field) => (
          <Field key={field.id} label={field.label} htmlFor={field.id}>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              autoComplete="off"
            />
          </Field>
        ))}
        <Button type="submit" variant="primary" className="w-full">
          {action}
        </Button>
      </form>
    </Card>
  )
}

/* ---------------------------------------------------------------- activity */

const EVENT_TONE: Record<ActivityEvent['tone'], string> = {
  neutral: 'bg-ink-300',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  danger: 'bg-danger-600',
}

function ActivityTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Active sessions"
          description="Where this account is currently signed in."
          actions={
            <Button icon={RiLogoutCircleLine} variant="danger">
              Sign out everywhere
            </Button>
          }
        />
        <ul className="divide-y divide-ink-100">
          {sessions.map((session) => {
            const Icon = session.device.startsWith('Android') ? RiSmartphoneLine : RiComputerLine
            return (
              <li
                key={`${session.device}-${session.ip}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
              >
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600"
                  aria-hidden
                >
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-base font-medium text-ink-900">
                    {session.device}
                    <span className="font-normal text-ink-500">{session.browser}</span>
                    {session.current && <Badge tone="success">This device</Badge>}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {session.location}
                    <span className="mx-1.5 text-ink-300">·</span>
                    <span className="tnum">{session.ip}</span>
                  </p>
                </div>
                <p className="tnum text-sm text-ink-500">{formatDateTime(session.lastActive)}</p>
                {!session.current && (
                  <Button size="sm" variant="ghost">
                    Revoke
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Recent activity"
          description="Sign-ins, money movement and credential changes."
        />
        <TableWrap>
          <THead>
            <TH className="w-4" />
            <TH>Event</TH>
            <TH>When</TH>
            <TH align="right">IP address</TH>
          </THead>
          <TBody>
            {activityEvents.map((event, index) => (
              <TR key={`${event.event}-${index}`}>
                <TD className="pr-0">
                  <span
                    className={cn('block size-1.5 rounded-full', EVENT_TONE[event.tone])}
                    aria-hidden
                  />
                </TD>
                <TD>
                  <CellStack primary={event.event} secondary={event.detail} />
                </TD>
                <TD className="tnum text-ink-600">{formatDateTime(event.at)}</TD>
                <TD align="right">
                  <MonoCell>{event.ip}</MonoCell>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
        <CardFooter>
          <p className="tnum text-sm text-ink-500">
            Showing the last {count(activityEvents.length)} events
          </p>
          <Button size="sm">Load more</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
