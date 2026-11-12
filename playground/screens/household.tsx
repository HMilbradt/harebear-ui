import {
  CalendarIcon,
  FileTextIcon,
  HouseIcon,
  ListIcon,
  ListTodoIcon,
  MessageCircleIcon,
  PlusIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react"
import { useState } from "react"
import {
  ActionReceipt,
  AppBrand,
  AppNav,
  AskBox,
  AssistantDock,
  AssistantProvider,
  type AssistantSendContext,
  Badge,
  DropdownMenuItem,
  SectionedList,
  type SectionedListSection,
  SidebarTrigger,
  toastUndo,
  useAssistant,
  useAssistantPage,
  UserMenu,
} from "@/index"

const initial: SectionedListSection[] = [
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
  const assistant = useAssistant()
  const [ask, setAsk] = useState("")
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
        sections={sections}
        onAdd={(title) =>
          setSections((s) =>
            s.map((sec, i) => (i === 0 ? { ...sec, items: [{ id: crypto.randomUUID(), title }, ...sec.items] } : sec)),
          )
        }
        onToggle={(id, done) => {
          setDone(id, done)
          if (done) toastUndo("Marked done", { onUndo: () => setDone(id, false) })
        }}
        empty={<p className="px-2 text-sm text-muted-foreground">Nothing left for today.</p>}
      />
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
          { label: "Lists", icon: <ListIcon />, href: "#household", sidebar: false },
          { label: "Chats", icon: <MessageCircleIcon />, href: "#household", tab: false },
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
