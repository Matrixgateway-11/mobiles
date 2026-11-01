import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDownload2Line,
  RiFileTextLine,
  RiImageLine,
  RiEyeOffLine,
} from '@remixicon/react'
import { DOC_LABEL, isImage, isPdf, readableSize, type UploadedDoc } from '@/lib/documents'
import { useOverlayLayer } from '@/lib/overlay-stack'
import { cn } from '@/lib/cn'

/* Opening a scan during review.

   A reviewer checking whether the name on a PAN matches the bank account needs
   to see the card, not its filename. This is the whole set, so they can step
   through six documents without closing and reopening anything. */

export function DocumentStrip({
  documents,
  onOpen,
}: {
  documents: UploadedDoc[]
  onOpen: (index: number) => void
}) {
  if (documents.length === 0) {
    return <p className="text-base text-ink-400">Nothing was uploaded.</p>
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {documents.map((doc, index) => (
        <li key={doc.kind}>
          <button
            type="button"
            onClick={() => onOpen(index)}
            disabled={!doc.url}
            className={cn(
              'group block w-full overflow-hidden rounded-lg border border-ink-200 bg-white text-left',
              'transition-colors hover:border-ink-300 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <span className="flex h-20 items-center justify-center bg-ink-50">
              {doc.url && isImage(doc) ? (
                <img src={doc.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-ink-400" aria-hidden>
                  {doc.url ? <RiFileTextLine size={22} /> : <RiEyeOffLine size={22} />}
                </span>
              )}
            </span>
            <span className="block px-2.5 py-2">
              <span className="block truncate text-sm font-medium text-ink-800">
                {DOC_LABEL[doc.kind]}
              </span>
              <span className="block truncate text-2xs tracking-normal text-ink-500">
                {doc.url ? readableSize(doc.size) : 'Preview unavailable'}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function DocumentViewer({
  documents,
  index,
  onClose,
  onIndexChange,
}: {
  documents: UploadedDoc[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}) {
  const doc = documents[index]
  const [zoomed, setZoomed] = useState(false)
  const isTopmost = useOverlayLayer()

  // Stepping to another document drops the zoom. Adjusted during render rather
  // than in an effect, so the next scan never paints zoomed for a frame first.
  const [lastIndex, setLastIndex] = useState(index)
  if (index !== lastIndex) {
    setLastIndex(index)
    setZoomed(false)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!isTopmost()) return
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1)
      if (event.key === 'ArrowRight' && index < documents.length - 1) onIndexChange(index + 1)
    }
    document.addEventListener('keydown', onKey)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [index, documents.length, onClose, onIndexChange, isTopmost])

  if (!doc) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink-950/90 backdrop-blur-sm">
      <header className="flex shrink-0 items-center gap-3 px-4 py-3 text-white">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/10">
          {isImage(doc) ? <RiImageLine size={17} /> : <RiFileTextLine size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium">{DOC_LABEL[doc.kind]}</p>
          <p className="truncate text-xs text-white/55">
            {doc.name}
            <span className="mx-1.5 text-white/30">·</span>
            {readableSize(doc.size)}
          </p>
        </div>

        <a
          href={doc.url || undefined}
          download={doc.name}
          className="inline-flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Download this document"
        >
          <RiDownload2Line size={18} />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RiCloseLine size={20} />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
        <Step
          direction="prev"
          disabled={index === 0}
          onClick={() => onIndexChange(index - 1)}
        />

        <div className={cn('max-h-full max-w-5xl', zoomed && 'h-full w-full overflow-auto')}>
          {!doc.url ? (
            <Unavailable />
          ) : isPdf(doc) ? (
            <iframe
              src={doc.url}
              title={DOC_LABEL[doc.kind]}
              className="h-[80vh] w-[min(64rem,90vw)] rounded-lg bg-white"
            />
          ) : (
            <img
              src={doc.url}
              alt={DOC_LABEL[doc.kind]}
              onClick={() => setZoomed((v) => !v)}
              className={cn(
                'rounded-lg bg-white',
                zoomed ? 'max-w-none cursor-zoom-out' : 'max-h-[80vh] cursor-zoom-in object-contain',
              )}
            />
          )}
        </div>

        <Step
          direction="next"
          disabled={index === documents.length - 1}
          onClick={() => onIndexChange(index + 1)}
        />
      </div>

      <footer className="shrink-0 pb-4 text-center text-xs text-white/50">
        {index + 1} of {documents.length}
        <span className="mx-1.5 text-white/25">·</span>
        Arrow keys to move, Escape to close
      </footer>
    </div>,
    document.body,
  )
}

function Step({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? RiArrowLeftSLine : RiArrowRightSLine
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous document' : 'Next document'}
      className={cn(
        'absolute z-10 inline-flex size-10 items-center justify-center rounded-full',
        'bg-white/10 text-white transition-colors hover:bg-white/20',
        'disabled:pointer-events-none disabled:opacity-0',
        direction === 'prev' ? 'left-2' : 'right-2',
      )}
    >
      <Icon size={22} />
    </button>
  )
}

function Unavailable() {
  return (
    <div className="rounded-xl bg-white px-10 py-16 text-center">
      <span
        className="inline-flex size-12 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-ink-400"
        aria-hidden
      >
        <RiEyeOffLine size={22} />
      </span>
      <p className="mt-4 text-md font-medium text-ink-800">No preview held for this file</p>
      <p className="mx-auto mt-1 max-w-sm text-base text-ink-500">
        It was too large to keep locally. Once document storage is connected, the original is
        served from the private bucket instead.
      </p>
    </div>
  )
}
