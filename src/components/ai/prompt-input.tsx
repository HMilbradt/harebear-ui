"use client"

import { ArrowUpIcon, PaperclipIcon, SquareIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PromptInputProps extends Omit<React.ComponentProps<"form">, "onSubmit" | "onChange"> {
  value: string
  onValueChange: (value: string) => void
  /** Called with the trimmed text on Enter or the send button. Shift+Enter inserts a newline. */
  onSubmit: (value: string) => void
  placeholder?: string
  /** While true, the send button becomes a stop button. */
  loading?: boolean
  onStop?: () => void
  /** Shows a paperclip button. */
  onAttach?: () => void
  /** Chips/toggles between the attach and send buttons, e.g. <PromptInputChip>. */
  tools?: React.ReactNode
  /** Small text under the box, e.g. a disclaimer. */
  footer?: React.ReactNode
  disabled?: boolean
  autoFocus?: boolean
}

/** Chat composer: auto-growing textarea with attach, tool chips, and send/stop. */
function PromptInput({
  value,
  onValueChange,
  onSubmit,
  placeholder = "Send a message…",
  loading,
  onStop,
  onAttach,
  tools,
  footer,
  disabled,
  autoFocus,
  className,
  ...props
}: PromptInputProps) {
  const id = React.useId()
  const canSend = value.trim().length > 0 && !disabled
  const submit = () => {
    if (canSend && !loading) onSubmit(value.trim())
  }
  return (
    <form
      data-slot="prompt-input"
      className={cn("mx-auto flex w-full max-w-190 flex-col gap-2.5", className)}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      {...props}
    >
      <div className="flex flex-col gap-2 rounded-[calc(var(--radius-xl)*1.2)] bg-muted pt-3 pr-3 pb-2.5 pl-3.5 transition-shadow focus-within:ring-4 focus-within:ring-primary/12">
        <label htmlFor={id} className="sr-only">
          Message
        </label>
        <textarea
          id={id}
          rows={2}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          className="field-sizing-content max-h-60 min-h-13 w-full resize-none border-0 bg-transparent px-1.5 py-1 text-[15px] leading-normal text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1.5">
          {onAttach && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              shape="pill"
              aria-label="Attach file"
              onClick={onAttach}
            >
              <PaperclipIcon />
            </Button>
          )}
          {tools}
          <div className="flex-1" />
          {loading && onStop ? (
            <Button
              type="button"
              size="icon"
              shape="pill"
              className="size-9"
              aria-label="Stop generating"
              onClick={onStop}
            >
              <SquareIcon className="fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              shape="pill"
              className="size-9"
              aria-label="Send message"
              disabled={!canSend || loading}
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </div>
      {footer && <p className="text-center text-xs text-muted-foreground">{footer}</p>}
    </form>
  )
}

/** Toggleable pill for the composer toolbar (web search, a knowledge source…). */
function PromptInputChip({ active, className, ...props }: React.ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      type="button"
      size="sm"
      shape="pill"
      variant={active ? "soft" : "outline"}
      aria-pressed={active}
      className={cn("h-8", className)}
      {...props}
    />
  )
}

export { PromptInput, PromptInputChip }
