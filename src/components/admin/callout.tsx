"use client"

import { SparklesIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

/** Quiet inline note with an icon, e.g. an insight or tip. Defaults to a sparkle icon. */
function Callout({
  icon = <SparklesIcon />,
  tone = "muted",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { icon?: React.ReactNode; tone?: "muted" | "soft" }) {
  return (
    <div
      data-slot="callout"
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3.5 text-[13px] [&>svg]:size-[18px] [&>svg]:shrink-0 [&>svg]:text-primary",
        tone === "muted" ? "bg-muted" : "bg-primary-soft",
        className,
      )}
      {...props}
    >
      {icon}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export { Callout }
