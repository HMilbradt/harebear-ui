"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export type StackSpace = "none" | "xs" | "sm" | "md" | "lg" | "xl"
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline"
export type StackJustify = "start" | "center" | "end" | "between"

// Complete literal class strings so a consumer's Tailwind finds them.
const gapClass: Record<StackSpace, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
}
const alignClass: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
}
const justifyClass: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
}

export interface StackProps extends React.ComponentProps<"div"> {
  gap?: StackSpace
  align?: StackAlign
}

/** Vertical stack with a named gap. */
function Stack({ gap = "md", align = "stretch", className, ...props }: StackProps) {
  return (
    <div
      data-slot="stack"
      className={cn("flex min-w-0 flex-col", gapClass[gap], alignClass[align], className)}
      {...props}
    />
  )
}

export interface RowProps extends React.ComponentProps<"div"> {
  gap?: StackSpace
  align?: StackAlign
  justify?: StackJustify
  wrap?: boolean
}

/** Horizontal row with a named gap. */
function Row({ gap = "sm", align = "center", justify = "start", wrap, className, ...props }: RowProps) {
  return (
    <div
      data-slot="row"
      className={cn(
        "flex min-w-0",
        gapClass[gap],
        alignClass[align],
        justifyClass[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  )
}

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6
export type ResponsiveGridCols = GridCols | { base?: GridCols; sm?: GridCols; md?: GridCols; lg?: GridCols }

const cols = {
  base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" },
  viewport: {
    sm: {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      5: "sm:grid-cols-5",
      6: "sm:grid-cols-6",
    },
    md: {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
    },
    lg: {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
    },
  },
  container: {
    sm: {
      1: "@md:grid-cols-1",
      2: "@md:grid-cols-2",
      3: "@md:grid-cols-3",
      4: "@md:grid-cols-4",
      5: "@md:grid-cols-5",
      6: "@md:grid-cols-6",
    },
    md: {
      1: "@2xl:grid-cols-1",
      2: "@2xl:grid-cols-2",
      3: "@2xl:grid-cols-3",
      4: "@2xl:grid-cols-4",
      5: "@2xl:grid-cols-5",
      6: "@2xl:grid-cols-6",
    },
    lg: {
      1: "@4xl:grid-cols-1",
      2: "@4xl:grid-cols-2",
      3: "@4xl:grid-cols-3",
      4: "@4xl:grid-cols-4",
      5: "@4xl:grid-cols-5",
      6: "@4xl:grid-cols-6",
    },
  },
} as const

export interface GridProps extends React.ComponentProps<"div"> {
  /** Equal columns: a number, or per breakpoint `{ base: 1, sm: 2, md: 3 }`. */
  cols?: ResponsiveGridCols
  gap?: StackSpace
  /**
   * What sm/md/lg measure. "viewport" (default): the screen, Tailwind's sm/md/lg.
   * "container": the nearest `@container` ancestor (sm >= 28rem, md >= 42rem, lg >= 56rem),
   * for blocks that sit in cards of any width.
   */
  query?: "viewport" | "container"
}

/** Grid of equal columns with named gaps and per-breakpoint column counts. */
function Grid({ cols: c = 2, gap = "md", query = "viewport", className, ...props }: GridProps) {
  const r = typeof c === "number" ? { base: c } : c
  const q = cols[query]
  return (
    <div
      data-slot="grid"
      className={cn(
        "grid min-w-0",
        gapClass[gap],
        cols.base[r.base ?? 1],
        r.sm && q.sm[r.sm],
        r.md && q.md[r.md],
        r.lg && q.lg[r.lg],
        className,
      )}
      {...props}
    />
  )
}

export { Stack, Row, Grid }
