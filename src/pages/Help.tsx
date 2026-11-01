import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiCustomerService2Line,
  RiWhatsappLine,
  RiMailLine,
  RiAlarmWarningLine,
  RiArrowRightUpLine,
  RiArrowDownSLine,
  RiTicket2Line,
  type RemixiconComponentType,
} from '@remixicon/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { supportContacts, supportTopics, type SupportContact } from '@/data/mock'
import { cn } from '@/lib/cn'

const ICONS: Record<SupportContact['kind'], RemixiconComponentType> = {
  phone: RiCustomerService2Line,
  whatsapp: RiWhatsappLine,
  email: RiMailLine,
  escalation: RiAlarmWarningLine,
}

const TONES: Record<SupportContact['kind'], string> = {
  phone: 'bg-brand-50 text-brand-700',
  whatsapp: 'bg-success-50 text-success-700',
  email: 'bg-info-50 text-info-700',
  escalation: 'bg-warning-50 text-warning-700',
}

export default function Help() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Help & support' }]}
        title="Help & support"
        description="Quick question, or raise a ticket to track it."
        actions={
          <Button as={Link} to="/tickets" variant="primary" icon={RiTicket2Line}>
            Raise a ticket
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {supportContacts.map((contact) => (
          <ContactCard key={contact.channel} contact={contact} />
        ))}
      </div>

      <Alert tone="info" className="mt-4">
        Anything that needs a paper trail — a stuck payout, a settlement mismatch, a limit change —
        belongs on a ticket, where it carries a reference and a status you can follow.
      </Alert>

      <Card className="mt-4">
        <CardHeader
          title="Common questions"
          description="The four things merchants ask us most often."
        />
        <Topics />
      </Card>
    </>
  )
}

function ContactCard({ contact }: { contact: SupportContact }) {
  const Icon = ICONS[contact.kind]
  const external = contact.href.startsWith('http')

  return (
    <a
      href={contact.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group flex items-start gap-3.5 rounded-xl border border-ink-200 bg-white p-5 shadow-xs transition-colors hover:border-ink-300 hover:bg-ink-25"
    >
      <span
        className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-lg', TONES[contact.kind])}
        aria-hidden
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-500">{contact.channel}</p>
        <p className="mt-0.5 truncate text-md font-semibold text-ink-900">{contact.detail}</p>
        <p className="mt-1 text-sm text-ink-500">{contact.note}</p>
      </div>
      <RiArrowRightUpLine
        size={16}
        className="mt-1 shrink-0 text-ink-300 transition-colors group-hover:text-ink-600"
        aria-hidden
      />
    </a>
  )
}

function Topics() {
  const [open, setOpen] = useState<string | null>(supportTopics[0].question)

  return (
    <ul className="divide-y divide-ink-100">
      {supportTopics.map((topic) => {
        const expanded = open === topic.question
        return (
          <li key={topic.question}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : topic.question)}
              aria-expanded={expanded}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-ink-25"
            >
              <span className="min-w-0 flex-1 text-base font-medium text-ink-900">
                {topic.question}
              </span>
              <RiArrowDownSLine
                size={16}
                className={cn(
                  'shrink-0 text-ink-400 transition-transform duration-150',
                  expanded && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
            {expanded && (
              <p className="max-w-3xl px-5 pb-4 text-base leading-relaxed text-ink-600">
                {topic.answer}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
