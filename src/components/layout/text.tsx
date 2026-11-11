"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export type TextTone = "default" | "muted" | "success" | "warning" | "danger" | "info"

const toneClass: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-primary",
}
const sizeClass = {
  xs: "text-xs",
  sm: "text-[13px]",
  base: "text-sm",
  lg: "text-base",
  xl: "text-xl",
  "2xl": "text-2xl",
} as const
const weightClass = { normal: "font-normal", medium: "font-medium", semibold: "font-semibold" } as const
const linesClass = { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3" } as const

export interface TextProps extends Omit<React.ComponentProps<"span">, "ref"> {
  size?: keyof typeof sizeClass
  tone?: TextTone
  weight?: keyof typeof weightClass
  mono?: boolean
  /** One line with an ellipsis. */
  truncate?: boolean
  /** Clamp to this many lines. */
  lines?: 1 | 2 | 3
  /** Fixed-width digits for numbers that update. */
  tabular?: boolean
  as?: "span" | "p" | "div"
}

/** Text with props instead of classes: size, tone, weight, mono, truncate, lines. */
function Text({
  size = "base",
  tone = "default",
  weight = "normal",
  mono,
  truncate,
  lines,
  tabular,
  as: As = "span",
  className,
  ...props
}: TextProps) {
  return (
    <As
      data-slot="text"
      className={cn(
        "min-w-0",
        sizeClass[size],
        toneClass[tone],
        weightClass[weight],
        mono && "font-mono",
        truncate && "block truncate",
        lines && linesClass[lines],
        tabular && "tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

export interface HeadingProps extends React.ComponentProps<"h3"> {
  /** 3: a section title in a card. 4: a small uppercase label over a group. */
  level?: 3 | 4
}

/** Section heading inside a card or panel. */
function Heading({ level = 3, className, ...props }: HeadingProps) {
  if (level === 4) {
    return (
      <h4
        data-slot="heading"
        className={cn("text-xs font-medium tracking-wide text-muted-foreground uppercase", className)}
        {...props}
      />
    )
  }
  return <h3 data-slot="heading" className={cn("text-sm font-semibold", className)} {...props} />
}

export { Text, Heading }
