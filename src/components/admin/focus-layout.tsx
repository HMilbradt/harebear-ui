"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface FocusLayoutProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Page title in the top bar. */
  title?: React.ReactNode
  /** Leading control, usually a close or back link: <Button asChild variant="ghost" size="icon"><a aria-label="Close">…</a></Button>. */
  back?: React.ReactNode
  /** Trailing top bar controls, e.g. a Save button. */
  actions?: React.ReactNode
  /** Column width. Default "md" (42rem). */
  width?: "sm" | "md" | "lg"
}

const widthClass = { sm: "max-w-xl", md: "max-w-2xl", lg: "max-w-4xl" } as const

/** A page outside the app frame (settings, onboarding, setup): slim top bar with back link and title, one centred column. */
function FocusLayout({ title, back, actions, width = "md", className, children, ...props }: FocusLayoutProps) {
  return (
    <div data-slot="focus-layout" className={cn("flex min-h-dvh flex-col bg-background", className)} {...props}>
      <header className="sticky top-0 z-20 flex min-h-14 items-center gap-2 bg-background/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur sm:px-4">
        {back}
        {title && <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</h1>}
        {!title && <div className="flex-1" />}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <main
        className={cn(
          "mx-auto flex w-full flex-col gap-6 px-4 pt-4 pb-[max(3rem,env(safe-area-inset-bottom))]",
          widthClass[width],
        )}
      >
        {children}
      </main>
    </div>
  )
}

export { FocusLayout }
