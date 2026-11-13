"use client"

import type * as React from "react"
import { SidebarLayout, type SidebarLayoutProps } from "@/components/admin/sidebar-layout"
import { Badge } from "@/components/ui/badge"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface AppNavItem {
  label: string
  /** Icon element, e.g. <LayoutDashboardIcon />. */
  icon?: React.ReactNode
  href?: string
  onSelect?: () => void
  active?: boolean
  /** Count or short label shown at the right. */
  badge?: React.ReactNode
}

export interface AppNavSection {
  label?: string
  items: AppNavItem[]
}

export interface AppBrandProps extends React.ComponentProps<"div"> {
  name: React.ReactNode
  subtitle?: React.ReactNode
  /** Icon element shown in the primary-colored tile. */
  icon?: React.ReactNode
  /** Optional trailing control, e.g. a workspace switcher button. */
  action?: React.ReactNode
}

/**
 * Logo tile + product name. Used in the sidebar header or a top bar.
 * In a sidebar collapsed to its icon rail, only the tile shows.
 */
function AppBrand({ name, subtitle, icon, action, className, ...props }: AppBrandProps) {
  return (
    <div data-slot="app-brand" className={cn("flex items-center gap-3", className)} {...props}>
      {icon && (
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground [&_svg]:size-[18px]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <div className="truncate text-[15px] font-semibold">{name}</div>
        {subtitle && <div className="truncate text-xs font-medium text-muted-foreground">{subtitle}</div>}
      </div>
      {action && <div className="contents group-data-[collapsible=icon]:hidden">{action}</div>}
    </div>
  )
}

export interface AppShellProps {
  /** Sidebar header content, usually <AppBrand />. */
  brand?: React.ReactNode
  /** Under the brand, e.g. a primary "New" button. */
  sidebarActions?: React.ReactNode
  nav?: AppNavSection[]
  /** Extra sidebar content under the nav (e.g. a usage card). Hidden in the icon rail. */
  sidebarExtra?: React.ReactNode
  /** Sidebar bottom content, usually <UserMenu />. */
  sidebarFooter?: React.ReactNode
  /** Top bar content inside the main area (search, actions). */
  header?: React.ReactNode
  /** Component used for nav links. Default "a". Pass Next.js Link or React Router Link. */
  linkComponent?: React.ElementType
  /** How the sidebar collapses on desktop. Default "icon": a collapse button shrinks it to an icon rail. */
  collapsible?: SidebarLayoutProps["collapsible"]
  /** Remember the sidebar's expanded or collapsed state in localStorage under this key. */
  storageKey?: string
  defaultOpen?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Full admin layout on SidebarLayout: nav sidebar that collapses to an icon rail (a sheet on mobile) + main column.
 * Nav items show their label as a tooltip in the rail. Drop to SidebarLayout or the Sidebar primitives for anything custom.
 */
function AppShell({
  brand,
  sidebarActions,
  nav = [],
  sidebarExtra,
  sidebarFooter,
  header,
  linkComponent: Link = "a",
  collapsible,
  storageKey,
  defaultOpen = true,
  className,
  children,
}: AppShellProps) {
  return (
    <SidebarLayout
      brand={brand}
      sidebarActions={sidebarActions}
      sidebarFooter={sidebarFooter}
      collapsible={collapsible}
      storageKey={storageKey}
      defaultOpen={defaultOpen}
      width="15.75rem"
      className={className}
      sidebar={
        <div className="flex flex-1 flex-col gap-5">
          {nav.map((section, i) => (
            <SidebarGroup
              key={section.label ?? i}
              className="transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:px-0 motion-reduce:transition-none"
            >
              {section.label && <SidebarGroupLabel className="text-xs font-medium">{section.label}</SidebarGroupLabel>}
              <SidebarMenu className="gap-1">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild={!!item.href}
                      isActive={item.active}
                      onClick={item.onSelect}
                      tooltip={item.label}
                      className="group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:px-3!"
                    >
                      {item.href ? (
                        <Link href={item.href}>
                          {item.icon}
                          <span className="flex-1 whitespace-nowrap transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none">
                            {item.label}
                          </span>
                          {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
                        </Link>
                      ) : (
                        <>
                          {item.icon}
                          <span className="flex-1 whitespace-nowrap transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none">
                            {item.label}
                          </span>
                          {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
          {sidebarExtra && <div className="mt-auto px-2 group-data-[collapsible=icon]:hidden">{sidebarExtra}</div>}
        </div>
      }
    >
      {header !== undefined && (
        <header data-slot="app-header" className="flex flex-wrap items-center gap-3 px-4 pt-5 md:px-8">
          <SidebarTrigger className="md:hidden" />
          {header}
        </header>
      )}
      <div data-slot="app-content" className="flex min-w-0 flex-col gap-7 px-4 pt-7 pb-12 md:px-8">
        {children}
      </div>
    </SidebarLayout>
  )
}

function NavBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="soft" className="h-5 px-2 group-data-[collapsible=icon]:hidden">
      {children}
    </Badge>
  )
}

export { AppShell, AppBrand }
