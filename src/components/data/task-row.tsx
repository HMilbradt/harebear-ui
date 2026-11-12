"use client"

import * as React from "react"
import type { CategoryColor } from "@/components/admin/category"
import { MemberAvatar } from "@/components/admin/user-chip"
import { CheckCircle } from "@/components/ui/check-circle"
import { cn } from "@/lib/utils"

export interface TaskRowAssignee {
  name: string
  avatarUrl?: string
  /** Category colour behind the initials when there is no photo. */
  color?: CategoryColor
}

export interface TaskRowProps extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode
  /** One line under the title, e.g. "Today · Groceries". Truncates. */
  meta?: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Avatar at the right; the name is its accessible label. */
  assignee?: TaskRowAssignee
  /** Warning-tinted check. Also say it in words, e.g. meta="Important · Today". */
  important?: boolean
  /** Makes the title a button, e.g. to open a DetailSheet. */
  onOpen?: () => void
  disabled?: boolean
}

/** One to-do: round check aligned with the first line, title, one meta line, optional assignee. */
function TaskRow({
  title,
  meta,
  checked,
  onCheckedChange,
  assignee,
  important,
  onOpen,
  disabled,
  className,
  ...props
}: TaskRowProps) {
  const titleId = React.useId()
  const titleClass = cn(
    "text-[15px] leading-6 wrap-anywhere",
    checked ? "text-muted-foreground line-through decoration-muted-foreground/60" : "text-foreground",
  )
  return (
    <div
      data-slot="task-row"
      data-checked={checked || undefined}
      className={cn("flex min-w-0 items-start gap-3 rounded-lg px-2 py-2.5", className)}
      {...props}
    >
      <CheckCircle
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        tone={important && !checked ? "important" : "default"}
        aria-labelledby={titleId}
        disabled={disabled}
      />
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
      {assignee && (
        <MemberAvatar
          size="sm"
          name={assignee.name}
          avatarUrl={assignee.avatarUrl}
          color={assignee.color}
          title={assignee.name}
        />
      )}
    </div>
  )
}

export { TaskRow }
