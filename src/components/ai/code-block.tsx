"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"

export interface CodeBlockProps extends Omit<React.ComponentProps<"div">, "children"> {
  code: string
  /** Label shown top-left, e.g. "bash". */
  language?: string
  /** Pre-highlighted content (e.g. from shiki). Falls back to plain `code`. */
  children?: React.ReactNode
  /** Hide the copy button. */
  hideCopy?: boolean
}

/** Code panel with language label and copy button. No highlighter bundled; pass highlighted children if you have one. */
function CodeBlock({ code, language, children, hideCopy, className, ...props }: CodeBlockProps) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <div data-slot="code-block" className={cn("overflow-hidden rounded-lg bg-muted", className)} {...props}>
      <div className="flex min-h-10 items-center justify-between pt-2 pr-2 pl-4.5">
        <span className="font-mono text-xs font-medium text-muted-foreground">{language}</span>
        {!hideCopy && (
          <Button variant="ghost" size="sm" onClick={() => copy(code)} aria-label="Copy code">
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      <pre className="m-0 overflow-x-auto px-4.5 pt-1 pb-4.5 font-mono text-[13px] leading-[1.7]">
        <code>{children ?? code}</code>
      </pre>
    </div>
  )
}

/** Inline monospace span for commands and identifiers. */
function InlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="inline-code"
      className={cn("rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[12.5px]", className)}
      {...props}
    />
  )
}

/**
 * Typography for long-form and model output. Styles plain HTML children
 * (p, ul, ol, li, strong, a, code, pre, h1-h4, blockquote, table), so it works
 * with react-markdown or any HTML renderer.
 */
function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prose"
      className={cn(
        "flex flex-col gap-3.5 text-[15px] leading-[1.65] text-foreground",
        "[&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5.5",
        "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5.5",
        "[&_strong]:font-semibold [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline",
        "[&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_h4]:font-semibold",
        "[&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_:not(pre)>code]:rounded-[6px] [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[12.5px]",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4.5 [&_pre]:font-mono [&_pre]:text-[13px]",
        "[&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:py-2 [&_th]:border-b [&_th]:py-2 [&_th]:text-left [&_th]:font-medium",
        className,
      )}
      {...props}
    />
  )
}

export { CodeBlock, InlineCode, Prose }
