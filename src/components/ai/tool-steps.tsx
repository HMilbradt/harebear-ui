"use client"

import { ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { StatusDot, type StatusTone } from "@/components/admin/status"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/** Lifecycle of an agent tool call. "waiting" means waiting for the user (an approval). */
export type ToolStatus = "queued" | "waiting" | "running" | "done" | "error" | "stopped"

const toolTone: Record<ToolStatus, StatusTone> = {
  queued: "neutral",
  waiting: "warning",
  running: "info",
  done: "success",
  error: "danger",
  stopped: "neutral",
}

/** Spinner while running, otherwise a status dot in the matching tone. */
function ToolStatusIcon({ status, className }: { status: ToolStatus; className?: string }) {
  return status === "running" ? (
    <Spinner data-slot="tool-status-icon" className={cn("size-3.5 text-primary", className)} />
  ) : (
    <StatusDot data-slot="tool-status-icon" tone={toolTone[status]} className={className} />
  )
}

/** Open state that follows `auto` until the user toggles it, then sticks with the user's choice. */
function useAutoOpen(auto: boolean, open?: boolean, onOpenChange?: (open: boolean) => void) {
  const [chosen, setChosen] = React.useState<boolean | null>(null)
  const value = open ?? chosen ?? auto
  const set = (next: boolean) => {
    setChosen(next)
    onOpenChange?.(next)
  }
  return [value, set] as const
}

const isActive = (s: ToolStatus) => s === "running" || s === "waiting" || s === "queued"

export interface ToolGroupProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Summary, e.g. "Ran 3 commands on services". */
  title: React.ReactNode
  /** Overall status of the steps inside. */
  status: ToolStatus
  /** Small trailing text, e.g. the start time. */
  meta?: React.ReactNode
  /** Open while true, until the user toggles it. Default: open while the group is queued, running or waiting. */
  autoOpen?: boolean
  /** Controlled open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** Bordered, collapsible card that groups an agent's consecutive tool calls. Put ToolStep children inside. */
function ToolGroup({
  title,
  status,
  meta,
  autoOpen,
  open: openProp,
  onOpenChange,
  className,
  children,
  ...props
}: ToolGroupProps) {
  const [open, setOpen] = useAutoOpen(autoOpen ?? isActive(status), openProp, onOpenChange)
  return (
    <Collapsible
      data-slot="tool-group"
      data-status={status}
      open={open}
      onOpenChange={setOpen}
      className={cn("min-w-0 rounded-lg border border-border bg-card", className)}
      {...props}
    >
      <CollapsibleTrigger className="flex w-full min-w-0 items-center gap-2.5 rounded-lg px-4 py-2.75 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40">
        <ChevronRightIcon
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
        />
        <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
        {meta !== undefined && <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{meta}</span>}
        <ToolStatusIcon status={status} />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-0.5 px-2 pb-2">{children}</CollapsibleContent>
    </Collapsible>
  )
}

export interface ToolStepProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Tool icon, e.g. <TerminalIcon />. */
  icon?: React.ReactNode
  /** Short verb column, e.g. "Run", "Read", "Edit". */
  kind: React.ReactNode
  /** What it acted on, shown monospace: the command or path. */
  detail: string
  status: ToolStatus
  /** Trailing text. Default derived from status ("running", "failed"…). */
  meta?: React.ReactNode
  /** Shown when expanded, monospace: usually the command followed by its output. Omit for a row that cannot expand. */
  output?: React.ReactNode
  /** Open while true, until the user toggles it. Default: open while running. */
  autoOpen?: boolean
}

const statusText: Record<ToolStatus, string> = {
  queued: "queued",
  waiting: "waiting for you",
  running: "running",
  done: "done",
  error: "failed",
  stopped: "stopped",
}

/** One tool call inside a ToolGroup: icon, verb, monospace detail, status text, expandable output. */
function ToolStep({ icon, kind, detail, status, meta, output, autoOpen, className, ...props }: ToolStepProps) {
  const [open, setOpen] = useAutoOpen(autoOpen ?? status === "running")
  const expandable = output !== undefined && output !== null && output !== ""
  const row = (
    <>
      {icon && (
        <span className="grid size-6.5 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-3.5">
          {icon}
        </span>
      )}
      <span className="w-18 shrink-0 truncate text-[13px] text-muted-foreground">{kind}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{detail}</span>
      <span
        className={cn(
          "shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums",
          status === "error" && "text-destructive",
          status === "waiting" && "text-warning",
        )}
      >
        {meta ?? statusText[status]}
      </span>
    </>
  )
  const rowClass = "flex w-full min-w-0 items-center gap-2.5 rounded-md px-2.5 py-1.75 text-left"
  if (!expandable) {
    return (
      <div data-slot="tool-step" data-status={status} className={cn(rowClass, className)} {...props}>
        {row}
        <span className="size-4 shrink-0" />
      </div>
    )
  }
  return (
    <Collapsible
      data-slot="tool-step"
      data-status={status}
      open={open}
      onOpenChange={setOpen}
      className={className}
      {...props}
    >
      <CollapsibleTrigger
        className={cn(rowClass, "outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40")}
      >
        {row}
        <ChevronRightIcon
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre
          className={cn(
            "mt-0.5 mr-2.5 mb-2 max-h-80 overflow-auto rounded-md bg-muted px-3.5 py-3 font-mono text-[12.5px] leading-[1.7] whitespace-pre-wrap break-all",
            icon ? "ml-11.5" : "ml-2.5",
          )}
        >
          {output}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}

export { ToolGroup, ToolStep, ToolStatusIcon }
