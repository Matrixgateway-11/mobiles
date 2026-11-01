import { useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import {
  RiCheckLine,
  RiMailLine,
  RiPhoneLine,
  RiBankCardLine,
  RiFingerprintLine,
  RiCameraLine,
  RiBankLine,
  RiUser3Line,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiLinkUnlinkM,
  RiCheckboxCircleFill,
  RiInformationLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Field, Input, FileInput, Checkbox } from '@/components/ui/Field'
import { DataList, DataItem } from '@/components/ui/DataList'
import { ROLE_LABEL, type Submission } from '@/data/network'
import { useNetwork, invitationByToken, accountById, submitOnboarding } from '@/lib/network'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const DOC_HINT = 'Max 3 MB · JPG, PNG or PDF'
const YEAR = new Date().getFullYear()

const STEPS = ['Your details', 'Identity', 'Bank account', 'Review'] as const

/** "12 digits — 5 entered", or nothing once the field is the right length. */
const counted = (length: number, required: number, unit: string) =>
  length === required ? undefined : `${required} ${unit} — ${length} entered`

const sentenceList = (items: string[]) =>
  items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`

/* The applicant has no account and no session — this page is reached by token
   alone, so everything it needs comes from the invitation. */
export default function PublicOnboarding() {
  const { token = '' } = useParams()
  const network = useNetwork()
  // Read the clock once on mount; an expiry check that re-evaluates on every
  // render is both impure and pointless.
  const [now] = useState(() => Date.now())
  const invitation = invitationByToken(network, token)
  const inviter = accountById(network, invitation?.invitedBy ?? null)

  if (!invitation) {
    return (
      <Shell>
        <Notice
          icon={RiLinkUnlinkM}
          title="This link is not valid"
          body="It may have been revoked, or the address was mistyped. Ask whoever sent it for a new one."
        />
      </Shell>
    )
  }

  if (new Date(invitation.expiresAt).getTime() < now && invitation.status === 'pending') {
    return (
      <Shell>
        <Notice
          icon={RiLinkUnlinkM}
          title="This link has expired"
          body={`It was valid until ${formatDate(invitation.expiresAt)}. Ask ${inviter?.name ?? 'the sender'} to send a fresh one.`}
        />
      </Shell>
    )
  }

  if (invitation.status !== 'pending') {
    return (
      <Shell>
        <Submitted
          name={invitation.submission?.fullName ?? ''}
          reviewer={inviter?.name ?? 'Sai Mobiles'}
          decided={invitation.status === 'approved' || invitation.status === 'rejected'}
          approved={invitation.status === 'approved'}
        />
      </Shell>
    )
  }

  return (
    <Shell>
      <Form
        token={token}
        role={ROLE_LABEL[invitation.inviteRole]}
        inviter={inviter?.name ?? 'Sai Mobiles'}
      />
    </Shell>
  )
}

/* ------------------------------------------------------------------- shell */

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Logo variant="dark" />
          <span className="text-sm text-ink-500">Merchant onboarding</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>

      <footer className="border-t border-ink-200 bg-white px-4 py-5 lg:px-8">
        <p className="mx-auto w-full max-w-3xl text-sm text-ink-500">
          © {YEAR} Sai Mobiles
          <span className="mx-1.5 text-ink-300">·</span>
          Your documents are used only for KYC verification.
        </p>
      </footer>
    </div>
  )
}

function Notice({
  icon: Icon,
  title,
  body,
}: {
  icon: RemixiconComponentType
  title: string
  body: string
}) {
  return (
    <Card className="px-6 py-16 text-center">
      <span
        className="inline-flex size-12 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-ink-400"
        aria-hidden
      >
        <Icon size={22} />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-ink-900">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-ink-500">{body}</p>
    </Card>
  )
}

function Submitted({
  name,
  reviewer,
  decided,
  approved,
}: {
  name: string
  reviewer: string
  decided: boolean
  approved: boolean
}) {
  return (
    <Card className="px-6 py-16 text-center">
      <span
        className="inline-flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600"
        aria-hidden
      >
        <RiCheckboxCircleFill size={28} />
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-ink-900">
        {decided ? (approved ? 'You are approved' : 'Application closed') : 'Thank you'}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-md leading-relaxed text-ink-600">
        {decided
          ? approved
            ? 'Your account is live. Check your email for your merchant code and MPIN, then sign in.'
            : 'This application has been closed. Contact whoever invited you if you think that is wrong.'
          : `Your details are with ${reviewer} for review. You will get an email with your MPIN once the account is approved.`}
      </p>
      {name && !decided && (
        <p className="mt-6 text-sm text-ink-500">
          Submitted as <span className="font-medium text-ink-800">{name}</span>
        </p>
      )}
      {decided && approved && (
        <Button as="a" href="/login" variant="primary" className="mt-6">
          Go to sign in
        </Button>
      )}
    </Card>
  )
}

/* -------------------------------------------------------------------- form */

const empty = {
  fullName: '',
  email: '',
  mobile: '',
  shopName: '',
  address: '',
  pan: '',
  panFront: '',
  panBack: '',
  aadhaar: '',
  aadhaarFront: '',
  aadhaarBack: '',
  photo: '',
  accountNumber: '',
  ifsc: '',
  cancelledCheque: '',
}

function Form({ token, role, inviter }: { token: string; role: string; inviter: string }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(empty)
  const [emailVerified, setEmailVerified] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const set = <K extends keyof typeof empty>(key: K, value: string) =>
    setValues((current) => ({ ...current, [key]: value }))

  /* A disabled button that will not say why is a dead end. Each step reports
     what is still outstanding, in the applicant's words. */
  const missing = useMemo(() => {
    const need: string[][] = [[], [], [], []]

    if (!values.fullName.trim()) need[0].push('your full name')
    if (!emailVerified) need[0].push('a verified email address')
    if (values.mobile.length !== 10) need[0].push('a 10-digit mobile number')

    if (values.pan.length !== 10) need[1].push('a 10-character PAN')
    if (!values.panFront) need[1].push('the PAN front image')
    if (values.aadhaar.length !== 12) need[1].push('a 12-digit Aadhaar number')
    if (!values.aadhaarFront) need[1].push('the Aadhaar front image')
    if (!values.aadhaarBack) need[1].push('the Aadhaar back image')
    if (!values.photo) need[1].push('a photograph')

    if (values.accountNumber.length < 9) need[2].push('your account number')
    if (values.ifsc.length !== 11) need[2].push('an 11-character IFSC code')
    if (!values.cancelledCheque) need[2].push('a cancelled cheque')

    if (!agreed) need[3].push('your confirmation')

    return need
  }, [values, emailVerified, agreed])

  const complete = useMemo(() => missing.map((list) => list.length === 0), [missing])

  const submit = () => {
    const submission: Submission = {
      ...values,
      emailVerified,
      mobileVerified: false,
      submittedAt: new Date().toISOString(),
    }
    submitOnboarding(token, submission)
  }

  return (
    <>
      <header className="mb-6">
        <Badge tone="brand">Onboarding as {role}</Badge>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink-900">
          Tell us about yourself
        </h1>
        <p className="mt-1.5 text-md text-ink-500">
          {inviter} invited you to join Sai Mobiles. It takes about five minutes, and you will need
          your PAN, Aadhaar and a cancelled cheque.
        </p>
      </header>

      <Stepper steps={STEPS} current={step} complete={complete} />

      <Card className="mt-5">
        <div className="p-5 sm:p-6">
          {step === 0 && (
            <StepDetails
              values={values}
              set={set}
              emailVerified={emailVerified}
              onVerified={() => setEmailVerified(true)}
            />
          )}
          {step === 1 && <StepIdentity values={values} set={set} />}
          {step === 2 && <StepBank values={values} set={set} />}
          {step === 3 && (
            <StepReview
              values={values}
              role={role}
              agreed={agreed}
              setAgreed={setAgreed}
              onEdit={setStep}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 px-5 py-4">
          <Button
            icon={RiArrowLeftLine}
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2">
            {missing[step].length > 0 && (
              <p className="min-w-0 text-sm text-ink-500 sm:text-right">
                Still needed: {sentenceList(missing[step])}
              </p>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                variant="primary"
                iconAfter={RiArrowRightLine}
                disabled={!complete[step]}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button variant="primary" disabled={!agreed} onClick={submit}>
                Submit application
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  )
}

function Stepper({
  steps,
  current,
  complete,
}: {
  steps: readonly string[]
  current: number
  complete: boolean[]
}) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, index) => {
        const done = index < current && complete[index]
        const active = index === current
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                'inline-flex size-6 shrink-0 items-center justify-center rounded-full text-2xs font-semibold tracking-normal',
                done
                  ? 'bg-success-600 text-white'
                  : active
                    ? 'bg-brand-700 text-white'
                    : 'bg-ink-200 text-ink-600',
              )}
            >
              {done ? <RiCheckLine size={13} /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden truncate text-sm sm:block',
                active ? 'font-medium text-ink-900' : 'text-ink-500',
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span
                className={cn('h-px min-w-4 flex-1', done ? 'bg-success-300' : 'bg-ink-200')}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

type Values = typeof empty
type Setter = <K extends keyof Values>(key: K, value: string) => void

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: RemixiconComponentType
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-ink-100 not-first:mt-6 not-first:border-t not-first:pt-6">
      <div className="flex items-start gap-3">
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
          aria-hidden
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <h2 className="text-md font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
)

/* ------------------------------------------------------------------ step 1 */

function StepDetails({
  values,
  set,
  emailVerified,
  onVerified,
}: {
  values: Values
  set: Setter
  emailVerified: boolean
  onVerified: () => void
}) {
  const [sentCode, setSentCode] = useState('')
  const [entered, setEntered] = useState('')

  const send = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setSentCode(code)
    setEntered('')
  }

  return (
    <>
      <Section icon={RiUser3Line} title="Your name">
        <Grid>
          <Field label="Full name" htmlFor="ob-name" hint="Exactly as printed on your PAN">
            <Input
              id="ob-name"
              value={values.fullName}
              onChange={(event) => set('fullName', event.target.value)}
              placeholder="As printed on your PAN"
            />
          </Field>
          <Field label="Shop or business name (optional)" htmlFor="ob-shop">
            <Input
              id="ob-shop"
              value={values.shopName}
              onChange={(event) => set('shopName', event.target.value)}
              placeholder="Sriram Mobiles"
            />
          </Field>
        </Grid>
      </Section>

      <Section
        icon={RiMailLine}
        title="Email address"
        description="We send your MPIN here once you are approved, so it has to be verified."
      >
        <div className="flex items-end gap-2">
          <Field label="Email" htmlFor="ob-email" className="min-w-0 flex-1">
            <Input
              id="ob-email"
              type="email"
              value={values.email}
              disabled={emailVerified}
              onChange={(event) => set('email', event.target.value)}
              placeholder="name@example.com"
            />
          </Field>
          <Button
            disabled={!values.email.includes('@') || emailVerified}
            onClick={send}
            className="shrink-0"
          >
            {sentCode ? 'Resend code' : 'Send code'}
          </Button>
        </div>

        {emailVerified ? (
          <p className="mt-3 flex items-center gap-1.5 text-base font-medium text-success-700">
            <RiCheckLine size={16} />
            Email verified
          </p>
        ) : (
          sentCode && (
            <div className="mt-4">
              <Alert tone="info" icon={RiInformationLine} className="mb-3">
                Email delivery is not wired up in this build. Your code is{' '}
                <span className="tnum font-semibold">{sentCode}</span>.
              </Alert>
              <div className="flex items-end gap-2">
                <Field label="Verification code" htmlFor="ob-code" className="w-40">
                  <Input
                    id="ob-code"
                    inputMode="numeric"
                    maxLength={6}
                    className="tnum"
                    value={entered}
                    onChange={(event) => setEntered(event.target.value.replace(/\D/g, ''))}
                    placeholder="6 digits"
                  />
                </Field>
                <Button
                  variant="primary"
                  disabled={entered !== sentCode}
                  onClick={onVerified}
                  className="shrink-0"
                >
                  Verify
                </Button>
              </div>
              {entered.length === 6 && entered !== sentCode && (
                <p className="mt-2 text-sm text-danger-700">That code does not match.</p>
              )}
            </div>
          )
        )}
      </Section>

      <Section icon={RiPhoneLine} title="Mobile number">
        <Field
          label="Mobile"
          htmlFor="ob-mobile"
          hint="10 digits. SMS verification is not switched on yet, so your reviewer will confirm this with you."
          className="sm:max-w-xs"
        >
          <Input
            id="ob-mobile"
            inputMode="numeric"
            maxLength={10}
            className="tnum"
            value={values.mobile}
            onChange={(event) => set('mobile', event.target.value.replace(/\D/g, ''))}
            placeholder="9876543210"
          />
        </Field>
      </Section>
    </>
  )
}

/* ------------------------------------------------------------------ step 2 */

function StepIdentity({ values, set }: { values: Values; set: Setter }) {
  return (
    <>
      <Section
        icon={RiBankCardLine}
        title="PAN"
        description="Checked against the income tax database before your account is created."
      >
        <Field
          label="PAN number"
          htmlFor="ob-pan"
          hint={counted(values.pan.length, 10, 'characters')}
          className="mb-5 sm:max-w-xs"
        >
          <Input
            id="ob-pan"
            maxLength={10}
            className="uppercase"
            value={values.pan}
            onChange={(event) => set('pan', event.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
          />
        </Field>
        <Grid>
          <Field label="Front image" hint={DOC_HINT}>
            <FileInput
              accept="image/jpeg,image/png,application/pdf"
              onChange={(name) => set('panFront', name)}
            />
          </Field>
          <Field label="Back image (optional)" hint={DOC_HINT}>
            <FileInput
              accept="image/jpeg,image/png,application/pdf"
              onChange={(name) => set('panBack', name)}
            />
          </Field>
        </Grid>
      </Section>

      <Section icon={RiFingerprintLine} title="Aadhaar">
        <Field
          label="Aadhaar number"
          htmlFor="ob-aadhaar"
          hint={counted(values.aadhaar.length, 12, 'digits')}
          className="mb-5 sm:max-w-xs"
        >
          <Input
            id="ob-aadhaar"
            inputMode="numeric"
            maxLength={12}
            className="tnum"
            value={values.aadhaar}
            onChange={(event) => set('aadhaar', event.target.value.replace(/\D/g, ''))}
            placeholder="12-digit number"
          />
        </Field>
        <Grid>
          <Field label="Front image" hint={DOC_HINT}>
            <FileInput
              accept="image/jpeg,image/png,application/pdf"
              onChange={(name) => set('aadhaarFront', name)}
            />
          </Field>
          <Field label="Back image" hint={DOC_HINT}>
            <FileInput
              accept="image/jpeg,image/png,application/pdf"
              onChange={(name) => set('aadhaarBack', name)}
            />
          </Field>
        </Grid>
      </Section>

      <Section
        icon={RiCameraLine}
        title="Photograph"
        description="A clear head-and-shoulders photo, taken in daylight."
      >
        <Field label="Photo" hint="Max 3 MB · JPG or PNG" className="sm:max-w-md">
          <FileInput
            accept="image/jpeg,image/png"
            prompt="Choose photo"
            onChange={(name) => set('photo', name)}
          />
        </Field>
      </Section>
    </>
  )
}

/* ------------------------------------------------------------------ step 3 */

function StepBank({ values, set }: { values: Values; set: Setter }) {
  return (
    <>
      <Section
        icon={RiBankLine}
        title="Settlement account"
        description="Your collections are credited here, so the account is penny-drop verified."
      >
        <Grid>
          <Field label="Account number" htmlFor="ob-account">
            <Input
              id="ob-account"
              inputMode="numeric"
              className="tnum"
              value={values.accountNumber}
              onChange={(event) => set('accountNumber', event.target.value.replace(/\D/g, ''))}
              placeholder="Account number"
            />
          </Field>
          <Field
            label="IFSC code"
            htmlFor="ob-ifsc"
            hint={counted(values.ifsc.length, 11, 'characters')}
          >
            <Input
              id="ob-ifsc"
              maxLength={11}
              className="uppercase"
              value={values.ifsc}
              onChange={(event) => set('ifsc', event.target.value.toUpperCase())}
              placeholder="HDFC0000123"
            />
          </Field>
        </Grid>
        <Field label="Cancelled cheque" hint={DOC_HINT} className="mt-5 sm:max-w-md">
          <FileInput
            accept="image/jpeg,image/png,application/pdf"
            onChange={(name) => set('cancelledCheque', name)}
          />
        </Field>
      </Section>

      <Section icon={RiUser3Line} title="Address">
        <Field label="Registered address (optional)" htmlFor="ob-address">
          <Input
            id="ob-address"
            value={values.address}
            onChange={(event) => set('address', event.target.value)}
            placeholder="Door number, street, area, city, state, PIN"
          />
        </Field>
      </Section>
    </>
  )
}

/* ------------------------------------------------------------------ step 4 */

function StepReview({
  values,
  role,
  agreed,
  setAgreed,
  onEdit,
}: {
  values: Values
  role: string
  agreed: boolean
  setAgreed: (value: boolean) => void
  onEdit: (step: number) => void
}) {
  return (
    <>
      <h2 className="text-xl font-semibold tracking-[-0.015em] text-ink-900">
        Check before you send
      </h2>
      <p className="mt-1 text-base text-ink-500">
        You cannot change these once submitted — your reviewer would have to send a fresh link.
      </p>

      <ReviewBlock title="Your details" onEdit={() => onEdit(0)}>
        <DataItem label="Full name" value={values.fullName} />
        <DataItem
          label="Email"
          value={
            <span className="flex items-center gap-1.5">
              {values.email}
              <RiCheckLine size={14} className="text-success-600" aria-label="verified" />
            </span>
          }
        />
        <DataItem label="Mobile" value={<span className="tnum">{values.mobile}</span>} />
        <DataItem label="Shop or business" value={values.shopName} />
      </ReviewBlock>

      <ReviewBlock title="Identity" onEdit={() => onEdit(1)}>
        <DataItem label="PAN" value={values.pan} />
        <DataItem label="Aadhaar" value={<span className="tnum">{values.aadhaar}</span>} />
        <DataItem label="PAN document" value={values.panFront} />
        <DataItem
          label="Aadhaar documents"
          value={[values.aadhaarFront, values.aadhaarBack].filter(Boolean).join(', ')}
        />
        <DataItem label="Photograph" value={values.photo} />
      </ReviewBlock>

      <ReviewBlock title="Bank account" onEdit={() => onEdit(2)}>
        <DataItem label="Account number" value={<span className="tnum">{values.accountNumber}</span>} />
        <DataItem label="IFSC" value={values.ifsc} />
        <DataItem label="Cancelled cheque" value={values.cancelledCheque} />
        <DataItem label="Address" value={values.address} />
      </ReviewBlock>

      <div className="mt-6 rounded-lg border border-ink-200 bg-ink-25 p-4">
        <Checkbox id="ob-agree" checked={agreed} onChange={setAgreed}>
          I confirm these details are mine and correct, and I agree to the Sai Mobiles terms for a{' '}
          {role.toLowerCase()} account.
        </Checkbox>
      </div>
    </>
  )
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <section className="mt-6 border-t border-ink-100 pt-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-md font-semibold text-ink-900">{title}</h3>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <DataList columns={2}>{children}</DataList>
    </section>
  )
}
