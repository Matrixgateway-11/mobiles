import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightSLine } from '@remixicon/react'
import { cn } from '@/lib/cn'

export type Crumb = { label: string; to?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex items-center gap-1 text-sm text-ink-500">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <RiArrowRightSLine size={14} className="text-ink-300" aria-hidden />}
            {item.to ? (
              <Link to={item.to} className="rounded-sm transition-colors hover:text-ink-800">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

type PageHeaderProps = {
  title: string
  description?: string
  breadcrumb?: Crumb[]
  actions?: ReactNode
  aside?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  aside,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-4xl font-semibold tracking-[-0.025em] text-ink-900">{title}</h1>
          {description && <p className="mt-1.5 text-md text-ink-500">{description}</p>}
        </div>
        {(actions || aside) && (
          <div className="flex shrink-0 items-center gap-2">
            {aside}
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export function SectionTitle({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.015em] text-ink-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
