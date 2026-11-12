"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface CollapseProps extends React.ComponentProps<"div"> {
  /** Shown at full height when true; animates to zero height when false. */
  open: boolean
  /** Classes for the inner element that holds the children. */
  contentClassName?: string
}

/**
 * Animates its children's height between auto and 0 with a CSS grid-template-rows transition, so neighbours move
 * smoothly instead of jumping. Closed content is `inert` and hidden from assistive tech. No animation under
 * prefers-reduced-motion.
 */
function Collapse({ open, contentClassName, className, children, ...props }: CollapseProps) {
  return (
    <div
      data-slot="collapse"
      data-state={open ? "open" : "closed"}
      aria-hidden={open ? undefined : true}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
      {...props}
    >
      <div className={cn("min-h-0 min-w-0 overflow-x-visible overflow-y-clip", contentClassName)}>{children}</div>
    </div>
  )
}

export { Collapse }
