"use client"

import { XIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

export interface DetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Heading and accessible name, e.g. "To-do". */
  title: React.ReactNode
  description?: React.ReactNode
  /** Pinned under the scrolling body, e.g. a Delete button. */
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/**
 * A record's details: a floating side sheet from 768px up, a full-screen drawer on phones.
 * Both have a close button and a scrolling body.
 */
function DetailSheet({ open, onOpenChange, title, description, footer, className, children }: DetailSheetProps) {
  const desktop = useMediaQuery("(min-width: 768px)")
  // Radix warns about a dialog without a description unless aria-describedby is set to undefined.
  const noDescription = description ? {} : { "aria-describedby": undefined }
  const body = <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
  const foot = footer && <div className="flex flex-wrap items-center gap-2 border-t px-6 py-4">{footer}</div>

  if (desktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          data-slot="detail-sheet"
          data-layout="sheet"
          {...noDescription}
          className={cn(
            "gap-0 data-[side=right]:inset-y-4 data-[side=right]:right-4 data-[side=right]:h-auto data-[side=right]:w-[min(420px,calc(100%-32px))] data-[side=right]:rounded-xl data-[side=right]:border data-[side=right]:sm:max-w-none",
            className,
          )}
        >
          <div className="flex flex-col gap-1 p-6 pr-14">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
          {body}
          {foot}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        data-slot="detail-sheet"
        data-layout="drawer"
        {...noDescription}
        className={cn(
          "h-dvh data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-t-0",
          className,
        )}
      >
        <div className="flex items-start gap-2 px-6 pt-2 pb-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1 pt-2.5">
            <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon-lg" aria-label="Close" className="-mr-2.5">
              <XIcon />
            </Button>
          </DrawerClose>
        </div>
        {body}
        {foot}
      </DrawerContent>
    </Drawer>
  )
}

export { DetailSheet }
