import {
  CalendarIcon,
  FileTextIcon,
  HouseIcon,
  ListTodoIcon,
  MessageCircleIcon,
  PlusIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react"
import { useState } from "react"
import {
  ActionReceipt,
  AgendaRow,
  type AgendaRowWho,
  AppBrand,
  AppNav,
  AssistantDock,
  AssistantProvider,
  type AssistantSendContext,
  Badge,
  Button,
  DayStrip,
  DropdownMenuItem,
  SectionedList,
  type SectionedListSection,
  SidebarTrigger,
  toastUndo,
  useAssistantPage,
  UserMenu,
} from "@/index"

const initial: SectionedListSection[] = [
  {
    id: "overdue",
    title: "Overdue",
    items: [{ id: "o1", title: "Take out the bins", meta: "Overdue · yesterday", assignee: { name: "Sam Rivera" } }],
  },
  {
    id: "today",
    title: "Today",
    items: [
      {
        id: "t1",
        title: "Book the dentist for Ada",
        meta: "Important · 3 pm",
        important: true,
        assignee: { name: "Maya Chen" },
      },
      { id: "t2", title: "Pick up the dry cleaning", meta: "Errands" },
      { id: "t3", title: "Water the plants", meta: "Home", done: true },
    ],
  },
  {
    id: "groceries",
    title: "Groceries",
    items: [
      { id: "g1", title: "Oat milk", meta: "Groceries · added by HomeBot", assignee: { name: "Sam Rivera" } },
      { id: "g2", title: "Lemons", meta: "Groceries" },
    ],
  },
]

interface WeekItem {
  id: string
  title: string
  time: string
  who: AgendaRowWho
  kind: "todo" | "event"
  done?: boolean
}

const maya: AgendaRowWho = { name: "Maya", color: 1 }
const sam: AgendaRowWho = { name: "Sam", color: 2 }
const week = [0, 1, 2, 3, 4, 5, 6].map((n) => {
  const date = new Date(2026, 10, 11 + n)
  const items: WeekItem[] =
    n === 0
      ? [
          { id: "w1", title: "School pickup", time: "3:15", who: maya, kind: "event" },
          { id: "w2", title: "Call the plumber", time: "5:00", who: sam, kind: "todo" },
        ]
      : n === 3
        ? [
            { id: "w3", title: "Hockey", time: "10:00", who: sam, kind: "event" },
            { id: "w4", title: "Clean the gutters", time: "All day", who: maya, kind: "todo" },
          ]
        : []
  const title = date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
  return { id: `day-${date.getDate()}`, date, title, empty: "Nothing planned", items }
})

/** Upcoming in miniature: a DayStrip over one SectionedList with a section per day and AgendaRow rows. */
function WeekAgenda() {
  const [days, setDays] = useState(week)
  const [day, setDay] = useState(week[0]?.id)
  const setDone = (id: string, done: boolean) =>
    setDays((d) => d.map((sec) => ({ ...sec, items: sec.items.map((i) => (i.id === id ? { ...i, done } : i)) })))
  return (
    <section aria-label="This week" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">This week</h2>
      <DayStrip
        days={days.map((d) => ({ id: d.id, date: d.date, hasPlans: d.items.length > 0 }))}
        value={day}
        onValueChange={setDay}
        className="sticky top-0 z-10 bg-background"
      />
      <SectionedList<WeekItem>
        sections={days}
        lingerMs={9000}
        onToggle={(id, done) => {
          setDone(id, done)
          if (done) toastUndo("Marked done", { onUndo: () => setDone(id, false) })
        }}
        renderItem={(i, toggle) =>
          i.kind === "event" ? (
            <AgendaRow time={i.time} title={i.title} who={i.who} onOpen={() => {}} />
          ) : (
            <AgendaRow
              time={i.time}
              title={i.title}
              who={i.who}
              checked={!!i.done}
              onCheckedChange={toggle}
              onOpen={() => {}}
            />
          )
        }
      />
    </section>
  )
}

const lists = ["Groceries", "Errands", "House projects"].map((label, i) => ({
  label,
  href: "#household",
  icon: (
    <span
      aria-hidden="true"
      className={
        [
          "size-2.5 rounded-full bg-category-1",
          "size-2.5 rounded-full bg-category-2",
          "size-2.5 rounded-full bg-category-3",
        ][i]
      }
    />
  ),
}))

/** The demo agent: adds whatever you ask for to Groceries and answers with a receipt. */
function reply(text: string, { append }: AssistantSendContext) {
  const item = text.replace(/^add\s+/i, "").replace(/\s+to groceries$/i, "")
  append({
    role: "assistant",
    content: <ActionReceipt title={`Added ${item} to Groceries`} meta="Groceries · just now" onUndo={() => {}} />,
  })
  return `Done. Anything else for the shop?`
}

function TodayPage() {
  const [sections, setSections] = useState(initial)
  useAssistantPage({ id: "today", title: "Today", suggestions: ["Add lemons to groceries", "What's on this week?"] })
  const setDone = (id: string, done: boolean) =>
    setSections((s) => s.map((sec) => ({ ...sec, items: sec.items.map((i) => (i.id === id ? { ...i, done } : i)) })))
  const open = sections.flatMap((s) => s.items).filter((i) => !i.done).length
  const moveToToday = () =>
    setSections((s) => {
      const overdue = s.find((sec) => sec.id === "overdue")?.items ?? []
      return s.map((sec) =>
        sec.id === "overdue"
          ? { ...sec, items: [] }
          : sec.id === "today"
            ? { ...sec, items: [...overdue, ...sec.items] }
            : sec,
      )
    })
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-24 md:pt-10">
      <header className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-2xl font-semibold">Good morning, Maya</h1>
          <p className="text-sm text-muted-foreground">Tuesday, November 11 · {open} to do</p>
        </div>
        <Badge variant="soft">Everyone</Badge>
      </header>
      <SectionedList
        sections={sections.map((sec) =>
          sec.id === "overdue"
            ? {
                ...sec,
                action: (
                  <Button variant="ghost" size="sm" onClick={moveToToday}>
                    Move to today
                  </Button>
                ),
              }
            : sec,
        )}
        lingerMs={9000}
        addChips={(text) => (/\btomorrow\b/i.test(text) ? <Badge tone="info">Tomorrow</Badge> : null)}
        onAdd={(title) =>
          setSections((s) =>
            s.map((sec) =>
              sec.id === "today" ? { ...sec, items: [{ id: crypto.randomUUID(), title }, ...sec.items] } : sec,
            ),
          )
        }
        onToggle={(id, done) => {
          setDone(id, done)
          if (done) toastUndo("Marked done", { onUndo: () => setDone(id, false) })
        }}
        empty={<p className="px-2 text-sm text-muted-foreground">Nothing left for today.</p>}
      />
      <WeekAgenda />
    </div>
  )
}

export function HouseholdScreen() {
  return (
    <AssistantProvider onSend={reply}>
      <AppNav
        storageKey="household-sidebar"
        brand={<AppBrand name="Homeclub" icon={<HouseIcon />} />}
        places={[
          { label: "Today", icon: <SunIcon />, href: "#household", active: true, count: 4 },
          { label: "Upcoming", icon: <ListTodoIcon />, href: "#household" },
          { label: "Calendar", icon: <CalendarIcon />, href: "#household" },
          { label: "Docs", icon: <FileTextIcon />, href: "#household" },
          { label: "Chats", icon: <MessageCircleIcon />, href: "#household" },
          { label: "Settings", icon: <SettingsIcon />, href: "#settings", tab: false },
        ]}
        group={{ label: "Lists", items: lists, onAdd: () => {}, addLabel: "New list" }}
        action={{
          label: "New to-do",
          icon: <PlusIcon />,
          onSelect: () => document.querySelector<HTMLInputElement>("[data-slot=sectioned-list-add] input")?.focus(),
        }}
        footer={
          <UserMenu name="Maya Chen" subtitle="The Chen household">
            <DropdownMenuItem asChild>
              <a href="#settings">
                <SettingsIcon />
                Settings
              </a>
            </DropdownMenuItem>
          </UserMenu>
        }
      >
        <TodayPage />
        <AssistantDock
          title="HomeBot"
          fullScreenHref="#household"
          emptyDescription="I can add to-dos, plan the week and find things in your docs."
        />
      </AppNav>
    </AssistantProvider>
  )
}
