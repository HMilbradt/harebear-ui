"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  /** Label of the text field. */
  label: React.ReactNode
  /** Starting text, e.g. the current name when renaming. */
  defaultValue?: string
  submitLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  maxLength?: number
  /** Gets the trimmed text. The dialog closes when it returns or resolves; a thrown error's message shows under the field. */
  onSubmit: (value: string) => void | Promise<void>
}

/** Controlled dialog that asks for one line of text: New list, Rename, Add section. Sibling of ConfirmDialog. */
function PromptDialog({ open, onOpenChange, ...props }: PromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-slot="prompt-dialog">
        {/* Remounts on every open, so the text and error start fresh. */}
        <PromptForm onDone={() => onOpenChange(false)} {...props} />
      </DialogContent>
    </Dialog>
  )
}

function PromptForm({
  title,
  description,
  label,
  defaultValue = "",
  submitLabel = "Save",
  cancelLabel = "Cancel",
  maxLength,
  onSubmit,
  onDone,
}: Omit<PromptDialogProps, "open" | "onOpenChange"> & { onDone: () => void }) {
  const id = React.useId()
  const [value, setValue] = React.useState(defaultValue)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          await onSubmit(value.trim())
          onDone()
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
          setBusy(false)
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          autoComplete="off"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      </Field>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            {cancelLabel}
          </Button>
        </DialogClose>
        <Button type="submit" loading={busy} disabled={!value.trim()}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

export { PromptDialog }
