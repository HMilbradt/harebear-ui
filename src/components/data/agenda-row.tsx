"use client"

import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { type CategoryColor, CategoryDot } from "@/components/admin/category"
import { CheckCircle } from "@/components/ui/check-circle"
import { cn } from "@/lib/utils"

export interface AgendaRowWho {
  name: string
  /** Category color of the member or calendar, 1 to 6. */
  color: CategoryColor
}

export interface AgendaRowProps extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode
  /** Left column, e.g. "3:15" or "All day". */
  time?: React.ReactNode
  /** One line under the title. Truncates. */
  meta?: React.ReactNode
  /** Whose it is: a category-colored dot and the name at the right. */
  who?: AgendaRowWho
  /** Pass with `onCheckedChange` to draw a to-do check instead of the event icon. */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Warning-tinted check. Also say it in words in `meta`. */
  important?: boolean
  /** Makes the title a button, e.g. to open an event dialog or a DetailSheet. */
  onOpen?: () => void
}

/** One line of a day's agenda: time, event icon or to-do check, title, whose dot. */
function AgendaRow({
  title,
  time,
  meta,
  who,
  checked,
  onCheckedChange,
  important,
  onOpen,
  className,
  ...props
}: AgendaRowProps) {
  const titleId = React.useId()
  const titleClass = cn(
    "text-[15px] leading-6 wrap-anywhere",
    checked ? "text-muted-foreground line-through decoration-muted-foreground/60" : "text-foreground",
  )
  return (
    <div
      data-slot="agenda-row"
      data-checked={checked || undefined}
      className={cn("flex min-w-0 items-start gap-3 rounded-lg px-2 py-2.5", className)}
      {...props}
    >
      <span className="w-14 shrink-0 text-[13px] leading-6 text-muted-foreground tabular-nums">{time}</span>
      {onCheckedChange ? (
        <CheckCircle
          checked={!!checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          tone={important && !checked ? "important" : "default"}
          aria-labelledby={titleId}
        />
      ) : (
        <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
          <CalendarIcon aria-hidden="true" className="size-[18px]" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {onOpen ? (
          <button
            type="button"
            id={titleId}
            onClick={onOpen}
            className={cn(
              titleClass,
              "self-start rounded-sm text-left outline-none hover:underline hover:underline-offset-4 focus-visible:ring-4 focus-visible:ring-ring/20",
            )}
          >
            {title}
          </button>
        ) : (
          <span id={titleId} className={titleClass}>
            {title}
          </span>
        )}
        {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
      </div>
      {who && (
        <span className="flex max-w-32 shrink-0 items-center gap-1.5 text-[13px] leading-6 text-muted-foreground">
          <CategoryDot color={who.color} />
          <span className="truncate">{who.name}</span>
        </span>
      )}
    </div>
  )
}

export { AgendaRow }
