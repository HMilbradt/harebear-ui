"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface Conversation {
  id: string
  title: string
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
}

/** Grouped list of chat threads for a sidebar. */
function ConversationList({ groups, activeId, onSelect, className, ...props }: ConversationListProps) {
  return (
    <nav
      data-slot="conversation-list"
      aria-label="Conversations"
      className={cn("flex flex-col gap-4.5", className)}
      {...props}
    >
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-0.5">
          <div className="px-3 pb-1.5 text-xs font-medium text-muted-foreground">{g.label}</div>
          {g.items.map((c) => {
            const active = c.id === activeId
            return (
              <button
                key={c.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect?.(c.id)}
                className={cn(
                  "w-full truncate rounded-md px-3 py-2.25 text-left font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
                  active && "bg-card text-foreground shadow-card hover:bg-card",
                )}
              >
                {c.title}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export { ConversationList }
