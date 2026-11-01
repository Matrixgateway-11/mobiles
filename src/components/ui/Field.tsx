import { useId, useRef, useState } from 'react'
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react'
import { RiArrowDownSLine, RiSearchLine, RiAttachment2, RiCloseLine } from '@remixicon/react'
import { cn } from '@/lib/cn'

const CONTROL =
  'h-9 w-full rounded-lg border border-ink-200 bg-white px-3 text-base text-ink-900 ' +
  'placeholder:text-ink-400 transition-colors ' +
  'hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none ' +
  'disabled:bg-ink-50 disabled:text-ink-400'

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />
}

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <RiSearchLine
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
        aria-hidden
      />
      <input type="search" className={cn(CONTROL, 'pl-9', className)} {...props} />
    </div>
  )
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(CONTROL, 'cursor-pointer appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <RiArrowDownSLine
        size={16}
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-400"
        aria-hidden
      />
    </div>
  )
}

export function DateInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="date"
      className={cn(CONTROL, 'tnum cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-55', className)}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'h-auto resize-y py-2', className)} {...props} />
}

/** Native file input, dressed as a control. The chosen name replaces the prompt
    so the row still reads as one field rather than a button plus a caption. */
export function FileInput({
  id,
  accept,
  prompt = 'Choose file',
  onChange,
  onFile,
  className,
}: {
  id?: string
  accept?: string
  prompt?: string
  /** Reports the chosen filename, or '' when cleared. */
  onChange?: (name: string) => void
  /** The file itself, for anything that needs to read or store it. */
  onFile?: (file: File | null) => void
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div
      className={cn(
        'flex h-9 w-full items-center gap-2 rounded-lg border border-ink-200 bg-white pr-1.5 pl-3',
        'transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15 hover:border-ink-300',
        className,
      )}
    >
      <RiAttachment2 size={15} className="shrink-0 text-ink-400" aria-hidden />
      <label
        htmlFor={inputId}
        className={cn(
          'min-w-0 flex-1 cursor-pointer truncate text-base',
          name ? 'text-ink-900' : 'text-ink-400',
        )}
      >
        {name || prompt}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          setName(file?.name ?? '')
          onChange?.(file?.name ?? '')
          onFile?.(file)
        }}
      />
      {name && (
        <button
          type="button"
          aria-label="Remove file"
          onClick={() => {
            setName('')
            onChange?.('')
            onFile?.(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <RiCloseLine size={14} />
        </button>
      )}
    </div>
  )
}

export function Checkbox({
  id,
  checked,
  onChange,
  children,
  className,
}: {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  className?: string
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-ink-300 accent-brand-700"
      />
      <label htmlFor={inputId} className="cursor-pointer text-base leading-relaxed text-ink-700">
        {children}
      </label>
    </div>
  )
}
