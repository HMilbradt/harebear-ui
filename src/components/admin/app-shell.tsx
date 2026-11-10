"use client"

import type * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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

/** Logo tile + product name. Used in the sidebar header or a top bar. */
function AppBrand({ name, subtitle, icon, action, className, ...props }: AppBrandProps) {
  return (
    <div data-slot="app-brand" className={cn("flex items-center gap-3", className)} {...props}>
      {icon && (
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground [&_svg]:size-[18px]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">{name}</div>
        {subtitle && <div className="truncate text-xs font-medium text-muted-foreground">{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

export interface AppShellProps {
  /** Sidebar header content, usually <AppBrand />. */
  brand?: React.ReactNode
  nav?: AppNavSection[]
  /** Extra sidebar content under the nav (e.g. a usage card). */
  sidebarExtra?: React.ReactNode
  /** Sidebar bottom content, usually <UserChip />. */
  sidebarFooter?: React.ReactNode
  /** Top bar content inside the main area (search, actions). */
  header?: React.ReactNode
  /** Component used for nav links. Default "a". Pass Next.js Link or React Router Link. */
  linkComponent?: React.ElementType
  defaultOpen?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Full admin layout: collapsible sidebar (sheet on mobile) + main column.
 * Built on the Sidebar primitives; drop to those for anything custom.
 */
function AppShell({
  brand,
  nav = [],
  sidebarExtra,
  sidebarFooter,
  header,
  linkComponent: Link = "a",
  defaultOpen = true,
  className,
  children,
}: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} style={{ "--sidebar-width": "15.75rem" } as React.CSSProperties}>
      <Sidebar className="border-r-0">
        {brand && <SidebarHeader className="px-4 pt-6 pb-2">{brand}</SidebarHeader>}
        <SidebarContent className="gap-5 px-2">
          {nav.map((section, i) => (
            <SidebarGroup key={section.label ?? i}>
              {section.label && <SidebarGroupLabel className="text-xs font-medium">{section.label}</SidebarGroupLabel>}
              <SidebarMenu className="gap-1">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild={!!item.href} isActive={item.active} onClick={item.onSelect}>
                      {item.href ? (
                        <Link href={item.href}>
                          {item.icon}
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
                        </Link>
                      ) : (
                        <>
                          {item.icon}
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
          {sidebarExtra && <div className="mt-auto px-2">{sidebarExtra}</div>}
        </SidebarContent>
        {sidebarFooter && <SidebarFooter className="px-4 pb-6">{sidebarFooter}</SidebarFooter>}
      </Sidebar>
      <SidebarInset className={cn("min-w-0", className)}>
        {header !== undefined && (
          <header data-slot="app-header" className="flex flex-wrap items-center gap-3 px-4 pt-5 md:px-8">
            <SidebarTrigger className="md:hidden" />
            {header}
          </header>
        )}
        <div data-slot="app-content" className="flex min-w-0 flex-col gap-7 px-4 pt-7 pb-12 md:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function NavBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="soft" className="h-5 px-2">
      {children}
    </Badge>
  )
}

export { AppShell, AppBrand }
