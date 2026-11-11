"use client"

import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

export interface MetricProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: React.ReactNode
  value: React.ReactNode
  unit?: React.ReactNode
  /** Percent change. Positive reads as good unless `lowerIsBetter`. */
  delta?: number
  lowerIsBetter?: boolean
  align?: "start" | "center"
}

/** A number with a unit, a label under it, and an optional percent change over it. */
function Metric({ label, value, unit, delta, lowerIsBetter, align = "center", className, ...props }: MetricProps) {
  const good = delta === undefined || delta === 0 ? undefined : lowerIsBetter ? delta < 0 : delta > 0
  return (
    <div
      data-slot="metric"
      className={cn(
        "flex min-w-0 flex-col gap-0.5",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
      {...props}
    >
      {delta !== undefined && Number.isFinite(delta) && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
            good === undefined ? "text-muted-foreground" : good ? "text-success" : "text-destructive",
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)}%
          {delta > 0 ? (
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          ) : delta < 0 ? (
            <ArrowDownRightIcon aria-hidden className="size-3.5" />
          ) : null}
        </span>
      )}
      <span className="text-xl font-semibold tracking-tight whitespace-nowrap tabular-nums @sm:text-2xl">
        {value}
        {unit && <span className="ml-0.5 text-xs font-medium text-muted-foreground">{unit}</span>}
      </span>
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
    </div>
  )
}

/** Metrics side by side, evenly spaced. */
function MetricGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="metric-group" className={cn("grid auto-cols-fr grid-flow-col gap-2", className)} {...props} />
}

export { Metric, MetricGroup }
