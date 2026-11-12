"use client"

import * as React from "react"
import { Heading } from "@/components/layout/text"
import { cn } from "@/lib/utils"

export interface PageProps extends React.ComponentProps<"div"> {
  /** Column width. Default "md" (42rem), like FocusLayout. */
  width?: "sm" | "md" | "lg"
}

const widthClass = { sm: "max-w-xl", md: "max-w-2xl", lg: "max-w-4xl" } as const

/** The page column inside AppNav or SidebarLayout: centred, 16px gutters on phones, children spaced like sections. */
function Page({ width = "md", className, ...props }: PageProps) {
  return (
    <div
      data-slot="page"
      className={cn("mx-auto flex w-full flex-col gap-7 px-4 py-6 md:px-8 md:py-10", widthClass[width], className)}
      {...props}
    />
  )
}

export interface PageSectionProps extends Omit<React.ComponentProps<"section">, "title"> {
  /** The section's h2, which also names the region. */
  title: React.ReactNode
  /** At the right of the heading, e.g. a small ghost Button "See all". */
  action?: React.ReactNode
}

/** A titled part of a page: a region named by its h2 (under the PageHeader h1), an optional action, then children. */
function PageSection({ title, action, className, children, ...props }: PageSectionProps) {
  const id = React.useId()
  return (
    <section
      data-slot="page-section"
      aria-labelledby={id}
      className={cn("flex min-w-0 flex-col gap-3", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Heading level={2} id={id} className="min-w-0 flex-1">
          {title}
        </Heading>
        {action && <div className="flex shrink-0 items-center pointer-coarse:[&>*]:min-h-11">{action}</div>}
      </div>
      {children}
    </section>
  )
}

export { Page, PageSection }
