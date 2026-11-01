import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiStackLine,
  RiMailLine,
  RiPhoneLine,
  RiBankCardLine,
  RiFingerprintLine,
  RiCameraLine,
  RiBankLine,
  RiShieldCheckLine,
  RiInformationLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Alert } from '@/components/ui/Alert'
import { Field, Input, Select, FileInput, Checkbox } from '@/components/ui/Field'
import { cn } from '@/lib/cn'

const TABS = [
  { value: 'full', label: 'Full onboarding' },
  { value: 'quick', label: 'Quick onboarding' },
] as const

const DOC_HINT = 'Max 3 MB · JPG, PNG or PDF'
const IMG_HINT = 'Max 3 MB · JPG or PNG'

export default function AddUser() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('full')

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Home', to: '/dashboard' },
          { label: 'My team & activity', to: '/users' },
          { label: 'Add user' },
        ]}
        title="Add user"
        description="Onboard someone into your downline — the same verification a Sai Mobiles merchant goes through."
        aside={
          <IconButton
            icon={RiArrowLeftLine}
            label="Back to my team"
            onClick={() => navigate('/users')}
          />
        }
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-6" />

      {tab === 'full' ? <FullOnboarding /> : <QuickOnboarding />}
    </>
  )
}

/* ---------------------------------------------------------------- sections */

function FormSection({
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
    <Card>
      <div className="flex items-start gap-3 border-b border-ink-200 px-5 py-4">
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
      <div className="p-5">{children}</div>
    </Card>
  )
}

/** Input with a trailing verify/OTP action on the same line. The hint belongs
    to the row rather than the field, so it never pushes the button off-line. */
function InlineAction({
  children,
  action,
  hint,
}: {
  children: ReactNode
  action: ReactNode
  hint?: string
}) {
  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        <div className="shrink-0">{action}</div>
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  )
}

function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2', className)}>{children}</div>
}

/* --------------------------------------------------------- full onboarding */

function FullOnboarding() {
  const [merchantType, setMerchantType] = useState('Retailer')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [pan, setPan] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [account, setAccount] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
      <form className="space-y-4 lg:col-span-2" onSubmit={(event) => event.preventDefault()}>
        <FormSection
          icon={RiStackLine}
          title="Merchant type"
          description="You can onboard accounts one level below your own."
        >
          <Field label="Account level" htmlFor="merchant-type" className="sm:max-w-xs">
            <Select
              id="merchant-type"
              value={merchantType}
              onChange={(event) => setMerchantType(event.target.value)}
            >
              <option value="Sub-Distributor">Sub-Distributor</option>
              <option value="Retailer">Retailer</option>
            </Select>
          </Field>
          <p className="mt-3 text-sm text-ink-500">
            A Sub-Distributor can build their own downline. A Retailer transacts only on their own
            account.
          </p>
        </FormSection>

        <FormSection
          icon={RiMailLine}
          title="Email verification"
          description="A one-time code confirms the address belongs to them."
        >
          <InlineAction
            action={
              <Button disabled={!email.includes('@')}>Send OTP</Button>
            }
          >
            <Field label="Email address" htmlFor="user-email">
              <Input
                id="user-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
          </InlineAction>
        </FormSection>

        <FormSection icon={RiPhoneLine} title="Mobile verification">
          <InlineAction
            action={<Button disabled={mobile.length !== 10}>Send OTP</Button>}
            hint="10 digits, no country code"
          >
            <Field label="Mobile number" htmlFor="user-mobile">
              <Input
                id="user-mobile"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={mobile}
                onChange={(event) => setMobile(event.target.value.replace(/\D/g, ''))}
              />
            </Field>
          </InlineAction>
        </FormSection>

        <FormSection
          icon={RiBankCardLine}
          title="PAN verification"
          description="Checked against the income tax database before the account is created."
        >
          <InlineAction action={<Button disabled={pan.length !== 10}>Verify</Button>}>
            <Field label="PAN number" htmlFor="user-pan">
              <Input
                id="user-pan"
                maxLength={10}
                placeholder="ABCDE1234F"
                className="uppercase"
                value={pan}
                onChange={(event) => setPan(event.target.value.toUpperCase())}
              />
            </Field>
          </InlineAction>
          <Grid className="mt-5">
            <Field label="Front image" hint={DOC_HINT}>
              <FileInput accept="image/jpeg,image/png,application/pdf" />
            </Field>
            <Field label="Back image (optional)" hint={DOC_HINT}>
              <FileInput accept="image/jpeg,image/png,application/pdf" />
            </Field>
          </Grid>
        </FormSection>

        <FormSection icon={RiFingerprintLine} title="Aadhaar verification">
          <InlineAction action={<Button disabled={aadhaar.length !== 12}>Send OTP</Button>}>
            <Field label="Aadhaar number" htmlFor="user-aadhaar">
              <Input
                id="user-aadhaar"
                inputMode="numeric"
                maxLength={12}
                placeholder="12-digit number"
                value={aadhaar}
                onChange={(event) => setAadhaar(event.target.value.replace(/\D/g, ''))}
              />
            </Field>
          </InlineAction>
          <Grid className="mt-5">
            <Field label="Front image" hint={DOC_HINT}>
              <FileInput accept="image/jpeg,image/png,application/pdf" />
            </Field>
            <Field label="Back image" hint={DOC_HINT}>
              <FileInput accept="image/jpeg,image/png,application/pdf" />
            </Field>
          </Grid>
        </FormSection>

        <FormSection
          icon={RiCameraLine}
          title="Customer photo"
          description="A clear head-and-shoulders photograph, taken in daylight."
        >
          <Field label="Photograph" hint={IMG_HINT} className="sm:max-w-md">
            <FileInput accept="image/jpeg,image/png" prompt="Choose photo" />
          </Field>
        </FormSection>

        <FormSection
          icon={RiBankLine}
          title="Bank details"
          description="Settlements are credited to this account, so it is penny-drop verified."
        >
          <Grid>
            <Field label="Account number" htmlFor="user-account">
              <Input
                id="user-account"
                inputMode="numeric"
                placeholder="Account number"
                value={account}
                onChange={(event) => setAccount(event.target.value.replace(/\D/g, ''))}
              />
            </Field>
            <Field label="IFSC code" htmlFor="user-ifsc">
              <Input
                id="user-ifsc"
                maxLength={11}
                placeholder="HDFC0000123"
                className="uppercase"
                value={ifsc}
                onChange={(event) => setIfsc(event.target.value.toUpperCase())}
              />
            </Field>
          </Grid>
          <div className="mt-5">
            <Button disabled={account.length < 9 || ifsc.length !== 11}>Verify bank account</Button>
          </div>
          <Field label="Cancelled cheque" hint={DOC_HINT} className="mt-5 sm:max-w-md">
            <FileInput accept="image/jpeg,image/png,application/pdf" />
          </Field>
        </FormSection>

        <Card className="p-5">
          <Checkbox id="agree-terms" checked={agreed} onChange={setAgreed}>
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-brand-700 underline underline-offset-2">
              terms and conditions
            </Link>
            . I understand that I am responsible for any chargeback raised against this merchant's
            transactions, and I accept full liability for them.
          </Checkbox>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-2">
          <Button as={Link} to="/users">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!agreed}>
            Submit enrollment
          </Button>
        </div>
      </form>

      <Checklist />
    </div>
  )
}

const REQUIRED = [
  'PAN card, front image',
  'Aadhaar card, front and back',
  'A recent photograph',
  'Cancelled cheque for the settlement account',
  'A mobile number and email they can receive an OTP on',
]

function Checklist() {
  return (
    <div className="space-y-4 lg:sticky lg:top-20">
      <Card>
        <div className="border-b border-ink-200 px-5 py-4">
          <h2 className="text-md font-semibold tracking-[-0.01em] text-ink-900">
            Before you start
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">Have these to hand — the form expires idle.</p>
        </div>
        <ul className="divide-y divide-ink-100">
          {REQUIRED.map((item) => (
            <li key={item} className="flex items-start gap-2.5 px-5 py-3 text-base text-ink-700">
              <RiShieldCheckLine size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Alert tone="info" icon={RiInformationLine}>
        Verification runs as you fill the form. The account is created only once PAN, Aadhaar and
        the bank account have all come back verified.
      </Alert>
    </div>
  )
}

/* -------------------------------------------------------- quick onboarding */

function QuickOnboarding() {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="max-w-2xl space-y-4">
      <Alert tone="warning" title="Limited account">
        Quick onboarding creates the account with only mobile and email verified. It cannot transact
        until PAN, Aadhaar and bank details are completed from their own console.
      </Alert>

      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <FormSection icon={RiStackLine} title="Account details">
          <Grid>
            <Field label="Full name" htmlFor="quick-name">
              <Input id="quick-name" placeholder="As printed on their PAN" />
            </Field>
            <Field label="Account level" htmlFor="quick-type">
              <Select id="quick-type" defaultValue="Retailer">
                <option value="Sub-Distributor">Sub-Distributor</option>
                <option value="Retailer">Retailer</option>
              </Select>
            </Field>
            <Field label="Mobile number" htmlFor="quick-mobile">
              <Input id="quick-mobile" inputMode="numeric" maxLength={10} placeholder="9876543210" />
            </Field>
            <Field label="Email address" htmlFor="quick-email">
              <Input id="quick-email" type="email" placeholder="name@example.com" />
            </Field>
          </Grid>
        </FormSection>

        <Card className="p-5">
          <Checkbox id="quick-agree" checked={agreed} onChange={setAgreed}>
            I accept liability for any chargeback raised against this merchant's transactions until
            their KYC is complete.
          </Checkbox>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-2">
          <Button as={Link} to="/users">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!agreed}>
            Create account
          </Button>
        </div>
      </form>
    </div>
  )
}
