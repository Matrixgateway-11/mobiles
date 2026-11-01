import { useState, type ReactNode } from 'react'
import { RiFileCopyLine, RiCheckLine } from '@remixicon/react'
import { cn } from '@/lib/cn'

/** Label-over-value pairs for read-only detail panels. A two-column grid keeps
    the eye on one scan line instead of hunting across a wide row. */
export function DataList({
  columns = 2,
  children,
  className,
}: {
  columns?: 1 | 2 | 3
  children: ReactNode
  className?: string
}) {
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }[columns]
  return <dl className={cn('grid grid-cols-1 gap-x-8 gap-y-5', cols, className)}>{children}</dl>
}

export function DataItem({
  label,
  value,
  copy,
  className,
}: {
  label: string
  value: ReactNode
  copy?: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-xs font-medium text-ink-500">{label}</dt>
      <dd className="mt-1 flex items-center gap-1.5 text-base text-ink-900">
        <span className="min-w-0 truncate font-medium">{value || '—'}</span>
        {copy && <CopyButton value={copy} label={label} />}
      </dd>
    </div>
  )
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setDone(true)
      window.setTimeout(() => setDone(false), 1400)
    })
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? `${label} copied` : `Copy ${label}`}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
    >
      {done ? (
        <RiCheckLine size={14} className="text-success-600" />
      ) : (
        <RiFileCopyLine size={14} />
      )}
    </button>
  )
}
