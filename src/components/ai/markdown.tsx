"use client"

import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prose, ProseBlockquote } from "@/components/ai/code-block"

export interface MarkdownProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The Markdown source. GitHub flavoured (tables, task lists, strikethrough, autolinks). Raw HTML is dropped. */
  children: string
  /** Component for in-app links (href without a scheme, e.g. "/lists/2"), e.g. Next.js or React Router Link. Gets `href`. */
  linkComponent?: React.ElementType
}

const plugins = [remarkGfm]
const SCHEME = /^([a-z][a-z\d+.-]*:|\/\/)/i

/**
 * Renders Markdown safely inside Prose: no raw HTML, unsafe URLs (javascript:) removed, `> Tip:` blockquotes as
 * a Callout. Other props go to the Prose wrapper.
 */
function Markdown({ children, linkComponent: Link, ...props }: MarkdownProps) {
  const components = React.useMemo<Components>(
    () => ({
      blockquote: ProseBlockquote,
      a: ({ node: _node, href = "", ...rest }) =>
        Link && !SCHEME.test(href) ? <Link href={href} {...rest} /> : <a href={href} {...rest} />,
      // GFM task list boxes are read only; give them a name so they are not unlabeled form fields.
      input: ({ node: _node, checked, ...rest }) => (
        <input {...rest} checked={checked} aria-label={checked ? "Done" : "Not done"} />
      ),
    }),
    [Link],
  )
  return (
    <Prose data-slot="markdown" {...props}>
      <ReactMarkdown remarkPlugins={plugins} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </Prose>
  )
}

export { Markdown }
