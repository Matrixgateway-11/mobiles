import type { ReactNode } from 'react'
import {
  RiInformationLine,
  RiAlertLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  type RemixiconComponentType,
} from '@remixicon/react'
import { cn } from '@/lib/cn'

type Tone = 'info' | 'warning' | 'danger' | 'success'

const TONES: Record<Tone, { box: string; icon: string; defaultIcon: RemixiconComponentType }> = {
  info: {
    box: 'border-info-200 bg-info-50 text-info-700',
    icon: 'text-info-600',
    defaultIcon: RiInformationLine,
  },
  warning: {
    box: 'border-warning-200 bg-warning-50 text-warning-700',
    icon: 'text-warning-600',
    defaultIcon: RiAlertLine,
  },
  danger: {
    box: 'border-danger-200 bg-danger-50 text-danger-700',
    icon: 'text-danger-600',
    defaultIcon: RiErrorWarningLine,
  },
  success: {
    box: 'border-success-200 bg-success-50 text-success-800',
    icon: 'text-success-600',
    defaultIcon: RiCheckboxCircleLine,
  },
}

type AlertProps = {
  tone?: Tone
  title?: string
  icon?: RemixiconComponentType
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** A standing notice — the console shows these rather than scrolling a marquee
    past the reader, which is unreadable by design. */
export function Alert({
  tone = 'info',
  title,
  icon,
  action,
  children,
  className,
}: AlertProps) {
  const t = TONES[tone]
  const Icon = icon ?? t.defaultIcon

  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-lg border px-4 py-3', t.box, className)}
    >
      <Icon size={17} className={cn('mt-px shrink-0', t.icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="text-base font-semibold">{title}</p>}
        <div className={cn('text-base leading-relaxed', title && 'mt-0.5 opacity-90')}>
          {children}
        </div>
      </div>
      {action && <div className="shrink-0 pt-px">{action}</div>}
    </div>
  )
}
