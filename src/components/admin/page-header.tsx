"use client"

import type * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PageHeaderProps extends Omit<React.ComponentProps<"section">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  /** Small count shown next to the title, e.g. 248. */
  count?: React.ReactNode
  /** Right-aligned controls (buttons, segmented filters). */
  actions?: React.ReactNode
  /** Text above the title, e.g. a date. */
  eyebrow?: React.ReactNode
  /** Leading mark before the title, e.g. a CategoryDot, an icon tile or a MemberAvatar. */
  icon?: React.ReactNode
}

/** Page title row with description and actions. Wraps on narrow screens. */
function PageHeader({ title, description, count, actions, eyebrow, icon, className, ...props }: PageHeaderProps) {
  return (
    <section
      data-slot="page-header"
      className={cn("flex flex-wrap items-end justify-between gap-4", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <p className="font-medium text-muted-foreground">{eyebrow}</p>}
        <div className="flex items-center gap-3">
          {icon && (
            <span
              data-slot="page-header-icon"
              className="flex shrink-0 items-center [&_svg:not([class*='size-'])]:size-6"
            >
              {icon}
            </span>
          )}
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">{title}</h1>
          {count !== undefined && (
            <Badge variant="secondary" className="tabular-nums">
              {count}
            </Badge>
          )}
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </section>
  )
}

export { PageHeader }
