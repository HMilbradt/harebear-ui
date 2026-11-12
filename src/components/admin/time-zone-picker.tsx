"use client"

import * as React from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

export interface TimeZonePickerProps {
  /** IANA name, e.g. "America/Vancouver". */
  value: string
  onValueChange: (value: string) => void
  /** id of the search input, for a FieldLabel or SettingsRow `htmlFor`. */
  id?: string
  className?: string
}

const label = (zone: string) => zone.replaceAll("_", " ")

/** Searchable IANA time zone list (Intl.supportedValuesOf("timeZone")), built on Combobox. */
function TimeZonePicker({ value, onValueChange, id, className }: TimeZonePickerProps) {
  const zones = React.useMemo(() => {
    const all = Intl.supportedValuesOf("timeZone")
    return value && !all.includes(value) ? [value, ...all] : all
  }, [value])
  return (
    <Combobox
      items={zones}
      value={value}
      onValueChange={(next) => next && onValueChange(next)}
      itemToStringLabel={label}
    >
      <ComboboxInput id={id} placeholder="Search time zones" showTrigger={false} className={cn("w-full", className)} />
      <ComboboxContent>
        <ComboboxEmpty>No matching time zone.</ComboboxEmpty>
        <ComboboxList>
          {(zone: string) => (
            <ComboboxItem key={zone} value={zone} className="pointer-coarse:min-h-11">
              {label(zone)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { TimeZonePicker }
