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
        <span className="min-w-0 flex-1 font-medium wrap-anywhere">{title}</span>
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
  /** Short verb column, e.g. "Run", "Read", "Edit". With an empty `detail` it is the whole label, e.g. "Added milk". */
  kind: React.ReactNode
  /** What it acted on, shown monospace: the command or path. Empty for a plain-language step. */
  detail: string
  status: ToolStatus
  /** Trailing text. Default derived from status ("running", "failed"…). */
  meta?: React.ReactNode
  /** Shown when expanded, monospace: usually the command followed by its output. Omit for a row that cannot expand. */
  output?: React.ReactNode
  /** Open while true, until the user toggles it. Default: open while running. */
  autoOpen?: boolean
  /**
   * What the step acted on, listed under its row, e.g. the to-dos it read or the list it changed. An item with `href`
   * renders through `linkComponent`, one with `onSelect` as a link-styled button, others as plain text. The first 5
   * show; a "Show N more" button shows the rest.
   */
  items?: ToolStepItem[]
  /** Component for item links, e.g. Next.js or React Router Link. Gets `href`. Default `a`. */
  linkComponent?: React.ElementType
}

export interface ToolStepItem {
  id: string
  label: React.ReactNode
  href?: string
  onSelect?: () => void
}

const statusText: Record<ToolStatus, string> = {
  queued: "queued",
  waiting: "waiting for you",
  running: "running",
  done: "done",
  error: "failed",
  stopped: "stopped",
}

const ITEMS_SHOWN = 5
const itemLink =
  "rounded-sm text-left text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center"

/** The things a step acted on: links, buttons or plain names, the first few shown. */
function ToolStepItems({
  items,
  linkComponent: Link = "a",
  indent,
}: {
  items: ToolStepItem[]
  linkComponent?: React.ElementType
  indent: boolean
}) {
  const [all, setAll] = React.useState(false)
  const shown = all ? items : items.slice(0, ITEMS_SHOWN)
  const hidden = items.length - shown.length
  return (
    <div
      data-slot="tool-step-items"
      className={cn("mr-2.5 mb-1.5 flex flex-col gap-1 text-[13px]", indent ? "ml-11.5" : "ml-2.5")}
    >
      <ul className="flex flex-col gap-1">
        {shown.map((item) => (
          <li key={item.id} className="min-w-0 wrap-anywhere">
            {item.href !== undefined ? (
              <Link href={item.href} className={itemLink}>
                {item.label}
              </Link>
            ) : item.onSelect ? (
              <button type="button" onClick={item.onSelect} className={itemLink}>
                {item.label}
              </button>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="self-start rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 pointer-coarse:min-h-11"
        >
          Show {hidden} more
        </button>
      )}
    </div>
  )
}

/** One tool call inside a ToolGroup: icon, verb, monospace detail, status text, expandable output, items. */
function ToolStep({
  icon,
  kind,
  detail,
  status,
  meta,
  output,
  autoOpen,
  items,
  linkComponent,
  className,
  ...props
}: ToolStepProps) {
  const [open, setOpen] = useAutoOpen(autoOpen ?? status === "running")
  const expandable = output !== undefined && output !== null && output !== ""
  const list = items && items.length > 0 && (
    <ToolStepItems items={items} linkComponent={linkComponent} indent={Boolean(icon)} />
  )
  const row = (
    <>
      {icon && (
        <span className="grid size-6.5 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-3.5">
          {icon}
        </span>
      )}
      <span
        data-slot="tool-step-kind"
        className={cn(
          "text-[13px] text-muted-foreground wrap-anywhere",
          detail ? "w-18 shrink-0" : "min-w-0 flex-1 text-foreground",
        )}
      >
        {kind}
      </span>
      {detail && <span className="min-w-0 flex-1 font-mono text-[12.5px] wrap-anywhere">{detail}</span>}
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
    if (!list) {
      return (
        <div data-slot="tool-step" data-status={status} className={cn(rowClass, className)} {...props}>
          {row}
          <span className="size-4 shrink-0" />
        </div>
      )
    }
    return (
      <div data-slot="tool-step" data-status={status} className={className} {...props}>
        <div className={rowClass}>
          {row}
          <span className="size-4 shrink-0" />
        </div>
        {list}
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
      {list}
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
