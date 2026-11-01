import { useId } from 'react'

/* A twelve-month trend in 120×32 pixels.

   Hand-drawn SVG rather than the charting library: this sits on the landing
   page, and pulling 100 KB of Recharts into the first paint to draw twelve
   points would be a poor trade. It has no axes and no tooltip on purpose — it
   answers "which way" and nothing more. The figure beside it carries the
   value. */

export function Sparkline({
  data,
  tone = 'brand',
  className,
}: {
  data: number[]
  tone?: 'brand' | 'success' | 'danger'
  className?: string
}) {
  const id = useId()
  const stroke = {
    brand: 'var(--color-brand-500)',
    success: 'var(--color-success-600)',
    danger: 'var(--color-danger-600)',
  }[tone]

  if (data.length < 2) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const span = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    // 4% of headroom top and bottom so the peak never clips the viewBox.
    const y = 96 - ((value - min) / span) * 92
    return [x, y] as const
  })

  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} L100,100 L0,100 Z`
  const [lastX, lastY] = points[points.length - 1]

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* The latest point, so the eye lands on "now" rather than the curve. */}
      <circle cx={lastX} cy={lastY} r="2.5" fill={stroke} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
