import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('scrollbar-slim w-full overflow-x-auto', className)}>
      <table className="w-full min-w-max border-collapse text-left">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-ink-25">
      <tr className="border-b border-ink-200">{children}</tr>
    </thead>
  )
}

type AlignProps = { align?: 'left' | 'right' | 'center' }

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' }

export function TH({
  align = 'left',
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & AlignProps) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-2.5 text-2xs font-semibold tracking-[0.06em] text-ink-500 uppercase',
        'whitespace-nowrap',
        ALIGN[align],
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-ink-100">{children}</tbody>
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('transition-colors hover:bg-ink-25', className)}>{children}</tr>
}

export function TD({
  align = 'left',
  className,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & AlignProps) {
  return (
    <td
      className={cn('px-4 py-3.5 align-middle text-base text-ink-800', ALIGN[align], className)}
      {...props}
    >
      {children}
    </td>
  )
}

/** Primary line plus a quiet second line — beneficiary + account, customer + mobile. */
export function CellStack({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium text-ink-900">{primary}</div>
      {secondary && <div className="mt-0.5 truncate text-xs text-ink-500">{secondary}</div>}
    </div>
  )
}

export function MonoCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('font-mono text-xs tracking-[-0.01em] text-ink-700', className)}>
      {children}
    </span>
  )
}
