"use client"

import { ChevronsUpDownIcon, LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import type * as React from "react"
import { type CategoryColor, categoryBg } from "@/components/admin/category"
import { initials, UserChip } from "@/components/admin/user-chip"
import { useTheme, type ThemeMode } from "@/components/theme/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebarOptional } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface UserMenuProps {
  name: string
  /** Second line, e.g. the email or "Signed in". */
  subtitle?: React.ReactNode
  avatarUrl?: string
  /** Category colour behind the initials when there is no photo. */
  color?: CategoryColor
  /** Extra items between the header and the theme choice, e.g. a Settings DropdownMenuItem. */
  children?: React.ReactNode
  /** Show the Light / Dark / System choice. Default true. Needs ThemeProvider. */
  themeSwitch?: boolean
  /** Adds a Sign out item at the bottom. */
  onSignOut?: () => void
  /** Default "Sign out". */
  signOutLabel?: React.ReactNode
  /** Trigger is just the avatar (44px on touch screens) and the menu opens below it, e.g. in a phone page header. */
  compact?: boolean
  className?: string
}

const themes: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { mode: "light", label: "Light", icon: <SunIcon /> },
  { mode: "dark", label: "Dark", icon: <MoonIcon /> },
  { mode: "system", label: "System", icon: <MonitorIcon /> },
]

/**
 * The signed-in user as a menu button, for a sidebar footer or top bar: theme choice, app items such as
 * Settings, and sign out. In a sidebar icon rail the trigger is just the avatar and the menu opens to the side.
 */
function UserMenu({
  name,
  subtitle,
  avatarUrl,
  color,
  children,
  themeSwitch = true,
  onSignOut,
  signOutLabel = "Sign out",
  compact = false,
  className,
}: UserMenuProps) {
  const { mode, setMode } = useTheme()
  const sidebar = useSidebarOptional()
  const rail = sidebar?.state === "collapsed" && !sidebar.isMobile
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="user-menu-trigger"
        aria-label={compact ? `Account menu for ${name}` : rail ? name : undefined}
        className={cn(
          compact
            ? "grid size-10 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background pointer-coarse:size-11"
            : "flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-0.5",
          className,
        )}
      >
        {compact || rail ? (
          // Initials are CSS content, not text, so the visible label does not clash with the button's name.
          <Avatar aria-hidden="true">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback
              data-initials={initials(name)}
              className={cn(
                "after:content-[attr(data-initials)]",
                color && [categoryBg[color], "text-category-foreground"],
              )}
            />
          </Avatar>
        ) : (
          <>
            <UserChip name={name} subtitle={subtitle} avatarUrl={avatarUrl} color={color} className="flex-1" />
            <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-slot="user-menu"
        side={compact ? "bottom" : rail ? "right" : "top"}
        align={compact || rail ? "end" : "start"}
        className={compact ? "min-w-60" : "w-(--radix-dropdown-menu-trigger-width) min-w-60"}
      >
        <DropdownMenuLabel className="flex min-w-0 flex-col font-normal">
          <span className="truncate font-medium text-foreground">{name}</span>
          {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
        </DropdownMenuLabel>
        {children && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>{children}</DropdownMenuGroup>
          </>
        )}
        {themeSwitch && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as ThemeMode)}>
              {themes.map((t) => (
                <DropdownMenuRadioItem key={t.mode} value={t.mode} onSelect={(e) => e.preventDefault()}>
                  {t.icon}
                  {t.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}
        {onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSignOut}>
              <LogOutIcon />
              {signOutLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
