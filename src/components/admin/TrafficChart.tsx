import { useMemo, useState } from 'react'

interface Series {
  label: string
  values: number[]
  color: string
}

interface TrafficChartProps {
  labels: string[]
  series: Series[]
  height?: number
  formatValue?: (n: number) => string
}

const AXIS_COLOR = '#94a3b8'
const GRID_COLOR = 'rgba(15, 23, 42, 0.06)'

export function TrafficChart({
  labels,
  series,
  height = 260,
  formatValue = (n) => String(n),
}: TrafficChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const { max, tickSteps, width, pad, plotW, plotH } = useMemo(() => {
    const pad = { top: 20, right: 20, bottom: 32, left: 44 }
    const width = 720
    const plotW = width - pad.left - pad.right
    const plotH = height - pad.top - pad.bottom
    const rawMax = Math.max(1, ...series.flatMap((s) => s.values))
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
    const step = Math.ceil(rawMax / (magnitude * 5)) * magnitude
    const max = step * 5
    const tickSteps = [0, 1, 2, 3, 4, 5].map((i) => step * i)
    return { max, tickSteps, width, pad, plotW, plotH }
  }, [series, height])

  if (!labels.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        Henüz veri yok — ilk ziyaretler geldiğinde burada görünecek.
      </div>
    )
  }

  const step = plotW / Math.max(labels.length - 1, 1)
  const xAt = (i: number) => pad.left + i * step
  const yAt = (v: number) => pad.top + plotH - (v / max) * plotH

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[560px]" role="img">
        {/* grid + y-axis */}
        {tickSteps.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              x2={pad.left + plotW}
              y1={yAt(t)}
              y2={yAt(t)}
              stroke={GRID_COLOR}
              strokeWidth={1}
            />
            <text
              x={pad.left - 8}
              y={yAt(t) + 4}
              textAnchor="end"
              className="fill-current text-[10px]"
              fill={AXIS_COLOR}
            >
              {formatValue(t)}
            </text>
          </g>
        ))}

        {/* x-axis labels (every Nth) */}
        {labels.map((label, i) => {
          const skip = Math.max(1, Math.floor(labels.length / 8))
          if (i % skip !== 0 && i !== labels.length - 1) return null
          return (
            <text
              key={`x-${i}`}
              x={xAt(i)}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px]"
              fill={AXIS_COLOR}
            >
              {label}
            </text>
          )
        })}

        {/* series */}
        {series.map((s) => {
          const points = s.values
            .map((v, i) => `${xAt(i)},${yAt(v)}`)
            .join(' ')
          const areaPoints = `${xAt(0)},${yAt(0)} ${points} ${xAt(s.values.length - 1)},${yAt(0)}`
          return (
            <g key={s.label}>
              <polygon points={areaPoints} fill={s.color} opacity={0.08} />
              <polyline
                points={points}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          )
        })}

        {/* hover */}
        {hover !== null && (
          <line
            x1={xAt(hover)}
            x2={xAt(hover)}
            y1={pad.top}
            y2={pad.top + plotH}
            stroke="rgba(15,23,42,0.2)"
            strokeDasharray="3 3"
          />
        )}
        {hover !== null &&
          series.map((s) => (
            <circle
              key={`dot-${s.label}`}
              cx={xAt(hover)}
              cy={yAt(s.values[hover] ?? 0)}
              r={4}
              fill={s.color}
              stroke="white"
              strokeWidth={2}
            />
          ))}

        {/* hit area */}
        <rect
          x={pad.left}
          y={pad.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onMouseMove={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect()
            const relX = e.clientX - rect.left
            const scale = plotW / rect.width
            const i = Math.round((relX * scale) / step)
            setHover(Math.min(Math.max(0, i), labels.length - 1))
          }}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
            <span className="text-muted">{s.label}</span>
            <span className="font-semibold text-navy-900 tabular-nums">
              {hover !== null ? formatValue(s.values[hover] ?? 0) : formatValue(sum(s.values))}
            </span>
          </div>
        ))}
        {hover !== null && (
          <span className="ml-auto text-muted">{labels[hover]}</span>
        )}
      </div>
    </div>
  )
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0)
}
