"use client"

import type * as React from "react"
import type { StatusTone } from "@/components/admin/status"
import { cn } from "@/lib/utils"

export type StatusBarDatum = number | { value: number; tone?: StatusTone; label?: string }

const toneBg: Record<StatusTone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
  info: "var(--primary)",
  neutral: "var(--muted-foreground)",
}

export interface StatusBarsProps extends Omit<React.ComponentProps<"div">, "children"> {
  data: StatusBarDatum[]
  /** Value mapped to full height. Defaults to the max in data. */
  max?: number
  /** Tone for plain-number data. Default "info" (primary). */
  tone?: StatusTone
}

/** Mini bar history, e.g. last 20 pings or uptime checks. Size it with className (default 96x26). */
function StatusBars({ data, max, tone = "info", className, ...props }: StatusBarsProps) {
  const items = data.map((d) => (typeof d === "number" ? { value: d, tone } : { tone, ...d }))
  const top = max ?? Math.max(1, ...items.map((d) => d.value))
  return (
    <div
      data-slot="status-bars"
      aria-hidden="true"
      className={cn("flex h-6.5 w-24 shrink-0 items-end gap-0.5", className)}
      {...props}
    >
      {items.map((d, i) => (
        <span
          key={i}
          title={d.label}
          className="min-h-[3px] flex-1 rounded-[2px]"
          style={{ height: `${Math.min(100, (d.value / top) * 100)}%`, background: toneBg[d.tone ?? tone] }}
        />
      ))}
    </div>
  )
}

export { StatusBars }
