"use client"

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function readStored(key: string) {
  try {
    const v = window.localStorage.getItem(key)
    return v === null ? null : v !== "collapsed"
  } catch {
    return null
  }
}

// Layout effect on the client so a stored state applies before paint; plain effect on the server (no warning).
const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

export interface SidebarLayoutProps {
  /** Sidebar top, usually <AppBrand />. Collapses to its logo tile in the icon rail. */
  brand?: React.ReactNode
  /** Under the brand, e.g. <NewConversationButton /> or a search box. Should cope with the icon rail. */
  sidebarActions?: React.ReactNode
  /** Scrolling sidebar body: nav menus, <ConversationList />… */
  sidebar?: React.ReactNode
  /** Sidebar bottom, usually <UserMenu />. */
  sidebarFooter?: React.ReactNode
  /**
   * - "icon" (default): a collapse button shrinks the sidebar to an icon rail on desktop.
   * - "offcanvas": the sidebar can be hidden entirely (toggle it with a SidebarTrigger).
   * - "none": always expanded on desktop.
   * On mobile the sidebar is always a sheet opened with a SidebarTrigger.
   */
  collapsible?: "icon" | "offcanvas" | "none"
  /** Remember the expanded or collapsed state in localStorage under this key. */
  storageKey?: string
  /** Expanded at first (when nothing is stored). Default true. */
  defaultOpen?: boolean
  /** Expanded sidebar width. Default "16rem". The icon rail is 4.25rem. */
  width?: string
  /** Classes for the main column (a SidebarInset). */
  className?: string
  /** The main column. */
  children?: React.ReactNode
}

/**
 * The base app layout: a sidebar (brand, actions, body, footer) that collapses to an icon rail on desktop and is a
 * sheet on mobile, next to the main column. AppShell and ChatShell are built on it; use it directly for other layouts.
 */
function SidebarLayout({
  brand,
  sidebarActions,
  sidebar,
  sidebarFooter,
  collapsible = "icon",
  storageKey,
  defaultOpen = true,
  width = "16rem",
  className,
  children,
}: SidebarLayoutProps) {
  // Start from defaultOpen on both server and client, then restore the stored state after hydration.
  const [open, setOpen] = React.useState(defaultOpen)
  useIsomorphicLayoutEffect(() => {
    if (!storageKey) return
    const stored = readStored(storageKey)
    if (stored !== null) setOpen(stored)
  }, [storageKey])
  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!storageKey) return
    try {
      window.localStorage.setItem(storageKey, next ? "open" : "collapsed")
    } catch {
      // Storage blocked (private mode): the state just isn't remembered.
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider
        open={collapsible === "none" ? true : open}
        onOpenChange={onOpenChange}
        style={{ "--sidebar-width": width, "--sidebar-width-icon": "4.25rem" } as React.CSSProperties}
      >
        <Sidebar collapsible={collapsible === "none" ? "offcanvas" : collapsible} data-slot="sidebar-layout-sidebar">
          <SidebarHeader className="gap-5 px-3.5 pt-[max(1.25rem,env(safe-area-inset-top))] group-data-[collapsible=icon]:gap-3">
            <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-start group-data-[collapsible=icon]:gap-3">
              {brand && <div className="min-w-0 flex-1 pl-2">{brand}</div>}
              {collapsible === "icon" && <SidebarCollapseButton />}
            </div>
            {sidebarActions && (
              <div className="flex flex-col gap-2.5 group-data-[collapsible=icon]:items-start">{sidebarActions}</div>
            )}
          </SidebarHeader>
          <SidebarContent className="px-3.5 pt-2">{sidebar}</SidebarContent>
          {sidebarFooter && (
            <SidebarFooter className="px-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="px-2 has-data-[slot=user-menu-trigger]:px-0">{sidebarFooter}</div>
            </SidebarFooter>
          )}
        </Sidebar>
        <SidebarInset data-slot="sidebar-layout" className={cn("min-w-0", className)}>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

/**
 * Collapse / expand control for a desktop sidebar with an icon rail, with a tooltip. Renders nothing on mobile,
 * where the sidebar is a sheet. SidebarLayout includes one; use it in custom Sidebar layouts.
 */
function SidebarCollapseButton({ className }: { className?: string }) {
  const { state, isMobile, toggleSidebar } = useSidebar()
  if (isMobile) return null
  const label = state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="sidebar-collapse-button"
          variant="ghost"
          size={state === "collapsed" ? "icon" : "icon-sm"}
          aria-label={label}
          onClick={toggleSidebar}
          className={className}
        >
          {state === "collapsed" ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export { SidebarLayout, SidebarCollapseButton }
