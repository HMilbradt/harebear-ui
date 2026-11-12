"use client"

import { LockIcon } from "lucide-react"
import type * as React from "react"
import { type CategoryColor, categoryBg } from "@/components/admin/category"
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

export interface MemberAvatarProps extends Omit<React.ComponentProps<typeof Avatar>, "children" | "color"> {
  name: string
  avatarUrl?: string
  /** Category colour behind the initials when there is no photo. Default: the soft primary tint. */
  color?: CategoryColor
}

/**
 * A person's photo, or their initials on their category colour. It is an image named after the person; pass
 * `aria-hidden` when the name is already shown next to it.
 */
function MemberAvatar({ name, avatarUrl, color, ...props }: MemberAvatarProps) {
  return (
    <Avatar role="img" aria-label={name} data-color={color} {...props}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback aria-hidden="true" className={cn(color && [categoryBg[color], "text-category-foreground"])}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export interface AvatarStackProps extends React.ComponentProps<"div"> {
  members: Pick<MemberAvatarProps, "name" | "avatarUrl" | "color">[]
  /** Total slots, default 4. Past it, `max - 1` faces and a "+N" chip. */
  max?: number
}

/** Overlapping small avatars, e.g. who a list is shared with. Each face is named; the overflow reads "N more". */
function AvatarStack({ members, max = 4, className, ...props }: AvatarStackProps) {
  const shown = members.length > max ? members.slice(0, max - 1) : members
  const extra = members.length - shown.length
  return (
    <div data-slot="avatar-stack" className={cn("flex -space-x-1.5", className)} {...props}>
      {shown.map((m, i) => (
        <MemberAvatar key={`${m.name}-${i}`} size="sm" {...m} className="ring-2 ring-background" />
      ))}
      {extra > 0 && (
        <span
          role="img"
          aria-label={`${extra} more`}
          className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-2 ring-background"
        >
          +{extra}
        </span>
      )}
    </div>
  )
}

export interface VisibilityBadgeProps extends React.ComponentProps<"div"> {
  visibility: "shared" | "private"
  /** Faces shown when shared. */
  members?: AvatarStackProps["members"]
  /** Default "Shared with everyone" or "Only you". */
  label?: React.ReactNode
}

/** Who can see something: faces and "Shared with everyone", or a lock and "Only you". */
function VisibilityBadge({ visibility, members, label, className, ...props }: VisibilityBadgeProps) {
  const shared = visibility === "shared"
  return (
    <div
      data-slot="visibility-badge"
      data-visibility={visibility}
      className={cn("inline-flex items-center gap-2 text-[13px] text-muted-foreground", className)}
      {...props}
    >
      {shared ? (
        members?.length ? (
          <AvatarStack members={members} aria-hidden="true" />
        ) : null
      ) : (
        <LockIcon aria-hidden="true" className="size-4 shrink-0" />
      )}
      <span>{label ?? (shared ? "Shared with everyone" : "Only you")}</span>
    </div>
  )
}

export interface UserChipProps extends Omit<React.ComponentProps<"div">, "color"> {
  name: string
  subtitle?: React.ReactNode
  avatarUrl?: string
  /** Category colour behind the initials when there is no photo. */
  color?: CategoryColor
  /** Trailing control, e.g. a menu button. */
  action?: React.ReactNode
  size?: "sm" | "default" | "lg"
}

/** Avatar + name + secondary line. In a sidebar collapsed to its icon rail, only the avatar shows. */
function UserChip({ name, subtitle, avatarUrl, color, action, size = "default", className, ...props }: UserChipProps) {
  return (
    <div
      data-slot="user-chip"
      className={cn("flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:justify-center", className)}
      {...props}
    >
      <MemberAvatar name={name} avatarUrl={avatarUrl} color={color} size={size} aria-hidden="true" />
      <div className="min-w-0 flex-1 leading-snug group-data-[collapsible=icon]:hidden">
        <div className={cn("truncate font-medium", size === "lg" && "text-lg font-semibold")}>{name}</div>
        {subtitle && <div className="truncate text-xs font-medium text-muted-foreground">{subtitle}</div>}
      </div>
      {action && <div className="contents group-data-[collapsible=icon]:hidden">{action}</div>}
    </div>
  )
}

export { AvatarStack, MemberAvatar, UserChip, VisibilityBadge }
