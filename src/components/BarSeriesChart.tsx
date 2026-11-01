import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RiBarChartLine } from '@remixicon/react'
import { EmptyState } from '@/components/ui/EmptyState'
import { compactINR, money } from '@/lib/format'

export type Point = { label: string; value: number }

const BRAND = '#0d9488'
const AXIS = '#a1a1aa'
const GRID = '#e4e4e7'

type LabelMode = 'nonzero' | 'peak' | 'none'

/* One series, so no legend — the card title names it. Gridlines are solid
   hairlines (dashes read as "projected"), the baseline sits at zero, and labels
   are selective: a number on every bar is noise, not information. */
export function BarSeriesChart({
  data,
  height = 280,
  labels = 'nonzero',
  labelFormat = compactINR,
  tickInterval = 0,
  emptyMessage = 'Nothing recorded for this period.',
}: {
  data: Point[]
  height?: number
  labels?: LabelMode
  /** Axis ticks stay compact; a direct label can afford the currency symbol. */
  labelFormat?: (value: number) => string
  tickInterval?: number | 'preserveStartEnd'
  emptyMessage?: string
}) {
  const max = Math.max(0, ...data.map((d) => d.value))

  if (max === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <EmptyState icon={RiBarChartLine} title={emptyMessage} compact />
      </div>
    )
  }

  // Labels live on the datum, so no empty bar ever carries a stray "0".
  const rows = data.map((d) => ({
    ...d,
    tag:
      labels === 'none'
        ? ''
        : labels === 'peak'
          ? d.value === max
            ? labelFormat(d.value)
            : ''
          : d.value > 0 && d.value >= max * 0.02
            ? labelFormat(d.value)
            : '',
  }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 24, right: 8, bottom: 4, left: 8 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: GRID }}
            tickLine={false}
            tick={{ fill: AXIS, fontSize: 11 }}
            tickMargin={10}
            interval={tickInterval}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: AXIS, fontSize: 11 }}
            tickMargin={8}
            width={48}
            tickFormatter={compactINR}
          />
          <Tooltip cursor={{ fill: 'rgba(9,9,11,0.04)' }} content={<ValueTooltip />} offset={12} />
          <Bar
            dataKey="value"
            fill={BRAND}
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="tag"
              position="top"
              offset={8}
              fill="#3f3f46"
              fontSize={11}
              fontWeight={500}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function ValueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="tnum mt-1 text-base font-semibold text-ink-900">{money(payload[0].value)}</p>
    </div>
  )
}
