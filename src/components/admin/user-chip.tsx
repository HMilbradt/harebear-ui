"use client"

import type * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/** Up to two initials from a name: "Maya Chen" -> "MC". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export interface UserChipProps extends React.ComponentProps<"div"> {
  name: string
  subtitle?: React.ReactNode
  avatarUrl?: string
  /** Trailing control, e.g. a menu button. */
  action?: React.ReactNode
  size?: "sm" | "default" | "lg"
}

/** Avatar + name + secondary line. */
function UserChip({ name, subtitle, avatarUrl, action, size = "default", className, ...props }: UserChipProps) {
  return (
    <div data-slot="user-chip" className={cn("flex min-w-0 items-center gap-3", className)} {...props}>
      <Avatar size={size}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 leading-snug">
        <div className={cn("truncate font-medium", size === "lg" && "text-lg font-semibold")}>{name}</div>
        {subtitle && <div className="truncate text-xs font-medium text-muted-foreground">{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

export { UserChip }
