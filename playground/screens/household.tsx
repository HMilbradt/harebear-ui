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
  AppBrand,
  AppNav,
  AssistantDock,
  AssistantProvider,
  type AssistantSendContext,
  type CategoryColor,
  CategoryDot,
  DropdownMenuItem,
  SectionedList,
  type SectionedListSection,
  SidebarTrigger,
  toastUndo,
  useAssistantPage,
  UserMenu,
  VisibilityBadge,
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
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-24 md:pt-10">
      <header className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-2xl font-semibold">Good morning, Maya</h1>
          <p className="text-sm text-muted-foreground">Tuesday, November 11 · {open} to do</p>
        </div>
        <VisibilityBadge visibility="shared" members={household} className="max-sm:hidden" />
      </header>
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
