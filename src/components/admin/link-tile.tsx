"use client"

import { Slot } from "radix-ui"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { StatusDot, type StatusTone } from "./status"

export interface LinkTileProps extends Omit<React.ComponentProps<"a">, "title"> {
  title: React.ReactNode
  /** Mono secondary line, e.g. a host:port. */
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  status?: { tone: StatusTone; label: React.ReactNode }
  /** Pass your router's <Link href> as the only child; the tile content renders inside it. */
  asChild?: boolean
}

/** Muted tile that lifts on hover. For service launchers and quick links. */
function LinkTile({ title, subtitle, icon, status, asChild, className, children, ...props }: LinkTileProps) {
  const Comp = asChild ? Slot.Root : "a"
  const body = (
    <>
      <div className="flex items-start justify-between">
        <span className="grid size-9.5 place-items-center rounded-md bg-card text-primary shadow-card [&_svg]:size-[18px]">
          {icon}
        </span>
        {status && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground tabular-nums">
            <StatusDot tone={status.tone} />
            {status.label}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-px">
        <span className="font-semibold">{title}</span>
        {subtitle && <span className="truncate font-mono text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </>
  )
  return (
    <Comp
      data-slot="link-tile"
      className={cn(
        "flex flex-col gap-3.5 rounded-lg bg-muted p-4 text-foreground no-underline transition-[background-color,transform,box-shadow] outline-none hover:-translate-y-px hover:bg-card hover:shadow-card focus-visible:ring-4 focus-visible:ring-ring/20",
        className,
      )}
      {...props}
    >
      {asChild && <Slot.Slottable>{children}</Slot.Slottable>}
      {body}
    </Comp>
  )
}

export { LinkTile }
