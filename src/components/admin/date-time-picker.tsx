"use client"

import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/** A floating local date and optional time, e.g. `{ date: "2026-11-12", time: "09:30" }`. No time zone. */
export interface DateTimeValue {
  /** `YYYY-MM-DD` */
  date: string
  /** `HH:MM`, 24-hour. */
  time?: string
}

export interface DateTimePickerProps extends Omit<React.ComponentProps<"button">, "value" | "onChange"> {
  value: DateTimeValue | null
  /** Called with the new value, or null when cleared. */
  onChange: (value: DateTimeValue | null) => void
  /** Show a time field under the calendar. */
  withTime?: boolean
  /** Trigger text when there is no value. Default "Pick a date". */
  placeholder?: string
}

const pad = (n: number) => String(n).padStart(2, "0")
const toDate = (date: string, time = "00:00") => {
  const [y, m, d] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0)
}
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function formatValue({ date, time }: DateTimeValue) {
  const at = toDate(date, time)
  const day = at.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
  return time ? `${day}, ${at.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : day
}

/** Date field: a button that opens a Calendar in a Popover, with an optional time field and Clear. */
function DateTimePicker({
  value,
  onChange,
  withTime,
  placeholder = "Pick a date",
  className,
  ...props
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const timeId = React.useId()
  const selected = value ? toDate(value.date) : undefined
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-time-picker"
          data-empty={value ? undefined : ""}
          className={cn(
            "flex h-10 w-full min-w-0 items-center gap-2.5 rounded-md border border-transparent bg-muted px-3.5 text-left text-base transition-[border-color,box-shadow,background-color] outline-none focus-visible:border-primary focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:opacity-50 data-empty:text-muted-foreground md:text-sm [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
            className,
          )}
          {...props}
        >
          <CalendarIcon aria-hidden="true" />
          <span className="truncate">{value ? formatValue(value) : placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-3 p-3">
        <Calendar
          mode="single"
          required
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            onChange({ date: toISODate(d), ...(value?.time ? { time: value.time } : {}) })
            if (!withTime) setOpen(false)
          }}
          className="p-0 [--cell-size:--spacing(11)] md:[--cell-size:--spacing(9)]"
        />
        {withTime && (
          <div className="flex items-center gap-3">
            <Label htmlFor={timeId} className="shrink-0">
              Time
            </Label>
            <Input
              id={timeId}
              type="time"
              disabled={!value}
              value={value?.time ?? ""}
              onChange={(e) =>
                value && onChange({ date: value.date, ...(e.target.value ? { time: e.target.value } : {}) })
              }
            />
          </div>
        )}
        {value && (
          <Button
            variant="ghost"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
          >
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
