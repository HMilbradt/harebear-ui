"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import type * as React from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"

export interface CopyFieldProps extends Omit<React.ComponentProps<typeof InputGroup>, "children"> {
  /** The text copied. */
  value: string
  /** What the field shows, if not the full value (e.g. a file name for a path). The full value is the tooltip. */
  display?: string
  /** Leading label inside the field, e.g. "File" or "ID". */
  label?: React.ReactNode
  /** Accessible name for the field. Default "Value". */
  "aria-label"?: string
  /** Monospace text. Default true. */
  mono?: boolean
  /** Shown next to the button, and its accessible name, for a moment after copying. Default "Copied". */
  copiedLabel?: string
}

/** Read-only value with a copy button: IDs, paths, tokens' public parts, URLs. */
function CopyField({
  value,
  display,
  label,
  mono = true,
  copiedLabel = "Copied",
  "aria-label": name = "Value",
  className,
  ...props
}: CopyFieldProps) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <InputGroup data-slot="copy-field" className={className} {...props}>
      {label && (
        <InputGroupAddon>
          <InputGroupText>{label}</InputGroupText>
        </InputGroupAddon>
      )}
      <InputGroupInput
        readOnly
        value={display ?? value}
        title={value}
        aria-label={name}
        className={cn(mono && "font-mono")}
        onFocus={(e) => e.currentTarget.select()}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText data-slot="copy-field-status" aria-hidden="true" className="text-xs empty:hidden">
          {copied ? copiedLabel : null}
        </InputGroupText>
        <InputGroupButton
          size="icon-xs"
          aria-label={copied ? copiedLabel : `Copy ${name.toLowerCase()}`}
          onClick={() => copy(value)}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { CopyField }
