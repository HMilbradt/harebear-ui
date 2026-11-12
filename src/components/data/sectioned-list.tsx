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

export interface SectionedListSection<T extends SectionedListItem = SectionedListItem> {
  /** Also the section's DOM id, so a DayStrip or `#id` link can jump to it. */
  id: string
  /** Section heading, e.g. "Today" or "Groceries". Omit for a section without one. */
  title?: React.ReactNode
  /** At the right of the heading, e.g. a small ghost Button "Move to today". */
  action?: React.ReactNode
  /** Keeps the section shown with this text when it has no open item, e.g. "Nothing planned". */
  empty?: React.ReactNode
  items: T[]
}

export interface SectionedListProps<T extends SectionedListItem = SectionedListItem>
  extends Omit<React.ComponentProps<"div">, "onToggle"> {
  sections: SectionedListSection<T>[]
  /** Called when an item's check changes. Update `done` in your data; the row folds away by itself. */
  onToggle: (id: string, done: boolean) => void
  /**
   * Draws a row instead of TaskRow, e.g. an AgendaRow. Call `toggle(done)` from its check so the row lingers and
   * folds away like a TaskRow. Items without `done` (events) always stay.
   */
  renderItem?: (item: T, toggle: (done: boolean) => void) => React.ReactNode
  /** How long a ticked row stays struck through before it folds away, e.g. the length of an Undo toast. Default 600. */
  lingerMs?: number
  /** Makes item titles buttons, e.g. to open a DetailSheet. */
  onOpen?: (id: string) => void
  /** Shows one add box at the top. Called with the trimmed text on Enter. */
  onAdd?: (text: string) => void
  /** Add box placeholder and label. Default "Add a to-do". */
  addPlaceholder?: string
  /** Chips at the right of the add box while it has text, e.g. the date or person parsed from it. Like AskBox `chips`. */
  addChips?: (text: string) => React.ReactNode
  /** Shown when no item is open, e.g. <Empty /> or a line of text. */
  empty?: React.ReactNode
  /** Start with the done items shown. Default false. */
  defaultShowDone?: boolean
}

/**
 * A to-do list: one add box, sections with headings, done items folded into a "Show N done" toggle, an empty
 * state. Rows fold in and out with Collapse, so nothing jumps. `renderItem` draws other rows (AgendaRow), so a week
 * agenda is one SectionedList with a section per day.
 */
function SectionedList<T extends SectionedListItem = SectionedListItem>({
  sections,
  onToggle,
  renderItem,
  lingerMs = 600,
  onOpen,
  onAdd,
  addPlaceholder = "Add a to-do",
  addChips,
  empty,
  defaultShowDone = false,
  className,
  ...props
}: SectionedListProps<T>) {
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
        }, lingerMs),
      )
    }
    onToggle(id, done)
  }

  const shown = (item: SectionedListItem) => !item.done || lingering.has(item.id)
  const done = sections.flatMap((s) => s.items.filter((i) => i.done && !lingering.has(i.id)))
  const anyOpen = sections.some((s) => s.items.some(shown))
  const row = (item: T) =>
    renderItem ? (
      renderItem(item, (v) => toggle(item.id, v))
    ) : (
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
      {onAdd && <AddBox placeholder={addPlaceholder} onAdd={onAdd} chips={addChips} />}
      {sections.map((section) => {
        const hasOpen = section.items.some(shown)
        return (
          <Collapse key={section.id} open={hasOpen || section.empty != null}>
            <section id={section.id} aria-label={typeof section.title === "string" ? section.title : undefined}>
              {(section.title || section.action) && (
                <div className="flex min-w-0 items-center gap-2 px-2 pb-1">
                  {section.title && (
                    <h2 className="min-w-0 text-[13px] font-semibold text-muted-foreground">{section.title}</h2>
                  )}
                  {section.action && <div className="ml-auto flex shrink-0 items-center">{section.action}</div>}
                </div>
              )}
              {section.empty != null && (
                <Collapse open={!hasOpen}>
                  <p data-slot="sectioned-list-section-empty" className="px-2 py-2.5 text-sm text-muted-foreground">
                    {section.empty}
                  </p>
                </Collapse>
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

function AddBox({
  placeholder,
  onAdd,
  chips,
}: {
  placeholder: string
  onAdd: (text: string) => void
  chips?: (text: string) => React.ReactNode
}) {
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
      {chips && value.trim() && (
        <div data-slot="sectioned-list-add-chips" className="flex shrink-0 items-center gap-1.5">
          {chips(value)}
        </div>
      )}
    </form>
  )
}

export { SectionedList }
