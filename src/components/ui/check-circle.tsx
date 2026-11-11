"use client"

import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckCircleProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  /**
   * "important" tints the unticked ring with the warning color. Color alone is not enough: pair it with a word
   * (for example "Important" in the row's meta line).
   */
  tone?: "default" | "important"
}

/**
 * harebear: 24px round checkbox for to-do rows, with a 44px touch target and a short pop when ticked (none under
 * reduced motion). Radix Checkbox underneath: `checked`, `onCheckedChange`, `disabled`. Give it an accessible name
 * (`aria-label` or `aria-labelledby` pointing at the row title). Align it with the first line of text, not the center.
 */
function CheckCircle({ tone = "default", className, onCheckedChange, onAnimationEnd, ...props }: CheckCircleProps) {
  const [pop, setPop] = React.useState(false)
  return (
    <CheckboxPrimitive.Root
      data-slot="check-circle"
      data-tone={tone}
      data-pop={pop || undefined}
      onCheckedChange={(checked) => {
        if (checked === true) setPop(true)
        onCheckedChange?.(checked)
      }}
      onAnimationEnd={(e) => {
        setPop(false)
        onAnimationEnd?.(e)
      }}
      className={cn(
        "peer relative grid size-6 shrink-0 place-items-center rounded-full border-2 border-muted-foreground/45 bg-card text-primary-foreground transition-[background-color,border-color,box-shadow] outline-none after:absolute after:-inset-2.5 hover:border-primary focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 data-[tone=important]:border-warning data-[tone=important]:bg-warning/10 data-checked:border-primary data-checked:bg-primary data-[pop]:animate-check-pop",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="check-circle-indicator" className="grid place-content-center">
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { CheckCircle }
