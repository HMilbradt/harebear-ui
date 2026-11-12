"use client"

import type * as React from "react"
import { Prose } from "@/components/ai/code-block"
import { Markdown } from "@/components/ai/markdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface MarkdownEditorProps
  extends Omit<React.ComponentProps<"textarea">, "value" | "defaultValue" | "onChange"> {
  value: string
  onValueChange: (value: string) => void
  /** Custom Preview renderer; the result is wrapped in Prose. Default: the library's `Markdown`. */
  renderPreview?: (markdown: string) => React.ReactNode
  /** Classes for the wrapping Tabs. `className` goes to the textarea. */
  wrapperClassName?: string
}

/** Markdown field with Write and Preview tabs. Other props go to the Textarea (id, placeholder, aria-*). */
function MarkdownEditor({
  value,
  onValueChange,
  renderPreview,
  className,
  wrapperClassName,
  ...props
}: MarkdownEditorProps) {
  return (
    <Tabs data-slot="markdown-editor" defaultValue="write" className={cn("gap-3", wrapperClassName)}>
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn("min-h-48", className)}
          {...props}
        />
      </TabsContent>
      <TabsContent value="preview" className="min-h-48 rounded-md border px-3.5 py-3">
        {!value.trim() ? (
          <p className="text-sm text-muted-foreground">Nothing to preview.</p>
        ) : renderPreview ? (
          <Prose>{renderPreview(value)}</Prose>
        ) : (
          <Markdown>{value}</Markdown>
        )}
      </TabsContent>
    </Tabs>
  )
}

export { MarkdownEditor }
