"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface KeyValueItem {
  label: React.ReactNode
  value: React.ReactNode
}

/** Label-over-value pairs in a responsive grid. Renders a <dl>. */
function KeyValueGrid({
  items,
  columns = 2,
  className,
  ...props
}: Omit<React.ComponentProps<"dl">, "children"> & { items: KeyValueItem[]; columns?: 1 | 2 | 3 }) {
  return (
    <dl
      data-slot="key-value-grid"
      className={cn(
        "grid gap-x-5 gap-y-4.5",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 sm:grid-cols-3",
        className,
      )}
      {...props}
    >
      {items.map((item, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="truncate">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export { KeyValueGrid }
