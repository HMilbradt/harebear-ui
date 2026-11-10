"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import type { StatusTone } from "./status"

export interface TimelineItem {
  id?: string
  title: React.ReactNode
  time: React.ReactNode
  tone?: StatusTone
}

const dot: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-primary",
  neutral: "bg-muted-foreground",
}

/** Vertical event list with connecting rail. */
function Timeline({
  items,
  className,
  ...props
}: Omit<React.ComponentProps<"ol">, "children"> & { items: TimelineItem[] }) {
  return (
    <ol data-slot="timeline" className={cn("flex flex-col", className)} {...props}>
      {items.map((t, i) => (
        <li key={t.id ?? i} className="flex gap-3.5">
          <div className="flex w-2.5 flex-col items-center pt-1.5">
            <span className={cn("size-2.5 shrink-0 rounded-full ring-3 ring-card", dot[t.tone ?? "info"])} />
            {i < items.length - 1 && <span className="mt-1.5 mb-0.5 w-0.5 flex-1 rounded-full bg-chart-grid" />}
          </div>
          <div className="flex flex-col gap-px pb-4 text-[13px]">
            <span className="font-medium">{t.title}</span>
            <span className="text-xs text-muted-foreground">{t.time}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export { Timeline }
