import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import { Button } from './Button'
import { count } from '@/lib/format'

type PaginationProps = {
  page: number
  pageCount: number
  total: number
  noun: string
  onChange: (page: number) => void
}

export function Pagination({ page, pageCount, total, noun, onChange }: PaginationProps) {
  return (
    <>
      <p className="tnum text-sm text-ink-500">
        Page {page} of {pageCount}
        <span className="mx-1.5 text-ink-300">·</span>
        {count(total)} {noun}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          icon={RiArrowLeftSLine}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          iconAfter={RiArrowRightSLine}
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </>
  )
}
