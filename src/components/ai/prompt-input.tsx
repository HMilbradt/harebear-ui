"use client"

import { ArrowUpIcon, ChevronDownIcon, PaperclipIcon, SquareIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export interface PromptInputChipProps extends React.ComponentProps<typeof Button> {
  active?: boolean
  /** "warning" outlines the chip in the warning color, e.g. for a risky mode that is on. */
  tone?: "default" | "warning"
}

const chipClass = (tone: "default" | "warning") =>
  cn("h-8", tone === "warning" && "border-warning/50 bg-transparent text-warning")

/** Toggleable pill for the composer toolbar (web search, a knowledge source…). */
function PromptInputChip({ active, tone = "default", className, ...props }: PromptInputChipProps) {
  return (
    <Button
      type="button"
      size="sm"
      shape="pill"
      variant={active ? "soft" : "outline"}
      aria-pressed={active}
      data-tone={tone}
      className={cn(chipClass(tone), className)}
      {...props}
    />
  )
}

export interface PromptInputSelectOption {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  /** "warning" shows the chip in the warning color while this option is selected. */
  tone?: "default" | "warning"
}

export interface PromptInputSelectProps {
  options: PromptInputSelectOption[]
  value: string
  onValueChange: (value: string) => void
  /** Heading inside the menu, e.g. "Permissions for this conversation". */
  label?: React.ReactNode
  disabled?: boolean
  /** Tooltip text on the chip. */
  title?: string
  className?: string
}

/** Composer chip that picks one of a few modes, each with an icon and a one-line description. */
function PromptInputSelect({
  options,
  value,
  onValueChange,
  label,
  disabled,
  title,
  className,
}: PromptInputSelectProps) {
  const current = options.find((o) => o.value === value) ?? options[0]
  const tone = current?.tone ?? "default"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          size="sm"
          shape="pill"
          variant={tone === "warning" ? "outline" : "soft"}
          data-slot="prompt-input-select"
          data-tone={tone}
          title={title}
          className={cn(chipClass(tone), className)}
        >
          {current?.icon}
          {current?.label}
          <ChevronDownIcon className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value} className="items-start py-2">
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">{o.label}</span>
                {o.description && <span className="text-xs text-muted-foreground">{o.description}</span>}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { PromptInput, PromptInputChip, PromptInputSelect }
