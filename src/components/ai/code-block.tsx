"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { CodeBlock, CodeBlockContent, CodeBlockHeader, CodeBlockLine, CodeBlockTitle } from "@/components/ui/code-block"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useHighlightedCode } from "@/hooks/use-highlighted-code"
import { cn } from "@/lib/utils"

export interface CodeSnippetProps extends Omit<React.ComponentProps<typeof CodeBlock>, "children"> {
  code: string
  /** Language for the label and syntax highlighting, e.g. "bash", "tsx". Unknown languages render plain. */
  language?: string
  /** Turn syntax highlighting off. Default on. */
  highlight?: boolean
  lineNumbers?: boolean
  /** Hide the copy button. */
  hideCopy?: boolean
}

/**
 * One-prop code panel: language label, copy button, shiki highlighting (loaded
 * lazily per language). Built on the CodeBlock primitives; use those directly
 * for diffs, highlighted lines, or custom headers.
 */
function CodeSnippet({
  code,
  language,
  highlight = true,
  lineNumbers,
  hideCopy,
  className,
  ...props
}: CodeSnippetProps) {
  const { copied, copy } = useCopyToClipboard()
  const lines = useHighlightedCode(code, highlight && language ? language : "text")
  return (
    <CodeBlock data-slot="code-snippet" className={className} {...props}>
      {(language || !hideCopy) && (
        <CodeBlockHeader className="min-h-10">
          <CodeBlockTitle className="font-mono text-xs text-muted-foreground">{language}</CodeBlockTitle>
          {!hideCopy && (
            <Button variant="ghost" size="sm" className="ms-auto" onClick={() => copy(code)} aria-label="Copy code">
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </CodeBlockHeader>
      )}
      <CodeBlockContent lineNumbers={lineNumbers} className="pb-4.5">
        {lines.map((line, i) => (
          <CodeBlockLine key={i}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
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

export { CodeSnippet, InlineCode, Prose }
