"use client"

import { SearchIcon } from "lucide-react"
import type * as React from "react"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  /** Keyboard hint shown at the right, e.g. "⌘K" or "/". Display only. */
  shortcut?: React.ReactNode
  /** "lg" is the tall, pill-shaped hero search. */
  size?: "default" | "lg"
  /** Classes for the wrapping label. */
  wrapperClassName?: string
}

/** Search field with leading icon and optional shortcut hint. */
function SearchInput({
  shortcut,
  size = "default",
  className,
  wrapperClassName,
  "aria-label": ariaLabel = "Search",
  ...props
}: SearchInputProps) {
  const lg = size === "lg"
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the Input child is the control
    <label data-slot="search-input" className={cn("relative block", wrapperClassName)}>
      <SearchIcon
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground",
          lg ? "left-5" : "left-3.5",
        )}
      />
      <Input
        type="search"
        aria-label={ariaLabel}
        className={cn(
          lg ? "h-13.5 rounded-full border-border bg-card pl-13.5 text-[15px] shadow-card md:text-[15px]" : "pl-10.5",
          shortcut ? (lg ? "pr-15" : "pr-13") : undefined,
          className,
        )}
        {...props}
      />
      {shortcut && (
        <Kbd className={cn("absolute top-1/2 -translate-y-1/2", lg ? "right-4.5" : "right-2.5")}>{shortcut}</Kbd>
      )}
    </label>
  )
}

export { SearchInput }
