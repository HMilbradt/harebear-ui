"use client"

import { CheckIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import type * as React from "react"
import { type CategoryColor, categoryBg } from "@/components/admin/category"
import { cn } from "@/lib/utils"

const colors: { value: CategoryColor; name: string }[] = [
  { value: 1, name: "Blue" },
  { value: 2, name: "Teal" },
  { value: 3, name: "Violet" },
  { value: 4, name: "Rose" },
  { value: 5, name: "Slate" },
  { value: 6, name: "Cyan" },
]

export interface ColorSwatchPickerProps
  extends Omit<
    React.ComponentProps<typeof RadioGroupPrimitive.Root>,
    "value" | "defaultValue" | "onValueChange" | "children"
  > {
  value?: CategoryColor
  onValueChange?: (color: CategoryColor) => void
  /** Colours someone else already uses, as colour -> their name. Shown with their initial and disabled. */
  taken?: Partial<Record<CategoryColor, string>>
}

/**
 * The six category colours as a radio group (arrow keys move between free colours). Name it with `aria-label` or
 * `aria-labelledby`. 32px swatches with 44px touch targets; the chosen one shows a check and a ring.
 */
function ColorSwatchPicker({ value, onValueChange, taken, className, ...props }: ColorSwatchPickerProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="color-swatch-picker"
      value={value ? String(value) : ""}
      onValueChange={(v) => onValueChange?.(Number(v) as CategoryColor)}
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {colors.map((c) => {
        const by = taken?.[c.value]
        return (
          <RadioGroupPrimitive.Item
            key={c.value}
            value={String(c.value)}
            disabled={!!by}
            aria-label={by ? `${c.name}, taken by ${by}` : c.name}
            title={by ? `${c.name}, taken by ${by}` : undefined}
            className={cn(
              "relative grid size-8 shrink-0 place-items-center rounded-full text-category-foreground outline-none after:absolute after:-inset-1.5 focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 data-checked:ring-2 data-checked:ring-foreground data-checked:ring-offset-2 data-checked:ring-offset-card",
              categoryBg[c.value],
            )}
          >
            {by ? (
              <span aria-hidden="true" className="text-xs leading-none font-semibold">
                {by.trim()[0]?.toUpperCase()}
              </span>
            ) : (
              <RadioGroupPrimitive.Indicator className="grid place-items-center">
                <CheckIcon className="size-4" strokeWidth={3} />
              </RadioGroupPrimitive.Indicator>
            )}
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}

export { ColorSwatchPicker }
