"use client"

import * as React from "react"
import type { CategoryColor } from "@/components/admin/category"
import { MemberAvatar } from "@/components/admin/user-chip"
import { Markdown } from "@/components/ai/markdown"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface CommentThreadComment {
  id: string
  author: { name: string; color?: CategoryColor; avatarUrl?: string }
  /** Muted text after the name, e.g. "2 h ago" or "via HomeBot · 2 h ago". */
  meta?: React.ReactNode
  /** Markdown, rendered with `Markdown`. */
  body: string
}

export interface CommentThreadProps extends Omit<React.ComponentProps<"div">, "children" | "onSubmit"> {
  comments: CommentThreadComment[]
  /** Called with the trimmed text. The box then clears. */
  onSubmit: (text: string) => void
  /** Placeholder and accessible name of the box. Default "Add a comment". */
  placeholder?: string
  /** Default "Comment". */
  submitLabel?: string
}

/** Comments on a record, oldest first, with a box to add one. Bodies are Markdown. */
function CommentThread({
  comments,
  onSubmit,
  placeholder = "Add a comment",
  submitLabel = "Comment",
  className,
  ...props
}: CommentThreadProps) {
  const [text, setText] = React.useState("")
  return (
    <div data-slot="comment-thread" className={cn("flex flex-col gap-4", className)} {...props}>
      {comments.length > 0 && (
        <ul className="flex flex-col gap-4">
          {comments.map((c) => (
            <li key={c.id} className="flex min-w-0 items-start gap-3">
              <MemberAvatar
                size="sm"
                name={c.author.name}
                avatarUrl={c.author.avatarUrl}
                color={c.author.color}
                aria-hidden
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm">
                  <span className="font-medium">{c.author.name}</span>
                  {c.meta && <span className="text-xs text-muted-foreground"> · {c.meta}</span>}
                </p>
                <Markdown className="gap-2 text-sm leading-6">{c.body}</Markdown>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const value = text.trim()
          if (!value) return
          onSubmit(value)
          setText("")
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <Button type="submit" variant="outline" className="self-end pointer-coarse:h-11" disabled={!text.trim()}>
          {submitLabel}
        </Button>
      </form>
    </div>
  )
}

export { CommentThread }
