"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface TrendSeries {
  /** Key in each data row. */
  key: string
  label: React.ReactNode
  /** CSS color. Defaults to chart-1..5 in order. */
  color?: string
  /** Dashed line, no fill. Use for "previous period". */
  dashed?: boolean
}

export interface TrendChartProps extends Omit<React.ComponentProps<"div">, "children"> {
  data: Array<Record<string, unknown>>
  /** Key of the x-axis value in each row. */
  xKey: string
  series: TrendSeries[]
  /** Plot height in px. Default 240. */
  height?: number
  /** Format y-axis ticks and tooltip values. */
  valueFormatter?: (value: number) => string
  /** Format x-axis ticks. */
  xFormatter?: (value: unknown) => string
  /** Hide the y-axis labels. */
  hideYAxis?: boolean
}

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

/** Smoothed area/line chart with grid, axis labels and hover tooltip. Recharts under the hood. */
function TrendChart({
  data,
  xKey,
  series,
  height = 240,
  valueFormatter,
  xFormatter,
  hideYAxis,
  className,
  style,
  ...props
}: TrendChartProps) {
  const config = React.useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        series.map((s, i) => [s.key, { label: s.label, color: s.color ?? palette[i % palette.length] }]),
      ),
    [series],
  )
  // Draw dashed (comparison) series first so the primary series sits on top.
  const ordered = React.useMemo(() => [...series].sort((a, b) => Number(!!b.dashed) - Number(!!a.dashed)), [series])

  return (
    <ChartContainer
      data-slot="trend-chart"
      config={config}
      className={cn("aspect-auto w-full", className)}
      style={{ height, ...style }}
      {...props}
    >
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`hb-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--color-${s.key})`} stopOpacity={0.14} />
              <stop offset="100%" stopColor={`var(--color-${s.key})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickMargin={10}
          minTickGap={32}
          tickFormatter={xFormatter}
          fontSize={11}
        />
        <YAxis
          hide={hideYAxis}
          tickLine={false}
          axisLine={false}
          width={40}
          tickMargin={6}
          tickFormatter={valueFormatter}
          fontSize={11}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)" }}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={
                valueFormatter
                  ? (value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">{config[String(name)]?.label ?? name}</span>
                        <span className="font-semibold tabular-nums">{valueFormatter(Number(value))}</span>
                      </div>
                    )
                  : undefined
              }
            />
          }
        />
        {ordered.map((s) => (
          <Area
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            strokeDasharray={s.dashed ? "5 5" : undefined}
            fill={s.dashed ? "none" : `url(#hb-fill-${s.key})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}

/** Inline legend matching TrendChart series styling (solid vs dashed swatches). */
function TrendLegend({
  series,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { series: TrendSeries[] }) {
  return (
    <div
      data-slot="trend-legend"
      className={cn("flex flex-wrap items-center gap-4.5 text-[13px]", className)}
      {...props}
    >
      {series.map((s, i) => {
        const color = s.color ?? palette[i % palette.length]
        return (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-4"
              style={
                s.dashed ? { borderTop: `2px dashed ${color}` } : { height: 3, borderRadius: 3, background: color }
              }
            />
            {s.label}
          </span>
        )
      })}
    </div>
  )
}

export { TrendChart, TrendLegend }
