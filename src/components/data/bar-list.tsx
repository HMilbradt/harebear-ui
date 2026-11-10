"use client"

import type * as React from "react"
import { UsageMeter } from "@/components/admin/usage-meter"
import { cn } from "@/lib/utils"

export interface BarListItem {
  label: React.ReactNode
  /** Share 0-100 used for the bar width and the bold percent. */
  percent: number
  /** Optional absolute value shown muted before the percent, e.g. "32,068". */
  value?: React.ReactNode
  color?: string
}

/** Ranked list of labeled bars, e.g. traffic sources or top pages. */
function BarList({
  items,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { items: BarListItem[] }) {
  return (
    <div data-slot="bar-list" className={cn("flex flex-col gap-4.5", className)} {...props}>
      {items.map((item, i) => (
        <UsageMeter
          key={i}
          label={item.label}
          percent={item.percent}
          color={item.color}
          value={
            <>
              {item.value !== undefined && <span className="font-normal text-muted-foreground">{item.value} · </span>}
              {item.percent}%
            </>
          }
        />
      ))}
    </div>
  )
}

export { BarList }
