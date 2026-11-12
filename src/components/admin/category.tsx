"use client"

import { LockIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

/** One of the six category colours (`category-1..6`) for members, lists and calendars. */
export type CategoryColor = 1 | 2 | 3 | 4 | 5 | 6

/** `bg-category-N` per colour, as complete class names so Tailwind generates them. */
export const categoryBg: Record<CategoryColor, string> = {
  1: "bg-category-1",
  2: "bg-category-2",
  3: "bg-category-3",
  4: "bg-category-4",
  5: "bg-category-5",
  6: "bg-category-6",
}

export interface CategoryDotProps extends Omit<React.ComponentProps<"span">, "color"> {
  color: CategoryColor
  /** Accessible name when the colour means something on its own, e.g. whose event it is. Decorative without it. */
  label?: string
  /** Adds a lock after the dot, for something only you can see. */
  locked?: boolean
  /** Accessible name of the lock. Default "Only you". */
  lockLabel?: string
}

/** A small dot in a category colour, e.g. before a list name in a sidebar, with an optional lock for private ones. */
function CategoryDot({ color, label, locked, lockLabel = "Only you", className, ...props }: CategoryDotProps) {
  return (
    <span data-slot="category-dot" className={cn("inline-flex shrink-0 items-center gap-1.5", className)} {...props}>
      {label ? (
        <span role="img" aria-label={label} className={cn("size-2.5 shrink-0 rounded-full", categoryBg[color])} />
      ) : (
        <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", categoryBg[color])} />
      )}
      {locked && <LockIcon role="img" aria-label={lockLabel} className="size-3.5 text-muted-foreground" />}
    </span>
  )
}

export { CategoryDot }
