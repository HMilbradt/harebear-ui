"use client"

import { PanelRightIcon, TriangleAlertIcon } from "lucide-react"
import * as React from "react"
import { SidebarLayout, type SidebarLayoutProps } from "@/components/admin/sidebar-layout"
import { ChatThread } from "@/components/ai/chat"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SidebarTrigger, useSidebarOptional } from "@/components/ui/sidebar"
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

export interface ChatShellProps {
  /** Sidebar top, usually <AppBrand />. Collapses to its logo tile in the icon rail. */
  brand?: React.ReactNode
  /** Under the brand, usually <NewConversationButton />. Stays visible in the icon rail. */
  sidebarActions?: React.ReactNode
  /** Scrolling sidebar body, usually <ConversationList />. Hidden in the icon rail. */
  sidebar?: React.ReactNode
  /** Sidebar bottom, usually <UserMenu /> (or a <UserChip /> with a ThemeToggle as its action). */
  sidebarFooter?: React.ReactNode
  /** Right-hand panel, e.g. Cards with details about the open conversation. Inline at 1280px and up, a sheet below. */
  details?: React.ReactNode
  /** Sheet title and toggle label for the details panel. Default "Details". */
  detailsTitle?: string
  /** Show the details panel at first on wide screens. Default true. */
  defaultDetailsOpen?: boolean
  /** How the sidebar collapses on desktop. Default "icon" (an icon rail). See SidebarLayout. */
  collapsible?: SidebarLayoutProps["collapsible"]
  /** Remember the sidebar's expanded or collapsed state in localStorage under this key. */
  storageKey?: string
  /** Sidebar expanded at first (when nothing is stored). Default true. */
  defaultOpen?: boolean
  className?: string
  /** The main column, usually <ChatPanel />. */
  children: React.ReactNode
}

/**
 * Full-height chat app layout: SidebarLayout (sidebar with an icon rail, a sheet on mobile) around the chat
 * column, plus an optional details panel. Put a ChatPanel inside.
 */
function ChatShell({
  brand,
  sidebarActions,
  sidebar,
  sidebarFooter,
  details,
  detailsTitle = "Details",
  defaultDetailsOpen = true,
  collapsible,
  storageKey,
  defaultOpen = true,
  className,
  children,
}: ChatShellProps) {
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
    <SidebarLayout
      brand={brand}
      sidebarActions={sidebarActions}
      sidebar={sidebar}
      sidebarFooter={sidebarFooter}
      collapsible={collapsible}
      storageKey={storageKey}
      defaultOpen={defaultOpen}
      width="17rem"
      className={cn("h-dvh overflow-hidden", className)}
    >
      <ChatShellContext.Provider value={ctx}>
        <div data-slot="chat-shell" className="flex h-full min-h-0 gap-3 p-2 sm:p-3 md:pl-0">
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
      </ChatShellContext.Provider>
    </SidebarLayout>
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
