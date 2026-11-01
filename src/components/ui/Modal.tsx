import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useOverlayLayer } from '@/lib/overlay-stack'
import { createPortal } from 'react-dom'
import { RiCloseLine } from '@remixicon/react'
import { cn } from '@/lib/cn'

const WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: keyof typeof WIDTHS
  footer?: ReactNode
  children: ReactNode
}

/** Overlays are the one place real elevation is earned — everything else in the
    console is a hairline. Escape, the scrim and the close button all dismiss. */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const isTopmost = useOverlayLayer(open)

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      // A viewer opened on top of this dialog owns Escape until it closes.
      if (event.key === 'Escape' && isTopmost()) onClose()
    }
    document.addEventListener('keydown', onKey)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, onClose, isTopmost])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 bg-ink-950/45 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          // The body scrolls, not the page: a long review dialog keeps its
          // title and its Approve button in view the whole way down.
          'relative my-auto flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-xl',
          'border border-ink-200 bg-white shadow-lg outline-none sm:max-h-[calc(100vh-3rem)]',
          WIDTHS[size],
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-[-0.015em] text-ink-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-0.5 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-ink-200 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
