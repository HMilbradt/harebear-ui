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

/** Small colored dot. Use for status, legends, and project markers. */
function StatusDot({ tone = "neutral", className, ...props }: React.ComponentProps<"span"> & { tone?: StatusTone }) {
  return (
    <span
      data-slot="status-dot"
      aria-hidden="true"
      className={cn("inline-block size-2 shrink-0 rounded-full", toneColor[tone], className)}
      {...props}
    />
  )
}

/** Pill with a status dot and label, e.g. Paid / Pending / Refunded. */
function StatusBadge({
  tone = "neutral",
  variant = "secondary",
  children,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & { tone?: StatusTone }) {
  return (
    <Badge data-slot="status-badge" variant={variant} className={className} {...props}>
      <StatusDot tone={tone} />
      {children}
    </Badge>
  )
}

export { StatusDot, StatusBadge }
