/** Holds the page's shape while a lazy route resolves, so the shell stays put
    and nothing jumps when the chunk lands. */
export function PageSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 rounded-lg bg-ink-200" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-ink-100" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-xl border border-ink-200 bg-white" />
        ))}
      </div>
      <div className="mt-6 h-80 rounded-xl border border-ink-200 bg-white" />
    </div>
  )
}
