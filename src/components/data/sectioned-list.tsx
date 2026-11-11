"use client"

import { ChevronDownIcon, PlusIcon } from "lucide-react"
import * as React from "react"
import { TaskRow, type TaskRowAssignee } from "@/components/data/task-row"
import { Collapse } from "@/components/layout/collapse"
import { cn } from "@/lib/utils"

export interface SectionedListItem {
  id: string
  title: React.ReactNode
  meta?: React.ReactNode
  done?: boolean
  important?: boolean
  assignee?: TaskRowAssignee
}

export interface SectionedListSection {
  id: string
  /** Section heading, e.g. "Today" or "Groceries". Omit for a section without one. */
  title?: React.ReactNode
  items: SectionedListItem[]
}

export interface SectionedListProps extends Omit<React.ComponentProps<"div">, "onToggle"> {
  sections: SectionedListSection[]
  /** Called when an item's check changes. Update `done` in your data; the row folds away by itself. */
  onToggle: (id: string, done: boolean) => void
  /** Makes item titles buttons, e.g. to open a DetailSheet. */
  onOpen?: (id: string) => void
  /** Shows one add box at the top. Called with the trimmed text on Enter. */
  onAdd?: (text: string) => void
  /** Add box placeholder and label. Default "Add a to-do". */
  addPlaceholder?: string
  /** Shown when no item is open, e.g. <Empty /> or a line of text. */
  empty?: React.ReactNode
  /** Start with the done items shown. Default false. */
  defaultShowDone?: boolean
}

/** How long a ticked row stays in place (so the check is seen) before it folds away. */
const LINGER_MS = 600

/**
 * A to-do list: one add box, sections with headings, done items folded into a "Show N done" toggle, an empty
 * state. Rows fold in and out with Collapse, so nothing jumps.
 */
function SectionedList({
  sections,
  onToggle,
  onOpen,
  onAdd,
  addPlaceholder = "Add a to-do",
  empty,
  defaultShowDone = false,
  className,
  ...props
}: SectionedListProps) {
  const [showDone, setShowDone] = React.useState(defaultShowDone)
  const [lingering, setLingering] = React.useState<ReadonlySet<string>>(new Set())
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>())
  React.useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  const toggle = (id: string, done: boolean) => {
    clearTimeout(timers.current.get(id))
    if (done) {
      setLingering((s) => new Set(s).add(id))
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id)
          setLingering((s) => {
            const next = new Set(s)
            next.delete(id)
            return next
          })
        }, LINGER_MS),
      )
    }
    onToggle(id, done)
  }

  const shown = (item: SectionedListItem) => !item.done || lingering.has(item.id)
  const done = sections.flatMap((s) => s.items.filter((i) => i.done && !lingering.has(i.id)))
  const anyOpen = sections.some((s) => s.items.some(shown))
  const row = (item: SectionedListItem) => (
    <TaskRow
      title={item.title}
      meta={item.meta}
      checked={!!item.done}
      important={item.important}
      assignee={item.assignee}
      onCheckedChange={(v) => toggle(item.id, v)}
      onOpen={onOpen ? () => onOpen(item.id) : undefined}
    />
  )

  return (
    <div data-slot="sectioned-list" className={cn("flex min-w-0 flex-col gap-6", className)} {...props}>
      {onAdd && <AddBox placeholder={addPlaceholder} onAdd={onAdd} />}
      {sections.map((section) => {
        const visible = section.items.some(shown)
        return (
          <Collapse key={section.id} open={visible}>
            <section aria-label={typeof section.title === "string" ? section.title : undefined}>
              {section.title && (
                <h2 className="px-2 pb-1 text-[13px] font-semibold text-muted-foreground">{section.title}</h2>
              )}
              <ul className="flex flex-col">
                {section.items.map((item) => (
                  <Collapse key={item.id} open={shown(item)} role="listitem">
                    {row(item)}
                  </Collapse>
                ))}
              </ul>
            </section>
          </Collapse>
        )
      })}
      {!anyOpen && empty && <div data-slot="sectioned-list-empty">{empty}</div>}
      {done.length > 0 && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            aria-expanded={showDone}
            onClick={() => setShowDone((v) => !v)}
            className="flex min-h-11 items-center gap-1.5 self-start rounded-md px-2 text-[13px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20"
          >
            <ChevronDownIcon
              aria-hidden="true"
              className={cn("size-4 transition-transform motion-reduce:transition-none", !showDone && "-rotate-90")}
            />
            {showDone ? "Hide done" : `Show ${done.length} done`}
          </button>
          <Collapse open={showDone}>
            <ul className="flex flex-col">
              {done.map((item) => (
                <li key={item.id}>{row(item)}</li>
              ))}
            </ul>
          </Collapse>
        </div>
      )}
    </div>
  )
}

function AddBox({ placeholder, onAdd }: { placeholder: string; onAdd: (text: string) => void }) {
  const [value, setValue] = React.useState("")
  const id = React.useId()
  return (
    <form
      data-slot="sectioned-list-add"
      onSubmit={(e) => {
        e.preventDefault()
        const text = value.trim()
        if (!text) return
        onAdd(text)
        setValue("")
      }}
      className="focus-box flex h-12 items-center gap-2.5 rounded-xl border border-transparent bg-muted px-3.5"
    >
      <PlusIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
      />
    </form>
  )
}

export { SectionedList }
