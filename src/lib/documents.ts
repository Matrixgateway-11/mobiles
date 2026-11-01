import type { DocKind } from '@/types/database'

/* Capturing an uploaded scan so a reviewer can actually look at it.

   On fixtures the file is held as a data URL, which means it survives a page
   reload and crosses tabs — the applicant uploads in one tab and the reviewer
   opens it in another. localStorage is only a few megabytes, so photographs
   are scaled down first: a 3 MB phone picture becomes a ~150 KB image that is
   still perfectly legible for checking a PAN card.

   Once Storage is wired the file goes to the private bucket instead and `url`
   holds a signed link. Nothing else in the UI changes — the viewer already
   takes a URL and does not care where it came from. */

export type UploadedDoc = {
  kind: DocKind
  name: string
  mime: string
  /** Size of the original, before any downscaling. */
  size: number
  /** A data: URL on fixtures, a signed URL once Storage is live. Empty when
      the file was too large to keep locally. */
  url: string
}

export const DOC_LABEL: Record<DocKind, string> = {
  pan_front: 'PAN, front',
  pan_back: 'PAN, back',
  aadhaar_front: 'Aadhaar, front',
  aadhaar_back: 'Aadhaar, back',
  photo: 'Photograph',
  cheque: 'Cancelled cheque',
}

/** Wide enough to read an identity number, small enough to store. */
const MAX_EDGE = 1400
const MAX_STORED_BYTES = 600_000

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}

/** Re-encodes an image at a sane size. Anything that is not an image, or that
    fails to decode, comes back untouched for the caller to size-check. */
async function downscale(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) return readAsDataUrl(file)

  const original = await readAsDataUrl(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('decode failed'))
      element.src = original
    })

    const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
    if (scale === 1 && original.length <= MAX_STORED_BYTES) return original

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)

    const context = canvas.getContext('2d')
    if (!context) return original

    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.82)
  } catch {
    return original
  }
}

export async function captureDocument(kind: DocKind, file: File): Promise<UploadedDoc> {
  const url = await downscale(file)
  return {
    kind,
    name: file.name,
    mime: file.type || 'application/octet-stream',
    size: file.size,
    // A PDF or a stubborn image that is still too big is kept by name only,
    // rather than blowing the storage quota and losing the whole submission.
    url: url.length <= MAX_STORED_BYTES ? url : '',
  }
}

export const isImage = (doc: UploadedDoc) => doc.mime.startsWith('image/')
export const isPdf = (doc: UploadedDoc) => doc.mime === 'application/pdf'

export function readableSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1000) return `${Math.round(bytes / 1000)} KB`
  return `${bytes} B`
}
