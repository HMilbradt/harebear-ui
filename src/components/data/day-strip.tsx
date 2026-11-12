"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface DayStripDay {
  /** DOM id of the element to jump to, e.g. a SectionedList section id. */
  id: string
  date: Date
  /** Shows a dot under the date. */
  hasPlans?: boolean
}

export interface DayStripProps extends React.ComponentProps<"nav"> {
  days: DayStripDay[]
  /** Id of the selected day. */
  value?: string
  /** Called with the day's id after it scrolls that element into view. */
  onValueChange?: (id: string) => void
}

/**
 * A row of day buttons (weekday, date, a dot when there are plans) that jump to the element with the day's id.
 * Scrolls inside itself when the days do not fit. Smooth scrolling is off under prefers-reduced-motion.
 */
function DayStrip({ days, value, onValueChange, className, "aria-label": ariaLabel, ...props }: DayStripProps) {
  const jump = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    document.getElementById(id)?.scrollIntoView?.({ behavior: reduce ? "auto" : "smooth", block: "start" })
    onValueChange?.(id)
  }
  return (
    <nav
      data-slot="day-strip"
      aria-label={ariaLabel ?? "Jump to a day"}
      className={cn("min-w-0 overflow-x-auto", className)}
      {...props}
    >
      <ul className="flex gap-2 p-1">
        {days.map((day) => {
          const selected = day.id === value
          const label = day.date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
          return (
            <li key={day.id} className="flex shrink-0 grow basis-18">
              <a
                href={`#${day.id}`}
                aria-current={selected ? "true" : undefined}
                aria-label={day.hasPlans ? `${label}, has plans` : label}
                onClick={(e) => jump(e, day.id)}
                className={cn(
                  "flex min-h-21 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ring/20 motion-reduce:transition-none",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground shadow-card hover:bg-muted",
                )}
              >
                <span
                  className={cn("text-xs font-medium", selected ? "text-primary-foreground" : "text-muted-foreground")}
                >
                  {day.date.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span className="text-[22px] leading-tight font-semibold tracking-tight tabular-nums">
                  {day.date.getDate()}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full",
                    !day.hasPlans && "bg-transparent",
                    day.hasPlans && (selected ? "bg-primary-foreground" : "bg-primary"),
                  )}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { DayStrip }
