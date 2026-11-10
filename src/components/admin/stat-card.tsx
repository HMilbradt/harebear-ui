"use client"

import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"
import type * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sparkline } from "@/components/data/sparkline"
import { cn } from "@/lib/utils"

export interface StatCardProps extends Omit<React.ComponentProps<"div">, "title"> {
  label: React.ReactNode
  value: React.ReactNode
  /** Change text, e.g. "12.4%" or "18 ms". */
  delta?: React.ReactNode
  /** Arrow direction for the delta. */
  trend?: "up" | "down"
  /** Whether the change is good (green) or bad (red). Defaults to trend === "up". */
  positive?: boolean
  /** Text after the delta, e.g. "vs last month". */
  note?: React.ReactNode
  /** Icon element shown top-right in a tinted circle. */
  icon?: React.ReactNode
  /** Optional sparkline series. */
  data?: number[]
}

/** KPI tile: label, big number, delta badge, optional sparkline. */
function StatCard({
  label,
  value,
  delta,
  trend = "up",
  positive,
  note,
  icon,
  data,
  className,
  ...props
}: StatCardProps) {
  const good = positive ?? trend === "up"
  const Arrow = trend === "up" ? ArrowUpRightIcon : ArrowDownRightIcon
  return (
    <Card data-slot="stat-card" className={cn("gap-3.5 px-5.5 pt-5.5 pb-4.5", className)} {...props}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-muted-foreground">{label}</span>
        {icon && (
          <span className="grid size-8.5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary [&_svg]:size-4">
            {icon}
          </span>
        )}
      </div>
      <div className="text-[30px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{value}</div>
      {(delta || note) && (
        <div className="flex items-center gap-2 text-[13px]">
          {delta && (
            <Badge variant="secondary" className="gap-1 px-2">
              <Arrow className={cn(good ? "text-success" : "text-destructive")} strokeWidth={2.2} />
              <span className="tabular-nums">{delta}</span>
            </Badge>
          )}
          {note && <span className="text-muted-foreground">{note}</span>}
        </div>
      )}
      {data && data.length > 1 && <Sparkline data={data} />}
    </Card>
  )
}

export { StatCard }
