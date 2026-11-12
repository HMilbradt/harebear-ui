"use client"

import { CheckIcon, ShieldAlertIcon, XIcon } from "lucide-react"
import * as React from "react"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { cn } from "@/lib/utils"

export interface ApprovalCardProps extends Omit<React.ComponentProps<"section">, "title"> {
  /** e.g. "Approval needed: run a command on services". */
  title: React.ReactNode
  /** Small line under the title, e.g. the permission mode and when it was asked. */
  description?: React.ReactNode
  /** Leading icon in a warning-tinted circle. Default a shield. Pass null for none. */
  icon?: React.ReactNode
  /** The exact command or change, shown in a wrapped code block with a copy button. */
  code?: string
  /** Label above the code, e.g. "bash". */
  codeLabel?: React.ReactNode
  /** The choices, usually Buttons: approve, approve for the session, deny. */
  actions?: React.ReactNode
  /** Small print under the actions. */
  footer?: React.ReactNode
  /** Why the agent wants this, shown first in the body after a bold "Why:". */
  reason?: React.ReactNode
}

/**
 * Highlighted card for anything the agent is waiting on the user for: a tool approval, a question, a choice.
 * Body text goes in children (e.g. the agent's reason).
 */
function ApprovalCard({
  title,
  description,
  icon = <ShieldAlertIcon />,
  code,
  codeLabel,
  actions,
  footer,
  reason,
  className,
  children,
  ...props
}: ApprovalCardProps) {
  const id = React.useId()
  return (
    <section
      data-slot="approval-card"
      aria-labelledby={id}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border border-warning/50 bg-card px-5.5 py-5 ring-4 ring-warning/10",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid size-8.5 shrink-0 place-items-center rounded-full bg-warning/12 text-warning [&_svg]:size-4.5">
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col leading-snug">
          <h2 id={id} className="text-[15px] font-semibold whitespace-pre-wrap wrap-anywhere">
            {title}
          </h2>
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      </div>
      {(reason || children) && (
        <div className="text-[14.5px] leading-relaxed whitespace-pre-wrap wrap-anywhere [&_strong]:font-semibold">
          {reason && (
            <p>
              <strong>Why: </strong>
              {reason}
            </p>
          )}
          {reason && children ? <div className="mt-2">{children}</div> : children}
        </div>
      )}
      {code !== undefined && (
        <CodeBlock>
          <CodeBlockHeader>
            <CodeBlockTitle>{codeLabel ?? "command"}</CodeBlockTitle>
            <CodeBlockActions>
              <CodeBlockCopyButton value={code} />
            </CodeBlockActions>
          </CodeBlockHeader>
          <CodeBlockContent wrap>{code}</CodeBlockContent>
        </CodeBlock>
      )}
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      {footer && <div className="text-xs text-muted-foreground wrap-anywhere">{footer}</div>}
    </section>
  )
}

export interface ApprovalResultProps extends React.ComponentProps<"div"> {
  decision: "approved" | "denied"
  /** Trailing time, e.g. "10:42". */
  time?: React.ReactNode
}

/** Short record of a decision in the thread, e.g. "You approved `docker restart x`, once". */
function ApprovalResult({ decision, time, className, children, ...props }: ApprovalResultProps) {
  const denied = decision === "denied"
  return (
    <div
      data-slot="approval-result"
      data-decision={decision}
      className={cn("flex min-w-0 items-center gap-2.5 px-1 text-[13px]", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-6.5 shrink-0 place-items-center rounded-full [&_svg]:size-3.5",
          denied ? "bg-muted text-muted-foreground" : "bg-success/12 text-success",
        )}
      >
        {denied ? <XIcon /> : <CheckIcon />}
      </span>
      <span className="min-w-0 flex-1 wrap-anywhere">{children}</span>
      {time && <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{time}</span>}
    </div>
  )
}

export { ApprovalCard, ApprovalResult }
