"use client"

import { ArrowUpIcon, MicIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SpeechSourceHandlers {
  /** Recognised text. `final` is false for interim guesses that may still change. */
  onResult: (text: string, final: boolean) => void
  /** Listening stopped (silence, stop(), or an error). */
  onEnd: () => void
  onError: (error: string) => void
}

/**
 * Where dictation comes from. The default is `browserSpeechSource` (the Web Speech API); pass your own to use a
 * server model: start recording in `start`, call the handlers, and return a function that stops.
 */
export interface SpeechSource {
  isSupported: () => boolean
  start: (handlers: SpeechSourceHandlers, options: { lang?: string }) => () => void
}

// Minimal Web Speech API types (not in the DOM lib).
interface RecognitionResultEvent {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}
interface Recognition {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: RecognitionResultEvent) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start: () => void
  stop: () => void
}
type RecognitionCtor = new () => Recognition

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

/** SpeechSource on the browser's SpeechRecognition API. Unsupported (Firefox, most WebViews) means no mic button. */
export const browserSpeechSource: SpeechSource = {
  isSupported: () => recognitionCtor() !== undefined,
  start(handlers, { lang }) {
    const Ctor = recognitionCtor()
    if (!Ctor) {
      handlers.onError("not-supported")
      handlers.onEnd()
      return () => {}
    }
    const rec = new Ctor()
    if (lang) rec.lang = lang
    rec.interimResults = true
    rec.continuous = false
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r) handlers.onResult(r[0].transcript, r.isFinal)
      }
    }
    rec.onerror = (e) => handlers.onError(e.error)
    rec.onend = () => handlers.onEnd()
    rec.start()
    return () => rec.stop()
  },
}

export interface UseDictationOptions {
  /** Default browserSpeechSource. */
  source?: SpeechSource
  /** BCP 47 language, e.g. "en-CA". Default: the browser's. */
  lang?: string
  /** Called with each final transcript. */
  onTranscript: (text: string) => void
}

const noopSubscribe = () => () => {}

/** Dictation state for a custom control: `{ supported, listening, interim, error, start, stop }`. */
export function useDictation({ source = browserSpeechSource, lang, onTranscript }: UseDictationOptions) {
  const supported = React.useSyncExternalStore(noopSubscribe, source.isSupported, () => false)
  const [listening, setListening] = React.useState(false)
  const [interim, setInterim] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const stopRef = React.useRef<(() => void) | null>(null)
  const onTranscriptRef = React.useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  const stop = React.useCallback(() => {
    stopRef.current?.()
  }, [])
  const start = React.useCallback(() => {
    if (stopRef.current) return
    setError(null)
    setInterim("")
    setListening(true)
    stopRef.current = source.start(
      {
        onResult: (text, final) => {
          if (final) {
            setInterim("")
            onTranscriptRef.current(text.trim())
          } else setInterim(text)
        },
        onError: (e) => setError(e),
        onEnd: () => {
          stopRef.current = null
          setInterim("")
          setListening(false)
        },
      },
      { lang },
    )
  }, [source, lang])
  React.useEffect(() => () => stopRef.current?.(), [])

  return { supported, listening, interim, error, start, stop }
}

export interface DictationButtonProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  /** The composer's current text. Empty shows the mic; text shows send. */
  value: string
  /** Final transcripts, to append to the text. */
  onTranscript: (text: string) => void
  /** Send. Without it, the send button is a submit button for the surrounding form. */
  onSend?: () => void
  source?: SpeechSource
  lang?: string
  disabled?: boolean
  /** Default "Send message". */
  sendLabel?: string
}

/**
 * One round button for a composer: a mic when empty, stop (with listening bars) while listening, send once there is
 * text. Announces "Listening" in a polite live region. Without a supported speech source the mic is hidden and the
 * button is just send.
 */
function DictationButton({
  value,
  onTranscript,
  onSend,
  source,
  lang,
  disabled,
  sendLabel = "Send message",
  className,
  ...props
}: DictationButtonProps) {
  const d = useDictation({ source, lang, onTranscript })
  const hasText = value.trim().length > 0
  return (
    <div data-slot="dictation-button" className={cn("flex shrink-0 items-center", className)} {...props}>
      <span role="status" aria-live="polite" className="sr-only">
        {d.listening ? "Listening" : ""}
      </span>
      {d.listening ? (
        <Button
          type="button"
          size="icon"
          shape="pill"
          className="size-10 gap-0.5"
          aria-label="Stop dictation"
          onClick={d.stop}
        >
          <ListeningBars />
        </Button>
      ) : !hasText && d.supported ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          shape="pill"
          className="size-10"
          aria-label="Dictate"
          disabled={disabled}
          onClick={d.start}
        >
          <MicIcon />
        </Button>
      ) : (
        <Button
          type={onSend ? "button" : "submit"}
          size="icon"
          shape="pill"
          className="size-10"
          aria-label={sendLabel}
          disabled={disabled || !hasText}
          onClick={onSend}
        >
          <ArrowUpIcon />
        </Button>
      )}
    </div>
  )
}

function ListeningBars() {
  return (
    <span aria-hidden="true" className="flex h-4 items-center gap-0.5">
      {[0, 150, 300, 450].map((delay) => (
        <span
          key={delay}
          className="h-full w-0.75 origin-center animate-listening rounded-full bg-current motion-reduce:scale-y-75"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

export { DictationButton }
