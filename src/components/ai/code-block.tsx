"use client"

import { CheckIcon, CopyIcon, LightbulbIcon } from "lucide-react"
import * as React from "react"
import { Callout } from "@/components/admin/callout"
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ms-auto"
              onClick={() => copy(code)}
              aria-label="Copy code"
            >
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
export interface InlineCodeProps extends React.ComponentProps<"code"> {
  /** Cut string children longer than this many characters with an ellipsis; the full text becomes the tooltip. */
  truncate?: number
}

function InlineCode({ truncate, className, children, title, ...props }: InlineCodeProps) {
  const cut = truncate !== undefined && typeof children === "string" && children.length > truncate
  return (
    <code
      data-slot="inline-code"
      title={title ?? (cut ? (children as string) : undefined)}
      className={cn("rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[12.5px]", className)}
      {...props}
    >
      {cut ? `${(children as string).slice(0, truncate)}…` : children}
    </code>
  )
}

const TIP = /^\s*Tip:\s*/

/** The children with a leading "Tip:" removed, or undefined when they do not start with it. */
function withoutTip(children: React.ReactNode): React.ReactNode | undefined {
  const items = React.Children.toArray(children)
  const i = items.findIndex((c) => !(typeof c === "string" && c.trim() === ""))
  const first = items[i]
  let rest: React.ReactNode
  if (typeof first === "string") {
    if (!TIP.test(first)) return undefined
    rest = first.replace(TIP, "")
  } else if (React.isValidElement<{ children?: React.ReactNode }>(first) && typeof first.type === "string") {
    const inner = withoutTip(first.props.children)
    if (inner === undefined) return undefined
    rest = React.cloneElement(first, undefined, inner)
  } else {
    return undefined
  }
  return [...items.slice(0, i), rest, ...items.slice(i + 1)]
}

/**
 * A blockquote that becomes a `Callout` when its first word is "Tip:" (the word is dropped).
 * Prose applies it to blockquote children; pass it to react-markdown as `components={{ blockquote: ProseBlockquote }}`.
 */
function ProseBlockquote({ children, node: _node, ...props }: React.ComponentProps<"blockquote"> & { node?: unknown }) {
  const tip = withoutTip(children)
  if (tip === undefined) return <blockquote {...props}>{children}</blockquote>
  return (
    <Callout data-tip="" icon={<LightbulbIcon />} className={props.className}>
      {tip}
    </Callout>
  )
}

/** Swaps plain blockquote elements for ProseBlockquote, at any depth of plain HTML elements. */
function withTips(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (c) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(c) || typeof c.type !== "string") return c
    if (c.type === "blockquote") return <ProseBlockquote {...(c.props as React.ComponentProps<"blockquote">)} />
    return c.props.children === undefined ? c : React.cloneElement(c, undefined, withTips(c.props.children))
  })
}

/**
 * Typography for long-form and model output. Styles plain HTML children
 * (p, ul, ol, li, strong, a, code, pre, h1-h4, blockquote, table), so it works
 * with react-markdown or any HTML renderer. A blockquote starting "Tip:" renders as a Callout.
 */
function Prose({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prose"
      className={cn(
        "flex min-w-0 flex-col gap-3.5 text-[15px] leading-[1.65] wrap-anywhere text-foreground",
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
    >
      {withTips(children)}
    </div>
  )
}

export { CodeSnippet, InlineCode, Prose, ProseBlockquote }
