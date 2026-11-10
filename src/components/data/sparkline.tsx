"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Catmull-Rom smoothed SVG path through points. */
export function smoothPath(points: ReadonlyArray<readonly [number, number]>): string {
  if (points.length === 0) return ""
  const f = (n: number) => n.toFixed(1)
  const first = points[0] as readonly [number, number]
  let d = `M${f(first[0])},${f(first[1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`
  }
  return d
}

export interface SparklineProps extends Omit<React.ComponentProps<"svg">, "children" | "fill"> {
  data: number[]
  /** Stroke/fill color. Any CSS color; default the primary token. */
  color?: string
  /** Show the soft area fill under the line. Default true. */
  area?: boolean
  /** Fixed y-range; defaults to the data's min/max. */
  min?: number
  max?: number
}

/** Tiny smoothed trend line. Stretches to its container width; set height via className. */
function Sparkline({
  data,
  color = "var(--primary)",
  area: showArea = true,
  min,
  max,
  className,
  ...props
}: SparklineProps) {
  const W = 120
  const H = 36
  const paths = React.useMemo(() => {
    if (data.length < 2) return { line: "", fill: "" }
    const lo = min ?? Math.min(...data)
    const hi = max ?? Math.max(...data)
    const pts = data.map(
      (v, i) => [(i / (data.length - 1)) * W, H - 4 - ((v - lo) / (hi - lo || 1)) * (H - 8)] as const,
    )
    const l = smoothPath(pts)
    return { line: l, fill: `${l} L${W},${H} L0,${H} Z` }
  }, [data, min, max])

  return (
    <svg
      data-slot="sparkline"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("block h-9 w-full overflow-visible", className)}
      {...props}
    >
      {showArea && <path d={paths.fill} style={{ fill: color, fillOpacity: 0.08 }} />}
      <path
        d={paths.line}
        vectorEffect="non-scaling-stroke"
        style={{ fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}
      />
    </svg>
  )
}

export { Sparkline }
