"use client"

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import type * as React from "react"
import { StatusDot, type StatusTone } from "@/components/admin/status"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
}

export interface ModelPickerProps {
  models: ModelOption[]
  value: string
  onValueChange: (id: string) => void
  label?: React.ReactNode
  className?: string
  disabled?: boolean
}

/** Pill button showing the active model with a status dot; opens a menu of models. */
function ModelPicker({ models, value, onValueChange, label = "Model", className, disabled }: ModelPickerProps) {
  const current = models.find((m) => m.id === value)
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
        {models.map((m) => (
          <DropdownMenuItem key={m.id} onSelect={() => onValueChange(m.id)} className="items-start gap-2.5">
            <StatusDot tone={m.status ?? "success"} className="mt-1.5" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-mono text-xs">{m.label ?? m.id}</span>
              {m.description && <span className="text-xs text-muted-foreground">{m.description}</span>}
            </div>
            {m.id === value && <CheckIcon className="mt-0.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ModelPicker }
