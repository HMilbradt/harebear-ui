"use client"

import * as React from "react"
import { Collapse } from "@/components/layout/collapse"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SettingsSectionProps extends Omit<React.ComponentProps<"section">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  /** SettingsRow children. */
  children?: React.ReactNode
}

/** A card of settings: heading, optional description, then SettingsRows separated by hairlines. */
function SettingsSection({ title, description, className, children, ...props }: SettingsSectionProps) {
  const id = React.useId()
  return (
    <section
      data-slot="settings-section"
      aria-labelledby={id}
      className={cn("flex min-w-0 flex-col rounded-xl bg-card shadow-card", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 px-5 pt-5 pb-2">
        <h2 id={id} className="text-base font-semibold">
          {title}
        </h2>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col divide-y divide-border px-5 pb-1">{children}</div>
    </section>
  )
}

export interface SettingsRowProps extends Omit<React.ComponentProps<"div">, "content"> {
  label: React.ReactNode
  /** One line under the label. */
  description?: React.ReactNode
  /** id of the control, so the label is a <label> for it (Switch, Select trigger, Input). */
  htmlFor?: string
  /** The control at the right: Switch, Select, ToggleGroup, Button. */
  control?: React.ReactNode
  /** Always shown under the label, full width, with no toggle (a list of connections, a hint, a short form). */
  body?: React.ReactNode
  /**
   * Inline content that expands under the row (change password, add a connection). Without a `control`, the row
   * gets a toggle button (`expandLabel` / "Cancel").
   */
  content?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Label of the default toggle button. Default "Change". */
  expandLabel?: React.ReactNode
}

/** One setting: label and description at the left, a control at the right, optional body and expandable content. */
function SettingsRow({
  label,
  description,
  htmlFor,
  control,
  body,
  content,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  expandLabel = "Change",
  className,
  ...props
}: SettingsRowProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }
  const contentId = React.useId()
  const Label = htmlFor ? "label" : "div"
  return (
    <div
      data-slot="settings-row"
      data-state={content ? (open ? "open" : "closed") : undefined}
      className={cn("py-3.5", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-1 basis-48 flex-col">
          <Label htmlFor={htmlFor} className="text-sm font-medium">
            {label}
          </Label>
          {description && <span className="text-[13px] text-muted-foreground">{description}</span>}
        </div>
        {control ??
          (content ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen(!open)}
            >
              {open ? "Cancel" : expandLabel}
            </Button>
          ) : null)}
      </div>
      {body && <div className="pt-3">{body}</div>}
      {content && (
        <Collapse open={open} id={contentId}>
          <div className="pt-3.5">{content}</div>
        </Collapse>
      )}
    </div>
  )
}

export { SettingsSection, SettingsRow }
