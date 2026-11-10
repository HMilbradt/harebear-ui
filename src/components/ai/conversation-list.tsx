"use client"

import { PlusIcon } from "lucide-react"
import type * as React from "react"
import { StatusDot, type StatusTone } from "@/components/admin/status"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription } from "@/components/ui/empty"
import { useSidebarOptional } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface Conversation {
  id: string
  title: string
  /** Second line under the title, e.g. the last-updated time or "Working". */
  description?: React.ReactNode
  /** Shows a status dot before the description, for live states. */
  tone?: StatusTone
  /** Pulse the status dot. */
  pulse?: boolean
}

export interface ConversationGroup {
  /** e.g. "Today", "Yesterday", "Previous 7 days". */
  label: string
  items: Conversation[]
}

export interface ConversationListProps extends Omit<React.ComponentProps<"nav">, "onSelect"> {
  groups: ConversationGroup[]
  activeId?: string
  onSelect?: (id: string) => void
  /** Trailing control per row, e.g. a delete button. Shown on hover and focus on desktop, always on touch. */
  renderAction?: (conversation: Conversation) => React.ReactNode
  /** Shown when there are no conversations. Default "No conversations yet". */
  empty?: React.ReactNode
}

/**
 * Grouped list of chat threads for a sidebar. Inside a Sidebar it closes the mobile sheet on select,
 * and hides itself when the sidebar is collapsed to its icon rail.
 */
function ConversationList({
  groups,
  activeId,
  onSelect,
  renderAction,
  empty = "No conversations yet",
  className,
  ...props
}: ConversationListProps) {
  const sidebar = useSidebarOptional()
  const select = (id: string) => {
    onSelect?.(id)
    sidebar?.setOpenMobile(false)
  }
  const visible = groups.filter((g) => g.items.length)
  return (
    <nav
      data-slot="conversation-list"
      aria-label="Conversations"
      className={cn("flex flex-col gap-4.5 group-data-[collapsible=icon]:hidden", className)}
      {...props}
    >
      {visible.map((g) => (
        <div key={g.label} className="flex flex-col gap-0.5">
          <div className="px-3 pb-1.5 text-xs font-medium text-muted-foreground">{g.label}</div>
          {g.items.map((c) => {
            const active = c.id === activeId
            const action = renderAction?.(c)
            return (
              <div
                key={c.id}
                data-slot="conversation-item"
                data-active={active || undefined}
                className={cn(
                  "group/conversation flex min-w-0 items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-card text-foreground shadow-card hover:bg-card",
                )}
              >
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => select(c.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col rounded-md py-2.25 pl-3 text-left font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    action ? "pr-1" : "pr-3",
                  )}
                >
                  <span className="truncate">{c.title}</span>
                  {c.description !== undefined && (
                    <span className="flex min-w-0 items-center gap-1.5 text-xs font-normal text-muted-foreground tabular-nums">
                      {c.tone && <StatusDot tone={c.tone} pulse={c.pulse} />}
                      <span className="truncate">{c.description}</span>
                    </span>
                  )}
                </button>
                {action && (
                  <div className="mr-1 flex shrink-0 items-center md:opacity-0 md:group-hover/conversation:opacity-100 md:focus-within:opacity-100">
                    {action}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
      {!visible.length && empty && (
        <Empty>
          <EmptyDescription>{empty}</EmptyDescription>
        </Empty>
      )}
    </nav>
  )
}

const DAY = 24 * 60 * 60 * 1000

/**
 * Buckets items into Today / Yesterday / Previous 7 days / Earlier by a timestamp (ms or Date),
 * newest first, and drops empty groups. Pass `now` for deterministic tests.
 */
function groupByDate<T>(
  items: T[],
  getDate: (item: T) => number | Date,
  toConversation: (item: T) => Conversation,
  now: number | Date = Date.now(),
): ConversationGroup[] {
  const today = new Date(now).setHours(0, 0, 0, 0)
  const groups: ConversationGroup[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Earlier", items: [] },
  ]
  const sorted = [...items].sort((a, b) => +getDate(b) - +getDate(a))
  for (const item of sorted) {
    const t = +getDate(item)
    const i = t >= today ? 0 : t >= today - DAY ? 1 : t >= today - 7 * DAY ? 2 : 3
    groups[i]?.items.push(toConversation(item))
  }
  return groups.filter((g) => g.items.length)
}

export interface NewConversationButtonProps extends React.ComponentProps<typeof Button> {
  /** Default "New conversation". */
  label?: string
  /** Default a plus icon. */
  icon?: React.ReactNode
  /** Trailing content in the expanded button, e.g. <Kbd>⌘N</Kbd>. */
  shortcut?: React.ReactNode
}

/**
 * Full-width "New conversation" button for a sidebar header. In the icon rail it shrinks to an icon with a
 * tooltip; on mobile it closes the sidebar sheet after the click.
 */
function NewConversationButton({
  label = "New conversation",
  icon = <PlusIcon />,
  shortcut,
  variant = "secondary",
  onClick,
  className,
  ...props
}: NewConversationButtonProps) {
  const sidebar = useSidebarOptional()
  const rail = sidebar?.state === "collapsed" && !sidebar.isMobile
  const button = (
    <Button
      data-slot="new-conversation-button"
      variant={variant}
      size={rail ? "icon" : "default"}
      aria-label={rail ? label : undefined}
      className={cn(!rail && "w-full justify-start", className)}
      onClick={(e) => {
        onClick?.(e)
        sidebar?.setOpenMobile(false)
      }}
      {...props}
    >
      {icon}
      {!rail && <span className="flex-1 truncate text-left">{label}</span>}
      {!rail && shortcut}
    </Button>
  )
  if (!rail) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export { ConversationList, NewConversationButton, groupByDate }
