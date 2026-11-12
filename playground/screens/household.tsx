import {
  CalendarIcon,
  FileTextIcon,
  HouseIcon,
  ListIcon,
  ListTodoIcon,
  MessageCircleIcon,
  PlusIcon,
  SettingsIcon,
  SquarePenIcon,
  SunIcon,
} from "lucide-react"
import { useState } from "react"
import {
  ActionReceipt,
  AgendaRow,
  type AgendaRowWho,
  AppBrand,
  AppNav,
  AskBox,
  AssistantDock,
  AssistantProvider,
  type AssistantSendContext,
  Badge,
  Button,
  ChatMessage,
  ChatPanel,
  DayStrip,
  type CategoryColor,
  CategoryDot,
  DropdownMenuItem,
  Page,
  PageHeader,
  PageSection,
  PromptInput,
  SectionedList,
  type SectionedListSection,
  SidebarTrigger,
  toastUndo,
  useAssistant,
  useAssistantPage,
  UserMenu,
  VisibilityBadge,
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
        assignee: { name: "Maya Chen", color: 1 },
      },
      { id: "t2", title: "Pick up the dry cleaning", meta: "Errands" },
      { id: "t3", title: "Water the plants", meta: "Home", done: true },
    ],
  },
  {
    id: "groceries",
    title: "Groceries",
    items: [
      { id: "g1", title: "Oat milk", meta: "Groceries · added by HomeBot", assignee: { name: "Sam Rivera", color: 2 } },
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
  const local = new Date(2026, 10, 11 + n)
  const date = `2026-11-${local.getDate()}`
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
  const title = local.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
  return { id: `day-${local.getDate()}`, date, title, empty: "Nothing planned", items }
})

/** Upcoming in miniature: a DayStrip over one SectionedList with a section per day and AgendaRow rows. */
function WeekAgenda() {
  const [days, setDays] = useState(week)
  const [day, setDay] = useState(week[0]?.id)
  const setDone = (id: string, done: boolean) =>
    setDays((d) => d.map((sec) => ({ ...sec, items: sec.items.map((i) => (i.id === id ? { ...i, done } : i)) })))
  return (
    <PageSection title="This week">
      <DayStrip
        sticky
        days={days.map((d) => ({ id: d.id, date: d.date, hasPlans: d.items.length > 0 }))}
        value={day}
        onValueChange={setDay}
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
    </PageSection>
  )
}

const lists = [
  { label: "Groceries", color: 1 },
  { label: "Errands", color: 2 },
  { label: "Birthday ideas", color: 3, locked: true },
].map(({ label, color, locked }) => ({
  label,
  href: "#household",
  icon: <CategoryDot color={color as CategoryColor} locked={locked} />,
}))

const household: { name: string; color: CategoryColor }[] = [
  { name: "Maya Chen", color: 1 },
  { name: "Sam Rivera", color: 2 },
  { name: "Ada Chen", color: 4 },
]

/** The demo agent: thinks for a moment (Stop aborts it), then adds what you asked for to Groceries with a receipt. */
async function reply(text: string, { append, signal }: AssistantSendContext) {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  if (signal.aborted) return
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
  const assistant = useAssistant()
  const [ask, setAsk] = useState("")
  return (
    <Page>
      <PageHeader
        icon={<SunIcon className="text-warning" />}
        title="Good morning, Maya"
        description={`Tuesday, November 11 · ${open} to do`}
        actions={
          <>
            <SidebarTrigger className="md:hidden" />
            <VisibilityBadge visibility="shared" members={household} className="max-sm:hidden" />
            <UserMenu compact name="Maya Chen" color={1} subtitle="The Chen household" className="md:hidden" />
          </>
        }
      />
      <AskBox
        value={ask}
        onValueChange={setAsk}
        onSubmit={(text) => {
          setAsk("")
          void assistant.send(text, { open: false })
        }}
        placeholder="Ask HomeBot anything"
        pending={assistant.pending}
        onStop={assistant.stop}
        reply={assistant.reply}
        chatHref="#household"
      />
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
    </Page>
  )
}

/** A full-height chat page: AppNav `fill` gives ChatPanel the screen minus the tab bar. */
/** The dock's "New chat" header action: clears the conversation. */
function DockNewChat() {
  const { clear, messages } = useAssistant()
  if (messages.length === 0) return null
  return (
    <Button variant="ghost" size="icon" shape="pill" aria-label="New chat" onClick={clear}>
      <SquarePenIcon />
    </Button>
  )
}

function ChatPage() {
  const [draft, setDraft] = useState("")
  return (
    <ChatPanel
      title="HomeBot"
      className="m-2 md:m-4"
      composer={
        <PromptInput
          value={draft}
          onValueChange={setDraft}
          onSubmit={() => setDraft("")}
          placeholder="Ask HomeBot anything"
        />
      }
    >
      <ChatMessage role="user">What's on this week?</ChatMessage>
      <ChatMessage role="assistant">
        School pickup today at 3:15 and hockey on Saturday at 10. Nothing else planned.
      </ChatMessage>
    </ChatPanel>
  )
}

export function HouseholdScreen() {
  const [view, setView] = useState<"today" | "chat">("today")
  return (
    <AssistantProvider onSend={reply}>
      <AppNav
        fill={view === "chat"}
        storageKey="household-sidebar"
        brand={<AppBrand name="Homeclub" icon={<HouseIcon />} />}
        places={[
          { label: "Today", icon: <SunIcon />, onSelect: () => setView("today"), active: view === "today", count: 4 },
          { label: "Upcoming", icon: <ListTodoIcon />, href: "#household" },
          { label: "Calendar", icon: <CalendarIcon />, href: "#household" },
          { label: "Docs", icon: <FileTextIcon />, href: "#household" },
          { label: "Lists", icon: <ListIcon />, href: "#household", sidebar: false },
          {
            label: "Chats",
            icon: <MessageCircleIcon />,
            onSelect: () => setView("chat"),
            active: view === "chat",
            tab: false,
          },
          { label: "Settings", icon: <SettingsIcon />, href: "#settings", tab: false },
        ]}
        group={{ label: "Lists", href: "#household", items: lists, onAdd: () => {}, addLabel: "New list" }}
        action={{
          label: "New to-do",
          icon: <PlusIcon />,
          onSelect: () => document.querySelector<HTMLInputElement>("[data-slot=sectioned-list-add] input")?.focus(),
        }}
        footer={
          <UserMenu name="Maya Chen" color={1} subtitle="The Chen household">
            <DropdownMenuItem asChild>
              <a href="#settings">
                <SettingsIcon />
                Settings
              </a>
            </DropdownMenuItem>
          </UserMenu>
        }
      >
        {view === "chat" ? (
          <ChatPage />
        ) : (
          <>
            <TodayPage />
            <AssistantDock
              title="HomeBot"
              fullScreenHref="#household"
              actions={<DockNewChat />}
              emptyDescription="I can add to-dos, plan the week and find things in your docs."
            />
          </>
        )}
      </AppNav>
    </AssistantProvider>
  )
}
