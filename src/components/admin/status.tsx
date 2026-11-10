"use client"

import type * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

const toneColor: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-primary",
  neutral: "bg-muted-foreground",
}

export interface StatusDotProps extends React.ComponentProps<"span"> {
  tone?: StatusTone
  /** Pulse the dot, for live states like "working" or "connecting". */
  pulse?: boolean
}

/** Small colored dot. Use for status, legends, and project markers. */
function StatusDot({ tone = "neutral", pulse, className, ...props }: StatusDotProps) {
  return (
    <span
      data-slot="status-dot"
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        toneColor[tone],
        pulse && "animate-pulse motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}

export interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  tone?: StatusTone
  /** Pulse the dot. */
  pulse?: boolean
  /** Below 640px show only the dot; the label stays for screen readers. For crowded mobile headers. */
  compact?: boolean
}

/** Pill with a status dot and label, e.g. Paid / Pending / Refunded. `size="lg"` lines up with sm buttons. */
function StatusBadge({
  tone = "neutral",
  pulse,
  compact,
  variant = "secondary",
  children,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge data-slot="status-badge" variant={variant} className={className} {...props}>
      <StatusDot tone={tone} pulse={pulse} />
      {compact ? <span className="sr-only sm:not-sr-only">{children}</span> : children}
    </Badge>
  )
}

export { StatusDot, StatusBadge }
