"use client"

import { PanelLeftCloseIcon, PanelLeftOpenIcon, PanelRightIcon, TriangleAlertIcon } from "lucide-react"
import * as React from "react"
import { ChatThread } from "@/components/ai/chat"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  useSidebarOptional,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const WIDE = "(min-width: 1280px)"

interface ChatShellContextValue {
  detailsTitle: string
  /** Whether the details panel is showing (inline on wide screens, as a sheet otherwise). */
  detailsOpen: boolean
  toggleDetails: () => void
}

const ChatShellContext = React.createContext<ChatShellContextValue | null>(null)

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

export interface ChatShellProps {
  /** Sidebar top, usually <AppBrand />. Collapses to its logo tile in the icon rail. */
  brand?: React.ReactNode
  /** Under the brand, usually <NewConversationButton />. Stays visible in the icon rail. */
  sidebarActions?: React.ReactNode
  /** Scrolling sidebar body, usually <ConversationList />. Hidden in the icon rail. */
  sidebar?: React.ReactNode
  /** Sidebar bottom, usually <UserChip /> with a ThemeToggle as its action. */
  sidebarFooter?: React.ReactNode
  /** Right-hand panel, e.g. Cards with details about the open conversation. Inline at 1280px and up, a sheet below. */
  details?: React.ReactNode
  /** Sheet title and toggle label for the details panel. Default "Details". */
  detailsTitle?: string
  /** Show the details panel at first on wide screens. Default true. */
  defaultDetailsOpen?: boolean
  /** Remember the sidebar's expanded or collapsed state in localStorage under this key. */
  storageKey?: string
  /** Sidebar expanded at first (when nothing is stored). Default true. */
  defaultOpen?: boolean
  className?: string
  /** The main column, usually <ChatPanel />. */
  children: React.ReactNode
}

/**
 * Full-height chat app layout: a sidebar that collapses to an icon rail (a sheet on mobile), the main chat
 * column, and an optional details panel. Put a ChatPanel inside.
 */
function ChatShell({
  brand,
  sidebarActions,
  sidebar,
  sidebarFooter,
  details,
  detailsTitle = "Details",
  defaultDetailsOpen = true,
  storageKey,
  defaultOpen = true,
  className,
  children,
}: ChatShellProps) {
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
  const wide = useMediaQuery(WIDE)
  const [inline, setInline] = React.useState(defaultDetailsOpen)
  const [sheet, setSheet] = React.useState(false)
  const hasDetails = details !== undefined && details !== null && details !== false
  const ctx = React.useMemo<ChatShellContextValue | null>(
    () =>
      hasDetails
        ? {
            detailsTitle,
            detailsOpen: wide ? inline : sheet,
            toggleDetails: () => (wide ? setInline((v) => !v) : setSheet((v) => !v)),
          }
        : null,
    [hasDetails, detailsTitle, wide, inline, sheet],
  )

  return (
    <TooltipProvider>
      <SidebarProvider
        open={open}
        onOpenChange={onOpenChange}
        style={{ "--sidebar-width": "17rem", "--sidebar-width-icon": "4.25rem" } as React.CSSProperties}
      >
        <ChatShellContext.Provider value={ctx}>
          <Sidebar collapsible="icon">
            <SidebarHeader className="gap-5 px-3.5 pt-[max(1.25rem,env(safe-area-inset-top))] group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:px-0">
              <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3">
                {brand && <div className="min-w-0 flex-1 pl-2 group-data-[collapsible=icon]:pl-0">{brand}</div>}
                <SidebarCollapseButton />
              </div>
              {sidebarActions && (
                <div className="flex flex-col gap-2.5 group-data-[collapsible=icon]:items-center">{sidebarActions}</div>
              )}
            </SidebarHeader>
            <SidebarContent className="px-3.5 pt-2">{sidebar}</SidebarContent>
            {sidebarFooter && (
              <SidebarFooter className="px-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] group-data-[collapsible=icon]:px-0">
                <div className="px-2 group-data-[collapsible=icon]:px-0">{sidebarFooter}</div>
              </SidebarFooter>
            )}
          </Sidebar>
          <SidebarInset data-slot="chat-shell" className={cn("h-dvh min-w-0 overflow-hidden", className)}>
            <div className="flex h-full min-h-0 gap-3 p-2 sm:p-3 md:pl-0">
              {children}
              {hasDetails && wide && inline && (
                <aside
                  data-slot="chat-shell-details"
                  aria-label={detailsTitle}
                  className="flex w-75 shrink-0 flex-col gap-3 overflow-y-auto"
                >
                  {details}
                </aside>
              )}
            </div>
            {hasDetails && !wide && (
              <Sheet open={sheet} onOpenChange={setSheet}>
                <SheetContent className="overflow-y-auto bg-background p-4">
                  <SheetHeader className="p-0">
                    <SheetTitle>{detailsTitle}</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-3">{details}</div>
                </SheetContent>
              </Sheet>
            )}
          </SidebarInset>
        </ChatShellContext.Provider>
      </SidebarProvider>
    </TooltipProvider>
  )
}

/** Collapse / expand control for the desktop sidebar, with a tooltip. Hidden on mobile, where the sidebar is a sheet. */
function SidebarCollapseButton() {
  const { state, isMobile, toggleSidebar } = useSidebar()
  if (isMobile) return null
  const label = state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={state === "collapsed" ? "icon" : "icon-sm"}
          aria-label={label}
          onClick={toggleSidebar}
        >
          {state === "collapsed" ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export interface ChatPanelProps extends Omit<React.ComponentProps<"section">, "title"> {
  /** Conversation title. */
  title?: React.ReactNode
  /** Line under the title, e.g. "Started Nov 10, 9:41". */
  description?: React.ReactNode
  /** Header controls, e.g. <ModelPicker /> and a <StatusBadge size="lg" />. */
  actions?: React.ReactNode
  /** Warning bar under the header, e.g. "Reconnecting…". */
  notice?: React.ReactNode
  /** Under the thread, usually <PromptInput />. */
  composer?: React.ReactNode
  /** Changing it starts a fresh thread view (scroll position resets). Pass the conversation id. */
  conversationId?: React.Key
  /** Keep the thread scrolled to the bottom as it grows. Default true. */
  autoScroll?: boolean
  /** The thread: ChatMessage, ToolGroup, ApprovalCard… */
  children?: React.ReactNode
}

/**
 * The chat column as a card: header, optional notice, scrolling thread, composer. Inside ChatShell it adds the
 * mobile sidebar button and the details toggle to the header by itself.
 */
function ChatPanel({
  title,
  description,
  actions,
  notice,
  composer,
  conversationId,
  autoScroll,
  className,
  children,
  ...props
}: ChatPanelProps) {
  const sidebar = useSidebarOptional()
  const shell = React.useContext(ChatShellContext)
  return (
    <section
      data-slot="chat-panel"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-card",
        className,
      )}
      {...props}
    >
      <header className="flex flex-wrap items-center gap-2.5 px-3.5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:pr-4 sm:pl-6">
        {sidebar && <SidebarTrigger className="md:hidden" />}
        <div className="flex min-w-0 flex-1 basis-40 flex-col leading-snug">
          {title && <h1 className="truncate text-[15px] font-semibold">{title}</h1>}
          {description && <span className="truncate text-xs text-muted-foreground">{description}</span>}
        </div>
        {actions}
        {shell && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Toggle ${shell.detailsTitle.toLowerCase()}`}
            aria-pressed={shell.detailsOpen}
            onClick={shell.toggleDetails}
          >
            <PanelRightIcon />
          </Button>
        )}
      </header>
      {notice && (
        <div className="px-3.5 pb-1 sm:px-6">
          <Alert variant="warning" role="status">
            <TriangleAlertIcon />
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        </div>
      )}
      <ChatThread key={conversationId} autoScroll={autoScroll} className="px-3.5 pt-4 sm:px-6" contentClassName="gap-7">
        {children}
      </ChatThread>
      {composer && <div className="px-3.5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">{composer}</div>}
    </section>
  )
}

export { ChatShell, ChatPanel }
