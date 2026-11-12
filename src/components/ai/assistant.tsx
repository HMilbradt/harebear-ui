"use client"

import { Maximize2Icon, SparklesIcon, XIcon } from "lucide-react"
import * as React from "react"
import { AskBox } from "@/components/ai/ask-box"
import { AssistantAvatar, ChatMessage, ChatThread, TypingIndicator } from "@/components/ai/chat"
import type { SpeechSource } from "@/components/ai/dictation"
import { Button } from "@/components/ui/button"
import { useToastClearance } from "@/lib/toast-clearance"
import { cn } from "@/lib/utils"

export interface AssistantMessage {
  id: string
  role: "user" | "assistant"
  /** Text or nodes: Prose, ActionReceipts, ToolSteps. */
  content: React.ReactNode
}

/** What the open page tells the assistant: use it as context, and its suggestions fill the dock's empty state. */
export interface AssistantPage {
  /** Stable key for the page, e.g. the route. */
  id: string
  title?: string
  /** Anything the send handler needs: the open list, the selected record. */
  data?: unknown
  suggestions?: string[]
}

export interface AssistantSendContext {
  page: AssistantPage | null
  /** The conversation before this message. */
  messages: AssistantMessage[]
  /** Add a message (a streamed reply, a receipt) while the handler runs. Returns its id. */
  append: (message: Omit<AssistantMessage, "id"> & { id?: string }) => string
  /** Replace a message's content, e.g. while a reply streams in. */
  update: (id: string, content: React.ReactNode) => void
}

export interface AssistantContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  messages: AssistantMessage[]
  /** True while the send handler runs. */
  pending: boolean
  page: AssistantPage | null
  setPage: (page: AssistantPage | null) => void
  /** Adds the user message, opens the dock and runs the app's onSend. */
  send: (text: string) => Promise<void>
  append: AssistantSendContext["append"]
  update: AssistantSendContext["update"]
  clear: () => void
}

const AssistantContext = React.createContext<AssistantContextValue | null>(null)

export interface AssistantProviderProps {
  /**
   * The app's send handler. Return the reply (text or nodes) to append it, or call `append` / `update` yourself
   * (for streaming or receipts) and return nothing. A thrown error is shown as the reply.
   */
  onSend: (text: string, context: AssistantSendContext) => React.ReactNode | Promise<React.ReactNode>
  initialMessages?: AssistantMessage[]
  defaultOpen?: boolean
  children?: React.ReactNode
}

let nextId = 0
const newId = () => `m${Date.now().toString(36)}${(nextId++).toString(36)}`

/**
 * Keeps one assistant conversation across pages: open state, messages, the open page as context, and the app's
 * send handler. Mount it above the router outlet; read it with useAssistant().
 */
function AssistantProvider({ onSend, initialMessages = [], defaultOpen = false, children }: AssistantProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [messages, setMessages] = React.useState(initialMessages)
  const [pending, setPending] = React.useState(false)
  const [page, setPage] = React.useState<AssistantPage | null>(null)
  const messagesRef = React.useRef(messages)
  messagesRef.current = messages
  const pageRef = React.useRef(page)
  pageRef.current = page
  const onSendRef = React.useRef(onSend)
  onSendRef.current = onSend

  const append = React.useCallback<AssistantSendContext["append"]>((m) => {
    const id = m.id ?? newId()
    setMessages((list) => [...list, { ...m, id }])
    return id
  }, [])
  const update = React.useCallback<AssistantSendContext["update"]>((id, content) => {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, content } : m)))
  }, [])
  const send = React.useCallback(
    async (text: string) => {
      const before = messagesRef.current
      append({ role: "user", content: text })
      setOpen(true)
      setPending(true)
      try {
        const reply = await onSendRef.current(text, { page: pageRef.current, messages: before, append, update })
        if (reply !== undefined && reply !== null && reply !== false) append({ role: "assistant", content: reply })
      } catch (e) {
        append({ role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." })
      } finally {
        setPending(false)
      }
    },
    [append, update],
  )

  const value = React.useMemo<AssistantContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((v) => !v),
      messages,
      pending,
      page,
      setPage,
      send,
      append,
      update,
      clear: () => setMessages([]),
    }),
    [open, messages, pending, page, send, append, update],
  )
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

/** The assistant state from AssistantProvider. Throws outside one. */
export function useAssistant(): AssistantContextValue {
  const ctx = React.useContext(AssistantContext)
  if (!ctx) throw new Error("useAssistant must be used inside <AssistantProvider>")
  return ctx
}

/**
 * Tells the assistant which page is open, for as long as the calling component is mounted. The page is replaced
 * when `page.id` changes; other fields are read at send time.
 */
export function useAssistantPage(page: AssistantPage) {
  const { setPage } = useAssistant()
  const latest = React.useRef(page)
  latest.current = page
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-register only when the page id changes.
  React.useEffect(() => {
    setPage(latest.current)
    return () => setPage(null)
  }, [page.id, setPage])
}

export interface AssistantDockProps extends Omit<React.ComponentProps<"section">, "title"> {
  /** Assistant name in the header and launcher, e.g. "HomeBot". Default "Assistant". */
  title?: string
  /** Header and launcher icon. Default a sparkle. */
  icon?: React.ReactNode
  /** Link to the full-screen chat. Shows an expand button in the header. */
  fullScreenHref?: string
  /** Empty state heading. Default "How can I help?". */
  emptyTitle?: React.ReactNode
  /** Empty state line under the heading. */
  emptyDescription?: React.ReactNode
  /** Suggestion pills in the empty state. Default: the open page's suggestions. */
  suggestions?: string[]
  /** Composer placeholder. Default `Ask ${title}`. */
  placeholder?: string
  /** Speech source for the mic. Default the browser's; `false` hides the mic. */
  dictation?: SpeechSource | false
  /** Show the floating launcher button while closed. Default true. Turn off when another control opens it. */
  launcher?: boolean
  /** Label of the launcher. Default `Ask ${title}`. */
  launcherLabel?: string
}

/**
 * The assistant as a floating panel over the page (it never reflows the page): header, empty state with
 * suggestions, message list, AskBox. A soft launcher button opens it. Escape closes it. Needs AssistantProvider.
 * Sits above AppNav's phone tab bar.
 */
function AssistantDock({
  title = "Assistant",
  icon = <SparklesIcon />,
  fullScreenHref,
  emptyTitle = "How can I help?",
  emptyDescription,
  suggestions,
  placeholder,
  dictation,
  launcher = true,
  launcherLabel,
  className,
  ...props
}: AssistantDockProps) {
  const { open, setOpen, messages, pending, page, send } = useAssistant()
  const [draft, setDraft] = React.useState("")
  const titleId = React.useId()
  const panelRef = React.useRef<HTMLElement>(null)
  const launcherRef = React.useRef<HTMLButtonElement>(null)
  const wasOpen = React.useRef(open)
  const pills = suggestions ?? page?.suggestions ?? []

  React.useEffect(() => {
    if (open && !wasOpen.current) panelRef.current?.querySelector("textarea")?.focus()
    if (!open && wasOpen.current) launcherRef.current?.focus()
    wasOpen.current = open
  }, [open])

  const submit = (text: string) => {
    if (pending) return
    setDraft("")
    // Suggestion pills unmount once the thread starts: keep focus in the composer.
    panelRef.current?.querySelector("textarea")?.focus()
    void send(text)
  }

  // Toasts stack above the launcher (48px plus an 8px gap) while it is showing.
  useToastClearance("--hb-toast-launcher", "3.5rem", !open && launcher)

  if (!open) {
    if (!launcher) return null
    return (
      <button
        ref={launcherRef}
        type="button"
        data-slot="assistant-launcher"
        aria-expanded={false}
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[calc(var(--hb-bottom-inset,0px)+var(--hb-fab-inset,0px)+1rem)] z-40 flex h-12 items-center gap-2 rounded-full border border-border bg-card pr-5 pl-2 text-sm font-medium text-foreground shadow-card outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/20 md:right-6 md:bottom-6"
      >
        <AssistantAvatar icon={icon} />
        {launcherLabel ?? `Ask ${title}`}
      </button>
    )
  }

  return (
    <section
      ref={panelRef}
      data-slot="assistant-dock"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation()
          setOpen(false)
        }
      }}
      className={cn(
        "fixed inset-x-2 bottom-[calc(var(--hb-bottom-inset,0px)+0.5rem)] z-40 flex h-[min(40rem,calc(100dvh-var(--hb-bottom-inset,0px)-1rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card duration-200 animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none sm:inset-x-auto sm:right-4 sm:w-104 md:right-6 md:bottom-6 md:h-[min(40rem,calc(100dvh-3rem))]",
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-2.5 py-2.5 pr-2.5 pl-4">
        <AssistantAvatar icon={icon} />
        <h2 id={titleId} className="min-w-0 flex-1 truncate text-[15px] font-semibold">
          {title}
        </h2>
        {fullScreenHref && (
          <Button asChild variant="ghost" size="icon" shape="pill">
            <a href={fullScreenHref} aria-label="Open full screen">
              <Maximize2Icon />
            </a>
          </Button>
        )}
        <Button variant="ghost" size="icon" shape="pill" aria-label={`Close ${title}`} onClick={() => setOpen(false)}>
          <XIcon />
        </Button>
      </header>
      {messages.length === 0 ? (
        <div
          data-slot="assistant-dock-empty"
          className="flex flex-1 flex-col justify-end gap-1 overflow-y-auto px-5 pb-3"
        >
          <p className="text-lg font-semibold">{emptyTitle}</p>
          {emptyDescription && <p className="text-sm text-muted-foreground">{emptyDescription}</p>}
        </div>
      ) : (
        <ChatThread className="px-4 pt-2" contentClassName="gap-5">
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} avatar={false}>
              {m.content}
            </ChatMessage>
          ))}
          {pending && <TypingIndicator label="Working" />}
        </ChatThread>
      )}
      <div className="px-3 pt-2 pb-3">
        <AskBox
          value={draft}
          onValueChange={setDraft}
          onSubmit={submit}
          placeholder={placeholder ?? `Ask ${title}`}
          suggestions={messages.length === 0 ? pills : undefined}
          dictation={dictation}
        />
      </div>
    </section>
  )
}

export { AssistantProvider, AssistantDock }
