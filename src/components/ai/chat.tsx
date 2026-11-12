"use client"

import { CheckIcon, CopyIcon, RefreshCwIcon, SparklesIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"

export interface ChatThreadProps extends React.ComponentProps<"div"> {
  /** Keep scrolled to the bottom as content grows, unless the user scrolled up. Default true. */
  autoScroll?: boolean
  /** Classes for the centered inner column (max width 760px). */
  contentClassName?: string
}

/** Scrollable message column. Put ChatMessage children inside; give it a bounded height (flex-1 in a column). */
function ChatThread({ autoScroll = true, className, contentClassName, children, ...props }: ChatThreadProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const pinned = React.useRef(true)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !autoScroll) return
    const inner = el.firstElementChild
    const stick = () => {
      if (pinned.current) el.scrollTop = el.scrollHeight
    }
    stick()
    const ro = new ResizeObserver(stick)
    if (inner) ro.observe(inner)
    return () => ro.disconnect()
  }, [autoScroll])

  return (
    <div
      ref={ref}
      data-slot="chat-thread"
      role="log"
      aria-live="polite"
      onScroll={(e) => {
        const el = e.currentTarget
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
      }}
      className={cn("min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-2", className)}
      {...props}
    >
      <div className={cn("mx-auto flex max-w-190 flex-col gap-9", contentClassName)}>{children}</div>
    </div>
  )
}

export interface ChatMessageProps extends React.ComponentProps<"div"> {
  role: "user" | "assistant"
  /**
   * Assistant avatar. Defaults to a sparkle in a tinted circle. `false` renders no avatar and lets the content use
   * the full width, for agent threads where one turn is many blocks (text, tool groups, approvals).
   */
  avatar?: React.ReactNode | false
  /** Rendered under assistant content, usually <MessageActions />. */
  actions?: React.ReactNode
  /** User bubble color: "muted" (gray, default) or "soft" (tinted with the accent). */
  variant?: "muted" | "soft"
}

/** One chat turn. User: right-aligned bubble. Assistant: avatar + free-flowing content. */
function ChatMessage({ role, avatar, actions, variant = "muted", className, children, ...props }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div data-slot="chat-message" data-role="user" className={cn("flex justify-end", className)} {...props}>
        <div
          className={cn(
            "max-w-[80%] min-w-0 rounded-[calc(var(--radius-xl)*1.2)] rounded-br-sm px-4.5 py-3 text-[15px] whitespace-pre-wrap wrap-anywhere",
            variant === "soft" ? "bg-primary-soft" : "bg-muted",
          )}
        >
          {children}
        </div>
      </div>
    )
  }
  return (
    <div data-slot="chat-message" data-role="assistant" className={cn("flex items-start gap-4", className)} {...props}>
      {avatar === false ? null : (avatar ?? <AssistantAvatar />)}
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 wrap-anywhere">
        {children}
        {actions}
      </div>
    </div>
  )
}

/** Tinted circle with an icon. Default assistant avatar. */
function AssistantAvatar({ icon = <SparklesIcon />, className }: { icon?: React.ReactNode; className?: string }) {
  return (
    <div
      data-slot="assistant-avatar"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary [&_svg]:size-4",
        className,
      )}
    >
      {icon}
    </div>
  )
}

export interface MessageActionsProps extends React.ComponentProps<"div"> {
  /** Text copied by the copy button. Omit to hide it. */
  copyText?: string
  onRegenerate?: () => void
  onFeedback?: (value: "up" | "down") => void
  /** Currently selected feedback, for a pressed state. */
  feedback?: "up" | "down" | null
}

/** Copy / regenerate / thumbs row under an assistant message. Add more buttons as children. */
function MessageActions({
  copyText,
  onRegenerate,
  onFeedback,
  feedback,
  className,
  children,
  ...props
}: MessageActionsProps) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <div data-slot="message-actions" className={cn("-ml-2 flex gap-0.5", className)} {...props}>
      {copyText !== undefined && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Copy response" onClick={() => copy(copyText)}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      )}
      {onRegenerate && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Regenerate" onClick={onRegenerate}>
          <RefreshCwIcon />
        </Button>
      )}
      {onFeedback && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Good response"
            aria-pressed={feedback === "up"}
            className="aria-pressed:text-primary"
            onClick={() => onFeedback("up")}
          >
            <ThumbsUpIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Bad response"
            aria-pressed={feedback === "down"}
            className="aria-pressed:text-primary"
            onClick={() => onFeedback("down")}
          >
            <ThumbsDownIcon />
          </Button>
        </>
      )}
      {children}
    </div>
  )
}

export interface TypingIndicatorProps extends React.ComponentProps<"div"> {
  /** Text after the dots, e.g. "Working". Also used as the accessible label. */
  label?: React.ReactNode
  /** Dot color: "muted" (default) or "primary". */
  variant?: "muted" | "primary"
}

/** Three pulsing dots while the assistant is generating, with an optional label. */
function TypingIndicator({ label, variant = "muted", className, ...props }: TypingIndicatorProps) {
  return (
    <div
      data-slot="typing-indicator"
      role="status"
      aria-label={typeof label === "string" ? label : "Assistant is typing"}
      className={cn("flex items-center gap-2 py-1", className)}
      {...props}
    >
      <span className="flex gap-1.25">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className={cn(
              "inline-block size-1.5 animate-typing rounded-full",
              variant === "primary" ? "bg-primary" : "bg-muted-foreground",
            )}
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}

export interface ToolCallProps extends React.ComponentProps<typeof Badge> {
  /** "running" shows a spinner; "error" tints red. */
  status?: "running" | "done" | "error"
  icon?: React.ReactNode
}

/** Outlined chip summarizing a tool call, e.g. "Read 2 notes from homelab/". */
function ToolCall({ status = "done", icon, className, children, ...props }: ToolCallProps) {
  return (
    <Badge
      data-slot="tool-call"
      data-status={status}
      variant="outline"
      className={cn(
        "self-start bg-transparent text-muted-foreground",
        status === "error" && "border-destructive/40 text-destructive",
        className,
      )}
      {...props}
    >
      {status === "running" ? <Spinner /> : icon}
      {children}
    </Badge>
  )
}

export { ChatThread, ChatMessage, AssistantAvatar, MessageActions, TypingIndicator, ToolCall }
