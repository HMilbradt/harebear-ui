"use client"

import { CheckIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ActionReceiptProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** What was done, past tense: "Added milk to Groceries". */
  title: React.ReactNode
  /** One line, e.g. "Groceries · just now". */
  meta?: React.ReactNode
  /** Shows an Undo button. */
  onUndo?: () => void
  /** Default "Undo". */
  undoLabel?: React.ReactNode
  /** After undo: the check goes away, the title is struck through and the button is replaced by "Undone". */
  undone?: boolean
}

/** A compact card for one action the assistant took on its own: round check, title, one meta line, Undo. */
function ActionReceipt({ title, meta, onUndo, undoLabel = "Undo", undone, className, ...props }: ActionReceiptProps) {
  return (
    <div
      data-slot="action-receipt"
      data-undone={undone || undefined}
      className={cn("flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full",
          undone ? "border-2 border-muted-foreground/40" : "bg-success text-card",
        )}
      >
        {!undone && <CheckIcon className="size-3.5" strokeWidth={3} />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-snug">
        <span className={cn("text-sm font-medium wrap-anywhere", undone && "text-muted-foreground line-through")}>
          {title}
        </span>
        {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
      </div>
      {undone ? (
        <span className="shrink-0 text-xs font-medium text-muted-foreground">Undone</span>
      ) : (
        onUndo && (
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onUndo}>
            {undoLabel}
          </Button>
        )
      )}
    </div>
  )
}

export { ActionReceipt }
