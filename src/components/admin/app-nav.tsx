"use client"

import { ChevronDownIcon, PlusIcon } from "lucide-react"
import * as React from "react"
import type { AppNavItem } from "@/components/admin/app-shell"
import { SidebarLayout, type SidebarLayoutProps } from "@/components/admin/sidebar-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useToastClearance } from "@/lib/toast-clearance"
import { cn } from "@/lib/utils"

export interface AppNavPlace extends Omit<AppNavItem, "badge"> {
  /** Count at the right in the sidebar and on the icon in the tab bar, e.g. open to-dos. Hidden when 0. */
  count?: number
  /** Show in the phone tab bar. Default true; the first 5 that are not false are shown. */
  tab?: boolean
  /** Show in the desktop sidebar. Default true; false makes a tab-bar-only place, e.g. Lists when the sidebar has a Lists group. */
  sidebar?: boolean
}

export interface AppNavGroup {
  /** Group heading, e.g. "Lists". */
  label: string
  items: AppNavPlace[]
  /** Expanded at first. Default true. */
  defaultOpen?: boolean
  /** Shows an add button next to the heading. */
  onAdd?: () => void
  /** Accessible label of the add button, e.g. "New list". Default "Add". */
  addLabel?: string
}

export interface AppNavAction {
  label: string
  icon: React.ReactNode
  onSelect: () => void
  /** Show the button in the desktop sidebar. Default true; false keeps only the round phone button. */
  sidebar?: boolean
}

export interface AppNavProps {
  /** Product mark at the top of the sidebar, usually <AppBrand />. */
  brand?: React.ReactNode
  /** Top-level places (Today, Calendar, Docs). Sidebar items on desktop, tabs on phones. */
  places: AppNavPlace[]
  /** One collapsible group under the places, e.g. Lists with an add button. Desktop sidebar only. */
  group?: AppNavGroup
  /** Sidebar bottom, usually <UserMenu />. Desktop sidebar only. */
  footer?: React.ReactNode
  /** Primary action: a button under the brand on desktop, a round floating button above the tab bar on phones. */
  action?: AppNavAction
  /** Accessible name of the navigation. Default "Main". */
  label?: string
  /** Component used for links. Default "a". Pass Next.js Link or React Router Link. */
  linkComponent?: React.ElementType
  collapsible?: SidebarLayoutProps["collapsible"]
  storageKey?: string
  defaultOpen?: boolean
  /** Sidebar width. Default "15.75rem". */
  width?: string
  /** Classes for the main column. */
  className?: string
  children?: React.ReactNode
}

const TAB_LIMIT = 5

/**
 * App navigation from one config. Desktop (768px and up): SidebarLayout with the brand, action, places, a
 * collapsible group and the footer; the active place is a raised card. Phones: a bottom tab bar with up to 5 places
 * and an optional round action button. The main column gets bottom padding and sets `--hb-bottom-inset` (and
 * `--hb-fab-inset`) so an AssistantDock rendered inside sits above the tab bar and the action button.
 */
function AppNav({
  brand,
  places,
  group,
  footer,
  action,
  label = "Main",
  linkComponent = "a",
  collapsible,
  storageKey,
  defaultOpen,
  width = "15.75rem",
  className,
  children,
}: AppNavProps) {
  const tabs = places.filter((p) => p.tab !== false).slice(0, TAB_LIMIT)
  // Toasts stack above the tab bar and the action button on phones (styles.css applies these under 768px only).
  useToastClearance("--hb-toast-nav", "calc(4.5rem + env(safe-area-inset-bottom))", tabs.length > 0)
  useToastClearance("--hb-toast-fab", "4.5rem", Boolean(action))
  return (
    <SidebarLayout
      brand={brand}
      collapsible={collapsible}
      storageKey={storageKey}
      defaultOpen={defaultOpen}
      width={width}
      sidebarFooter={footer}
      sidebarActions={
        action &&
        action.sidebar !== false && (
          <Button
            type="button"
            aria-label={action.label}
            onClick={action.onSelect}
            className="w-full justify-start group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            {action.icon}
            <span className="group-data-[collapsible=icon]:hidden">{action.label}</span>
          </Button>
        )
      }
      sidebar={
        <nav aria-label={label} data-slot="app-nav" className="flex flex-col gap-5">
          <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
            {places
              .filter((p) => p.sidebar !== false)
              .map((place) => (
                <PlaceItem key={place.label} place={place} Link={linkComponent} />
              ))}
          </SidebarMenu>
          {group && <NavGroup group={group} Link={linkComponent} />}
        </nav>
      }
      className={cn(
        "max-md:pb-[calc(4.5rem+env(safe-area-inset-bottom))] max-md:[--hb-bottom-inset:calc(4.5rem+env(safe-area-inset-bottom))]",
        action && "max-md:[--hb-fab-inset:4.5rem]",
        className,
      )}
    >
      {children}
      {tabs.length > 0 && <TabBar tabs={tabs} label={label} Link={linkComponent} />}
      {action && (
        <Button
          type="button"
          data-slot="app-nav-fab"
          size="icon-lg"
          shape="pill"
          aria-label={action.label}
          onClick={action.onSelect}
          className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom)+1rem)] z-30 size-14 shadow-card md:hidden [&_svg:not([class*='size-'])]:size-6"
        >
          {action.icon}
        </Button>
      )}
    </SidebarLayout>
  )
}

function PlaceItem({ place, Link }: { place: AppNavPlace; Link: React.ElementType }) {
  const content = (
    <>
      {place.icon}
      <span className="flex-1">{place.label}</span>
      {!!place.count && (
        <Badge variant="soft" className="h-5 px-2 group-data-[collapsible=icon]:hidden">
          {place.count}
        </Badge>
      )}
    </>
  )
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={!!place.href}
        isActive={place.active}
        aria-current={place.active ? "page" : undefined}
        onClick={place.onSelect}
        tooltip={place.label}
      >
        {place.href ? <Link href={place.href}>{content}</Link> : content}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavGroup({ group, Link }: { group: AppNavGroup; Link: React.ElementType }) {
  const [open, setOpen] = React.useState(group.defaultOpen ?? true)
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="app-nav-group"
      className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden"
    >
      <div className="flex items-center gap-1 pr-1">
        <CollapsibleTrigger className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40">
          <span className="truncate">{group.label}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn("size-3.5 transition-transform motion-reduce:transition-none", !open && "-rotate-90")}
          />
        </CollapsibleTrigger>
        {group.onAdd && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={group.addLabel ?? "Add"}
            onClick={group.onAdd}
          >
            <PlusIcon />
          </Button>
        )}
      </div>
      <CollapsibleContent>
        <SidebarMenu className="gap-1">
          {group.items.map((place) => (
            <PlaceItem key={place.label} place={place} Link={Link} />
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TabBar({ tabs, label, Link }: { tabs: AppNavPlace[]; label: string; Link: React.ElementType }) {
  return (
    <nav
      aria-label={label}
      data-slot="app-nav-tabs"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const Comp = tab.href ? Link : "button"
          return (
            <li key={tab.label} className="flex min-w-0 flex-1">
              <Comp
                {...(tab.href ? { href: tab.href } : { type: "button", onClick: tab.onSelect })}
                aria-current={tab.active ? "page" : undefined}
                className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 aria-[current=page]:text-primary"
              >
                <span className="relative [&_svg]:size-6">
                  {tab.icon}
                  {!!tab.count && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1.5 left-[calc(100%-0.5rem)] grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-xs leading-none font-semibold text-primary-foreground"
                    >
                      {tab.count > 99 ? "99+" : tab.count}
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate">
                  {tab.label}
                  {!!tab.count && <span className="sr-only">, {tab.count}</span>}
                </span>
              </Comp>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { AppNav }
