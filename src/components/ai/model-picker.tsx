"use client"

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import type * as React from "react"
import { StatusDot, type StatusTone } from "@/components/admin/status"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface ModelOption {
  id: string
  /** Display name. Defaults to id. Rendered monospace. */
  label?: string
  description?: React.ReactNode
  /** Availability dot. Default "success". */
  status?: StatusTone
  /** Section heading in the menu, e.g. the provider. Models with the same group are listed together. */
  group?: string
}

export interface ModelPickerProps {
  models: ModelOption[]
  value: string
  onValueChange: (id: string) => void
  label?: React.ReactNode
  className?: string
  disabled?: boolean
}

/**
 * Pill button showing the active model with a status dot; opens a menu of models, sectioned by `group`.
 * A `value` missing from `models` is still listed (and checked) at the top.
 */
function ModelPicker({ models, value, onValueChange, label = "Model", className, disabled }: ModelPickerProps) {
  const current = models.find((m) => m.id === value)
  const all = current || !value ? models : [{ id: value }, ...models]
  const groups: { name?: string; items: ModelOption[] }[] = []
  for (const m of all) {
    const g = groups.find((x) => x.name === m.group)
    if (g) g.items.push(m)
    else groups.push({ name: m.group, items: [m] })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" size="sm" shape="pill" className={cn("gap-2 px-3", className)}>
          <StatusDot tone={current?.status ?? "success"} />
          <span className="font-mono text-xs">{current?.label ?? value}</span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {groups.map((g, i) => (
          <DropdownMenuGroup key={g.name ?? `group-${i}`}>
            {i > 0 && <DropdownMenuSeparator />}
            {g.name && (
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{g.name}</DropdownMenuLabel>
            )}
            {g.items.map((m) => (
              <DropdownMenuItem key={m.id} onSelect={() => onValueChange(m.id)} className="items-start gap-2.5">
                <StatusDot tone={m.status ?? "success"} className="mt-1.5" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-mono text-xs">{m.label ?? m.id}</span>
                  {m.description && <span className="text-xs text-muted-foreground">{m.description}</span>}
                </div>
                {m.id === value && <CheckIcon className="mt-0.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ModelPicker }
