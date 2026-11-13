"use client"

import { XIcon } from "lucide-react"
import { Tabs as TabsPrimitive } from "radix-ui"
import * as React from "react"
import { Collapse } from "@/components/layout/collapse"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
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

export interface SettingsDialogSection {
  id: string
  label: string
  /** Icon element, e.g. <BellIcon />. Shown next to the label in the section nav. */
  icon?: React.ReactNode
  /** The section's settings, usually one or more SettingsSection cards. */
  content: React.ReactNode
}

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: SettingsDialogSection[]
  /** Active section id (controlled). Pair with `onValueChange`, e.g. to open straight at "notifications". */
  value?: string
  /** Active section when uncontrolled. Default the first section. */
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Dialog title. Default "Settings". */
  title?: React.ReactNode
  /** Optional line under the title, read by screen readers when the dialog opens. */
  description?: React.ReactNode
  className?: string
}

/**
 * App settings as a modal that opens over any page, like Notion's. Desktop: a dialog with a section nav at the
 * left (icons and labels) and a scrolling content pane. Phones: full screen, with the sections as scrollable tabs
 * at the top. The nav is a tab list (arrow keys move between sections, the panel is named by its tab), and focus
 * returns to the opener on close. Put SettingsSection / SettingsRow inside each section's `content`.
 */
function SettingsDialog({
  open,
  onOpenChange,
  sections,
  value: valueProp,
  defaultValue,
  onValueChange,
  title = "Settings",
  description,
  className,
}: SettingsDialogProps) {
  const [valueState, setValueState] = React.useState(defaultValue ?? sections[0]?.id)
  const value = valueProp ?? valueState
  const setValue = (next: string) => {
    if (valueProp === undefined) setValueState(next)
    onValueChange?.(next)
  }
  const mobile = useIsMobile()
  // Radix only returns focus to a DialogTrigger, and this dialog usually opens from a menu item or a button
  // elsewhere, so remember what had focus and put it back on close.
  const returnFocus = React.useRef<HTMLElement | null>(null)
  const noDescription = description ? {} : { "aria-describedby": undefined }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="settings-dialog"
        showCloseButton={false}
        {...noDescription}
        onOpenAutoFocus={() => {
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        }}
        onCloseAutoFocus={(e) => {
          if (!returnFocus.current?.isConnected) return
          e.preventDefault()
          returnFocus.current.focus()
        }}
        className={cn(
          "flex flex-col gap-0 overflow-hidden bg-background p-0 max-md:inset-0 max-md:h-dvh max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none max-md:ring-0 md:h-[min(42rem,calc(100dvh-4rem))] md:max-w-[min(56rem,calc(100%-4rem))] md:flex-row",
          className,
        )}
      >
        <TabsPrimitive.Root
          value={value}
          onValueChange={setValue}
          orientation={mobile ? "horizontal" : "vertical"}
          className="flex min-h-0 flex-1 flex-col md:flex-row"
        >
          <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-sidebar pt-[max(0.75rem,env(safe-area-inset-top))] md:w-56 md:gap-4 md:border-r md:border-b-0 md:px-3 md:pt-5">
            <div className="flex items-center gap-2 px-4 md:px-2">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <DialogTitle className="truncate text-base font-semibold">{title}</DialogTitle>
                {description && (
                  <DialogDescription className="text-[13px] max-md:sr-only">{description}</DialogDescription>
                )}
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close" className="-mr-2 md:hidden">
                  <XIcon />
                </Button>
              </DialogClose>
            </div>
            <TabsPrimitive.List
              aria-label="Settings sections"
              data-slot="settings-dialog-nav"
              className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2 md:flex-col md:overflow-visible md:px-0 md:pb-0"
            >
              {sections.map((section) => (
                <TabsPrimitive.Trigger
                  key={section.id}
                  value={section.id}
                  className="flex h-11 shrink-0 items-center gap-2.5 rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-card md:h-9 [&_svg]:size-[18px] [&_svg]:shrink-0"
                >
                  {section.icon}
                  <span className="truncate">{section.label}</span>
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>
          </div>
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                className="absolute top-4 right-4 z-10 max-md:hidden"
              >
                <XIcon />
              </Button>
            </DialogClose>
            {sections.map((section) => (
              <TabsPrimitive.Content
                key={section.id}
                value={section.id}
                data-slot="settings-dialog-panel"
                className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:px-8 md:pt-6 md:pb-8"
              >
                <div aria-hidden="true" className="pb-5 text-lg font-semibold max-md:hidden">
                  {section.label}
                </div>
                <div className="flex flex-col gap-5">{section.content}</div>
              </TabsPrimitive.Content>
            ))}
          </div>
        </TabsPrimitive.Root>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsSection, SettingsRow, SettingsDialog }
