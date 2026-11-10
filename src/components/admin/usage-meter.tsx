"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface UsageMeterProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: React.ReactNode
  /** 0-100. */
  percent: number
  /** Bold value text at the right, e.g. "68%" or "34 GB". */
  value?: React.ReactNode
  /** Muted text after the value, e.g. "of 50 GB". */
  detail?: React.ReactNode
  /** Bar color (CSS color). Default primary. Use "var(--warning)" etc. for thresholds. */
  color?: string
  /** Track color. Default muted. */
  trackClassName?: string
}

/** Label/value row over a rounded bar. For storage, quotas, traffic share, CPU. */
function UsageMeter({ label, percent, value, detail, color, trackClassName, className, ...props }: UsageMeterProps) {
  const pct = Math.max(0, Math.min(100, percent))
  return (
    <div data-slot="usage-meter" className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">
          {value !== undefined && <span className="font-semibold">{value}</span>}
          {detail !== undefined && <span className="text-muted-foreground"> {detail}</span>}
        </span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className={cn("h-2 overflow-hidden rounded-full bg-muted", trackClassName)}
      >
        <span
          className="block h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export { UsageMeter }
