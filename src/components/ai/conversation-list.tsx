"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import * as React from "react"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
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
  /** With `onDelete`: block deleting this row. A string is shown as the reason, e.g. "Stop the agent first". */
  deleteDisabled?: boolean | string
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
  /** Trailing control per row, e.g. a delete button. On devices that can hover it shows on hover and focus; on touch it is always visible. */
  renderAction?: (conversation: Conversation) => React.ReactNode
  /**
   * Adds a delete button to each row that asks for confirmation first, then calls this. Ignored when `renderAction`
   * is set. Use `Conversation.deleteDisabled` to block it per row.
   */
  onDelete?: (conversation: Conversation) => void
  /** Body of the delete confirmation. Default "This cannot be undone." */
  deleteDescription?: React.ReactNode
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
  onDelete,
  deleteDescription = "This cannot be undone.",
  empty = "No conversations yet",
  className,
  ...props
}: ConversationListProps) {
  const sidebar = useSidebarOptional()
  // The target outlives `open` so the title does not blank out while the dialog animates closed.
  const [confirm, setConfirm] = React.useState<Conversation | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const deleteButton = (c: Conversation) => (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Delete ${c.title}`}
      title={typeof c.deleteDisabled === "string" ? c.deleteDisabled : "Delete conversation"}
      disabled={!!c.deleteDisabled}
      onClick={() => {
        setConfirm(c)
        setConfirmOpen(true)
      }}
    >
      <Trash2Icon />
    </Button>
  )
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
            const action = renderAction ? renderAction(c) : onDelete ? deleteButton(c) : null
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
                  <div className="mr-1 flex shrink-0 items-center [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/conversation:opacity-100 [@media(hover:hover)]:group-focus-within/conversation:opacity-100">
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
      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={`Delete “${confirm?.title ?? ""}”?`}
          description={deleteDescription}
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            if (confirm) onDelete(confirm)
          }}
        />
      )}
    </nav>
  )
}

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
  // Local calendar midnights, so daylight-saving days (23 or 25 hours) bucket correctly.
  const d = new Date(now)
  const midnight = (daysAgo: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysAgo).getTime()
  const [today, yesterday, weekAgo] = [midnight(0), midnight(1), midnight(7)]
  const groups: ConversationGroup[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Earlier", items: [] },
  ]
  const sorted = [...items].sort((a, b) => +getDate(b) - +getDate(a))
  for (const item of sorted) {
    const t = +getDate(item)
    const i = t >= today ? 0 : t >= yesterday ? 1 : t >= weekAgo ? 2 : 3
    groups[i]?.items.push(toConversation(item))
  }
  return groups.filter((g) => g.items.length)
}

/**
 * Short timestamp for lists and headers: the time today ("9:41 AM"), the date this year ("Nov 3"), else with the
 * year ("Nov 3, 2025"). Uses the browser locale unless `locale` is given. Pass `now` for deterministic tests.
 */
function formatWhen(date: number | Date, now: number | Date = Date.now(), locale?: string | string[]): string {
  const d = new Date(date)
  const n = new Date(now)
  if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })
  if (d.getFullYear() === n.getFullYear()) return d.toLocaleDateString(locale, { month: "short", day: "numeric" })
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
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

export { ConversationList, NewConversationButton, formatWhen, groupByDate }
