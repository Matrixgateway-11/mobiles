import { useMemo, useState } from 'react'
import {
  RiInboxLine,
  RiArrowUpCircleLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiMailCheckLine,
  RiPhoneLine,
  RiShieldCheckLine,
  RiKey2Line,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/ui/StatCard'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { Badge, InviteStatusBadge } from '@/components/ui/Badge'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { DataList, DataItem } from '@/components/ui/DataList'
import { TableWrap, THead, TH, TBody, TR, TD, CellStack, MonoCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { ROLE_LABEL, type Invitation } from '@/data/network'
import {
  useCurrentAccount,
  useNetwork,
  inboxFor,
  invitationsFrom,
  awaitingAdmin,
  accountById,
  approveInvitation,
  rejectInvitation,
  forwardToAdmin,
} from '@/lib/network'
import { money, formatDate, formatDateTime, count } from '@/lib/format'
import { DocumentStrip, DocumentViewer } from '@/components/DocumentViewer'

const SAMPLE = 100000

export default function Invitations() {
  const account = useCurrentAccount()
  const network = useNetwork()
  const [reviewing, setReviewing] = useState<string | null>(null)

  const inbox = inboxFor(network, account)
  const mine = invitationsFrom(network, account.id)
  const upstream = awaitingAdmin(network, account.id)

  const decided = mine.filter((i) => i.status === 'approved' || i.status === 'rejected')
  const invitation = reviewing ? (network.invitations.find((i) => i.token === reviewing) ?? null) : null

  const isAdmin = account.role === 'admin'

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Invitations' }]}
        title="Invitations"
        description={
          isAdmin
            ? 'Applications waiting on your decision, including everything distributors have passed up.'
            : 'Applications from the links you sent. Review them, then pass them to the admin for the final decision.'
        }
      />

      <StatGrid columns={4}>
        <StatCard
          label="Awaiting your review"
          value={count(inbox.length)}
          meta={isAdmin ? 'Yours to decide' : 'Yours to check first'}
          icon={RiInboxLine}
          tone={inbox.length ? 'brand' : 'neutral'}
        />
        <StatCard
          label={isAdmin ? 'Passed up by distributors' : 'With the admin'}
          value={count(isAdmin ? inbox.filter((i) => i.status === 'forwarded').length : upstream.length)}
          meta={isAdmin ? 'Already reviewed once' : 'Waiting on the final call'}
          icon={RiArrowUpCircleLine}
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={count(decided.filter((i) => i.status === 'approved').length)}
          meta="Accounts created from your links"
          icon={RiCheckboxCircleLine}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={count(decided.filter((i) => i.status === 'rejected').length)}
          icon={RiCloseCircleLine}
          tone="danger"
        />
      </StatGrid>

      {!isAdmin && upstream.length > 0 && (
        <Alert tone="info" className="mt-4">
          {upstream.length} application{upstream.length === 1 ? '' : 's'} you reviewed{' '}
          {upstream.length === 1 ? 'is' : 'are'} with the admin. You will see the outcome here —
          nothing further is needed from you.
        </Alert>
      )}

      <Card className="mt-4">
        <CardHeader
          title="Waiting on you"
          description={
            isAdmin
              ? 'Review the details, set the commission percentage, then approve or reject.'
              : 'Review the details and propose a percentage before passing it up.'
          }
        />
        {inbox.length === 0 ? (
          <EmptyState
            icon={RiInboxLine}
            title="Nothing waiting"
            description="Completed links land here the moment they submit."
            compact
          />
        ) : (
          <InvitationTable
            rows={inbox}
            network={network}
            onReview={setReviewing}
            actionLabel="Review"
          />
        )}
      </Card>

      {mine.length > 0 && (
        <Card className="mt-4">
          <CardHeader
            title="Everything from your links"
            description="The full history, whatever state it reached."
          />
          <InvitationTable
            rows={mine}
            network={network}
            onReview={setReviewing}
            actionLabel="View"
          />
          <CardFooter>
            <p className="tnum text-sm text-ink-500">
              {count(mine.length)} application{mine.length === 1 ? '' : 's'}
            </p>
          </CardFooter>
        </Card>
      )}

      {invitation && (
        <ReviewDialog
          invitation={invitation}
          isAdmin={isAdmin}
          onClose={() => setReviewing(null)}
        />
      )}
    </>
  )
}

function InvitationTable({
  rows,
  network,
  onReview,
  actionLabel,
}: {
  rows: Invitation[]
  network: ReturnType<typeof useNetwork>
  onReview: (token: string) => void
  actionLabel: string
}) {
  return (
    <TableWrap>
      <THead>
        <TH>Applicant</TH>
        <TH className="w-32">For</TH>
        <TH>Invited by</TH>
        <TH>Submitted</TH>
        <TH className="w-32">Status</TH>
        <TH align="right">Rate</TH>
        <TH align="right">Action</TH>
      </THead>
      <TBody>
        {rows.map((invitation) => {
          const inviter = accountById(network, invitation.invitedBy)
          const rate = invitation.commissionPercent ?? invitation.proposedPercent
          return (
            <TR key={invitation.token}>
              <TD className="max-w-64">
                {invitation.submission ? (
                  <CellStack
                    primary={invitation.submission.fullName}
                    secondary={invitation.submission.email}
                  />
                ) : (
                  <CellStack
                    primary={invitation.note || 'Link not opened'}
                    secondary={<MonoCell>{invitation.token}</MonoCell>}
                  />
                )}
              </TD>
              <TD>
                <Badge tone={invitation.inviteRole === 'distributor' ? 'info' : 'neutral'}>
                  {ROLE_LABEL[invitation.inviteRole]}
                </Badge>
              </TD>
              <TD className="text-ink-700">{inviter?.name ?? '—'}</TD>
              <TD className="tnum text-ink-600">
                {invitation.submission ? formatDate(invitation.submission.submittedAt) : '—'}
              </TD>
              <TD>
                <InviteStatusBadge status={invitation.status} />
              </TD>
              <TD align="right" className="tnum text-ink-700">
                {rate != null ? `${rate}%` : '—'}
              </TD>
              <TD align="right">
                <Button
                  size="sm"
                  variant={invitation.submission ? 'secondary' : 'ghost'}
                  disabled={!invitation.submission}
                  onClick={() => onReview(invitation.token)}
                >
                  {actionLabel}
                </Button>
              </TD>
            </TR>
          )
        })}
      </TBody>
    </TableWrap>
  )
}

/* ------------------------------------------------------------------ review */

function ReviewDialog({
  invitation,
  isAdmin,
  onClose,
}: {
  invitation: Invitation
  isAdmin: boolean
  onClose: () => void
}) {
  const network = useNetwork()
  const inviter = accountById(network, invitation.invitedBy)
  const submission = invitation.submission
  const settled = invitation.status === 'approved' || invitation.status === 'rejected'

  const [percent, setPercent] = useState(
    String(invitation.commissionPercent ?? invitation.proposedPercent ?? 1),
  )
  const [rejecting, setRejecting] = useState(false)
  const [viewing, setViewing] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [issued, setIssued] = useState<{ mpin: string; id: string } | null>(null)

  const rate = Number(percent)
  const validRate = Number.isFinite(rate) && rate >= 0 && rate <= 100

  const keep = useMemo(() => (SAMPLE * rate) / 100, [rate])

  if (!submission) return null

  const approve = () => {
    const result = approveInvitation(invitation.token, rate)
    if (result) setIssued({ mpin: result.mpin, id: result.account.id })
  }

  const forward = () => {
    forwardToAdmin(invitation.token, rate)
    onClose()
  }

  const reject = () => {
    rejectInvitation(invitation.token, reason || 'No reason given')
    onClose()
  }

  if (issued) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Approved"
        description={`${submission.fullName} can sign in now.`}
        footer={<Button variant="primary" onClick={onClose}>Done</Button>}
      >
        <Alert tone="success" title="Account created" className="mb-4">
          Merchant code <span className="font-mono">{issued.id}</span>, on {rate}% commission.
        </Alert>
        <div className="rounded-lg border border-ink-200 bg-ink-25 p-4">
          <p className="flex items-center gap-2 text-base font-medium text-ink-900">
            <RiKey2Line size={16} className="text-ink-500" />
            MPIN emailed to {submission.email}
          </p>
          <p className="tnum mt-2 text-3xl font-semibold tracking-[0.1em] text-ink-900">
            {issued.mpin}
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Email delivery is not wired up in this build, so the MPIN is shown here instead. They
            sign in with their email address and these six digits.
          </p>
        </div>
      </Modal>
    )
  }

  if (rejecting) {
    return (
      <Modal
        open
        onClose={() => setRejecting(false)}
        title="Reject this application"
        description={`${submission.fullName} will be told the application was closed.`}
        footer={
          <>
            <Button onClick={() => setRejecting(false)}>Back</Button>
            <Button variant="danger" disabled={!reason.trim()} onClick={reject}>
              Reject application
            </Button>
          </>
        }
      >
        <Field label="Reason" htmlFor="reject-reason" hint="Kept on the record for this applicant.">
          <Textarea
            id="reject-reason"
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="PAN name does not match the bank account"
          />
        </Field>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={submission.fullName}
      description={`Applying as a ${ROLE_LABEL[invitation.inviteRole].toLowerCase()} · invited by ${inviter?.name ?? 'Sai Mobiles'}`}
      footer={
        settled ? (
          <Button onClick={onClose}>Close</Button>
        ) : (
          <>
            <Button variant="danger" onClick={() => setRejecting(true)}>
              Reject
            </Button>
            {isAdmin ? (
              <Button variant="primary" disabled={!validRate} onClick={approve}>
                Approve &amp; create account
              </Button>
            ) : (
              <Button variant="primary" disabled={!validRate} onClick={forward}>
                Send to admin
              </Button>
            )}
          </>
        )
      }
    >
      <div className="space-y-5">
        {invitation.status === 'forwarded' && (
          <Alert tone="warning" title="Already reviewed once">
            {inviter?.name} checked these details on{' '}
            {invitation.forwardedAt ? formatDate(invitation.forwardedAt) : '—'} and proposed{' '}
            <span className="font-semibold">{invitation.proposedPercent}%</span>.
          </Alert>
        )}

        {invitation.status === 'rejected' && (
          <Alert tone="danger" title="Rejected">
            {invitation.rejectionReason}
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <VerificationChip
            icon={RiMailCheckLine}
            label="Email"
            verified={submission.emailVerified}
          />
          <VerificationChip icon={RiPhoneLine} label="Mobile" verified={submission.mobileVerified} />
          <Badge tone="neutral">Submitted {formatDateTime(submission.submittedAt)}</Badge>
        </div>

        <Block title="Applicant">
          <DataItem label="Full name" value={submission.fullName} />
          <DataItem label="Email" value={submission.email} />
          <DataItem label="Mobile" value={<span className="tnum">{submission.mobile}</span>} />
          <DataItem label="Shop or business" value={submission.shopName} />
          <DataItem label="Address" value={submission.address} className="sm:col-span-2" />
        </Block>

        <Block title="Identity">
          <DataItem label="PAN" value={submission.pan} />
          <DataItem label="Aadhaar" value={<span className="tnum">{submission.aadhaar}</span>} />
        </Block>

        <Block title="Bank account">
          <DataItem
            label="Account number"
            value={<span className="tnum">{submission.accountNumber}</span>}
          />
          <DataItem label="IFSC" value={submission.ifsc} />
        </Block>

        <div>
          <h3 className="mb-2 text-xs font-medium text-ink-500">Documents</h3>
          <DocumentStrip documents={submission.documents ?? []} onOpen={setViewing} />
          <p className="mt-2 text-xs text-ink-500">
            Click a scan to open it full size. Check the name on the PAN against the bank account.
          </p>
        </div>

        {!settled && (
          <div className="rounded-lg border border-ink-200 bg-ink-25 p-4">
            <h3 className="flex items-center gap-2 text-md font-semibold text-ink-900">
              <RiShieldCheckLine size={16} className="text-ink-500" />
              {isAdmin ? 'Commission percentage' : 'Percentage you propose'}
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              The share that comes up to you on everything they collect.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <Field label="Rate" htmlFor="rate" className="w-32">
                <div className="relative">
                  <Input
                    id="rate"
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
                <p className="pb-2 text-base text-ink-600">
                  On {money(SAMPLE)} collected,{' '}
                  <span className="tnum font-semibold text-success-700">{money(keep)}</span> comes
                  to you and{' '}
                  <span className="tnum font-semibold text-ink-900">{money(SAMPLE - keep)}</span>{' '}
                  stays with them.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {viewing !== null && (
        <DocumentViewer
          documents={submission.documents ?? []}
          index={viewing}
          onClose={() => setViewing(null)}
          onIndexChange={setViewing}
        />
      )}
    </Modal>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium text-ink-500">{title}</h3>
      <DataList columns={2}>{children}</DataList>
    </div>
  )
}

function VerificationChip({
  icon: Icon,
  label,
  verified,
}: {
  icon: typeof RiMailCheckLine
  label: string
  verified: boolean
}) {
  return (
    <Badge tone={verified ? 'success' : 'warning'}>
      <Icon size={13} aria-hidden />
      {label} {verified ? 'verified' : 'not verified'}
    </Badge>
  )
}
