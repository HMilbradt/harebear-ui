"use client"

import { ArrowRightIcon, SquareIcon } from "lucide-react"
import * as React from "react"
import { TypingIndicator } from "@/components/ai/chat"
import { DictationButton, type SpeechSource } from "@/components/ai/dictation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AskBoxProps extends Omit<React.ComponentProps<"form">, "onSubmit" | "onChange"> {
  value: string
  onValueChange: (value: string) => void
  /** Called with the trimmed text on Enter or the send button. Shift+Enter inserts a newline. */
  onSubmit: (value: string) => void
  /** One per app, e.g. "Ask HomeBot anything". Also the field's accessible label. Default "Ask anything". */
  placeholder?: string
  /** Shown under the text while there is text, e.g. chips for the date or list it picked up. */
  chips?: React.ReactNode
  /** Pills under the box. Clicking one submits it (or calls onSuggestion). */
  suggestions?: string[]
  onSuggestion?: (suggestion: string) => void
  /** Speech source for the mic. Default the browser's; `false` hides the mic. */
  dictation?: SpeechSource | false
  /** BCP 47 language for dictation. */
  lang?: string
  disabled?: boolean
  autoFocus?: boolean
  /** The assistant is working: sending is blocked (unless `queue`) and, with `onStop`, the send button becomes Stop. */
  pending?: boolean
  /**
   * Allow sending while `pending`, so the app can queue a follow-up. Enter submits and the send button shows beside
   * Stop. Default false.
   */
  queue?: boolean
  /** Stops the assistant. Shown as a Stop button while `pending`. */
  onStop?: () => void
  /**
   * The answer, shown under the box (text, Prose, ActionReceipts). Passing it, even `null`, turns the reply area on:
   * while `pending` with no answer yet it shows a typing indicator. `useAssistant().reply` fits here.
   */
  reply?: React.ReactNode
  /** Link under the reply to continue in the full chat, labelled "Open chat". */
  chatHref?: string
}

const noSpeech: SpeechSource = { isSupported: () => false, start: () => () => {} }

/**
 * The large rounded input an assistant starts from: auto-growing text, chips while typing, suggestion pills and the
 * DictationButton (mic, stop, send). The focus ring is on the whole box. With `reply` the answer shows under the box;
 * with `pending` and `onStop` the send button becomes Stop (with `queue`, send stays beside it).
 */
function AskBox({
  value,
  onValueChange,
  onSubmit,
  placeholder = "Ask anything",
  chips,
  suggestions,
  onSuggestion,
  dictation,
  lang,
  disabled,
  autoFocus,
  pending,
  queue,
  onStop,
  reply,
  chatHref,
  className,
  ...props
}: AskBoxProps) {
  const id = React.useId()
  const submit = () => {
    const text = value.trim()
    if (!text || disabled || (pending && !queue)) return
    onSubmit(text)
    // The send button may unmount (Stop replaces it): keep focus in the field.
    document.getElementById(id)?.focus()
  }
  const hasText = value.trim().length > 0
  const hasReply = reply != null && reply !== false
  const showReply = hasReply || (pending && reply !== undefined)
  return (
    <form
      data-slot="ask-box"
      className={cn("flex w-full min-w-0 flex-col gap-3", className)}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      {...props}
    >
      <div className="focus-box flex flex-col gap-2 rounded-3xl border border-transparent bg-muted py-2.5 pr-2.5 pl-5">
        <div className="flex items-end gap-2">
          <label htmlFor={id} className="sr-only">
            {placeholder}
          </label>
          <textarea
            id={id}
            rows={1}
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
            className="field-sizing-content max-h-48 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground"
          />
          {pending && onStop && (
            <Button
              type="button"
              size="icon"
              shape="pill"
              className="size-10 shrink-0"
              aria-label="Stop"
              onClick={() => {
                onStop()
                document.getElementById(id)?.focus()
              }}
            >
              <SquareIcon className="size-3.5 fill-current" />
            </Button>
          )}
          {(!pending || !onStop || queue) && (
            <DictationButton
              value={value}
              disabled={disabled || (pending && !queue)}
              source={dictation === false ? noSpeech : dictation}
              lang={lang}
              onTranscript={(text) => onValueChange(value ? `${value.replace(/\s+$/, "")} ${text}` : text)}
            />
          )}
        </div>
        {hasText && chips && (
          <div data-slot="ask-box-chips" className="flex flex-wrap gap-1.5 pb-1">
            {chips}
          </div>
        )}
      </div>
      {showReply && (
        <div
          data-slot="ask-box-reply"
          aria-live="polite"
          aria-busy={pending || undefined}
          className="flex min-w-0 flex-col gap-3 px-2 text-[15px] leading-relaxed wrap-anywhere"
        >
          {hasReply ? reply : <TypingIndicator label="Working" />}
          {chatHref && (
            <Button asChild variant="link" className="self-start px-0 max-md:min-h-11">
              <a href={chatHref}>
                Open chat
                <ArrowRightIcon />
              </a>
            </Button>
          )}
        </div>
      )}
      {suggestions && suggestions.length > 0 && (
        <div data-slot="ask-box-suggestions" className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              shape="pill"
              disabled={disabled}
              onClick={() => (onSuggestion ? onSuggestion(s) : onSubmit(s))}
            >
              {s}
            </Button>
          ))}
        </div>
      )}
    </form>
  )
}

export { AskBox }
