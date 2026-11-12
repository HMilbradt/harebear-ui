"use client"

import { XIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "@/components/ui/check-circle"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface ChecklistEditorProps extends Omit<React.ComponentProps<"div">, "children" | "onToggle"> {
  items: ChecklistItem[]
  onToggle: (id: string, done: boolean) => void
  onRemove: (id: string) => void
  /** Called with the trimmed text when the add field is submitted with Enter. The field then clears. */
  onAdd: (text: string) => void
  /** Placeholder and accessible name of the add field. Default "Add an item". */
  addPlaceholder?: string
  /** Progress line above the items, shown when there are any. Default "2 of 5 done". */
  progressLabel?: (done: number, total: number) => React.ReactNode
}

const defaultProgress = (done: number, total: number) => `${done} of ${total} done`

/** Steps inside a record (a to-do's checklist): tick, remove, add with Enter, and an "x of y done" line. */
function ChecklistEditor({
  items,
  onToggle,
  onRemove,
  onAdd,
  addPlaceholder = "Add an item",
  progressLabel = defaultProgress,
  className,
  ...props
}: ChecklistEditorProps) {
  const [text, setText] = React.useState("")
  const id = React.useId()
  const done = items.filter((i) => i.done).length
  return (
    <div role="group" data-slot="checklist-editor" className={cn("flex flex-col gap-2", className)} {...props}>
      {items.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">{progressLabel(done, items.length)}</p>
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.id} className="flex min-w-0 items-start gap-3 py-1.5 ps-2">
                <CheckCircle
                  id={`${id}-${item.id}`}
                  className="mt-2"
                  checked={item.done}
                  onCheckedChange={(v) => onToggle(item.id, v === true)}
                />
                <label
                  htmlFor={`${id}-${item.id}`}
                  className={cn(
                    "min-w-0 flex-1 py-2 text-[15px] leading-6 wrap-anywhere",
                    item.done && "text-muted-foreground line-through decoration-muted-foreground/60",
                  )}
                >
                  {item.text}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="pointer-coarse:size-11"
                  aria-label={`Remove ${item.text}`}
                  onClick={() => onRemove(item.id)}
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const value = text.trim()
          if (!value) return
          onAdd(value)
          setText("")
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={addPlaceholder}
          aria-label={addPlaceholder}
          enterKeyHint="done"
        />
      </form>
    </div>
  )
}

export { ChecklistEditor }
