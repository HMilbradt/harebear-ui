"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const gapClass = { none: "gap-0", xs: "gap-1", sm: "gap-2", md: "gap-3", lg: "gap-4", xl: "gap-6" } as const

export interface ShowMoreProps extends React.ComponentProps<"div"> {
  /** Children shown before the "Show N more" button. Default 5. */
  initial?: number
  gap?: keyof typeof gapClass
}

/** A list that collapses after `initial` children, with a button to show the rest. */
function ShowMore({ initial = 5, gap = "md", className, children, ...props }: ShowMoreProps) {
  const [open, setOpen] = React.useState(false)
  const all = React.Children.toArray(children)
  return (
    <div data-slot="show-more" className={cn("flex min-w-0 flex-col", gapClass[gap], className)} {...props}>
      {open ? all : all.slice(0, initial)}
      {all.length > initial && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="self-start rounded-md text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20"
        >
          {open ? "Show less" : `Show ${all.length - initial} more`}
        </button>
      )}
    </div>
  )
}

export { ShowMore }
