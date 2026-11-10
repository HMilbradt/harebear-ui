"use client"

import type * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { initials } from "./user-chip"

export interface ActivityItem {
  id?: string
  actor: string
  avatarUrl?: string
  /** Verb phrase, e.g. "commented on". Rendered muted. */
  action: React.ReactNode
  target?: React.ReactNode
  time: React.ReactNode
}

/** "Maya published Pricing page v2 · 12 min ago" list. */
function ActivityFeed({
  items,
  className,
  ...props
}: Omit<React.ComponentProps<"ul">, "children"> & { items: ActivityItem[] }) {
  return (
    <ul data-slot="activity-feed" className={cn("flex flex-col gap-4.5", className)} {...props}>
      {items.map((a, i) => (
        <li key={a.id ?? i} className="flex items-start gap-3">
          <Avatar size="sm" className="size-8">
            {a.avatarUrl && <AvatarImage src={a.avatarUrl} alt="" />}
            <AvatarFallback className="text-xs">{initials(a.actor)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-[13px]">
            <span>
              <span className="font-semibold">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span>{" "}
              {a.target && <span className="font-medium">{a.target}</span>}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{a.time}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export { ActivityFeed }
