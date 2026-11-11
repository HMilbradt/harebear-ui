"use client"

import * as React from "react"
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
}

const noSpeech: SpeechSource = { isSupported: () => false, start: () => () => {} }

/**
 * The large rounded input an assistant starts from: auto-growing text, chips while typing, suggestion pills and the
 * DictationButton (mic, stop, send). The focus ring is on the whole box.
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
  className,
  ...props
}: AskBoxProps) {
  const id = React.useId()
  const submit = () => {
    const text = value.trim()
    if (text && !disabled) onSubmit(text)
  }
  const hasText = value.trim().length > 0
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
          <DictationButton
            value={value}
            disabled={disabled}
            source={dictation === false ? noSpeech : dictation}
            lang={lang}
            onTranscript={(text) => onValueChange(value ? `${value.replace(/\s+$/, "")} ${text}` : text)}
          />
        </div>
        {hasText && chips && (
          <div data-slot="ask-box-chips" className="flex flex-wrap gap-1.5 pb-1">
            {chips}
          </div>
        )}
      </div>
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
