import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  ActionReceipt,
  AgendaRow,
  AppNav,
  AskBox,
  AssistantDock,
  AssistantProvider,
  type AssistantSendContext,
  CheckCircle,
  Collapse,
  DayStrip,
  DictationButton,
  FocusLayout,
  SectionedList,
  type SectionedListSection,
  SettingsRow,
  SettingsSection,
  type SpeechSource,
  type SpeechSourceHandlers,
  TaskRow,
  ThemeProvider,
  useAssistant,
  useAssistantPage,
} from "@/index"

function fakeSpeech() {
  let handlers: SpeechSourceHandlers | null = null
  const stop = vi.fn(() => handlers?.onEnd())
  const source: SpeechSource = {
    isSupported: () => true,
    start: (h) => {
      handlers = h
      return stop
    },
  }
  return { source, stop, say: (text: string) => act(() => handlers?.onResult(text, true)) }
}

describe("CheckCircle", () => {
  it("is a 24px checkbox that toggles and pops when ticked", async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<CheckCircle aria-label="Buy milk" onCheckedChange={onCheckedChange} tone="important" />)
    const box = screen.getByRole("checkbox", { name: "Buy milk" })
    expect(box).toHaveClass("size-6")
    expect(box).toHaveAttribute("data-tone", "important")
    await user.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box).toHaveAttribute("data-pop")
  })

  it("pops and fades only when motion is allowed", () => {
    render(<CheckCircle aria-label="Buy milk" />)
    const box = screen.getByRole("checkbox")
    expect(box).toHaveClass("motion-safe:data-[pop]:animate-check-pop", "motion-reduce:transition-none")
    expect(box.className).not.toMatch(/(^|\s)data-\[pop\]:animate-check-pop/)
  })

  it("has a 44px hit area and a solid focus outline that tone does not override", () => {
    render(<CheckCircle aria-label="Buy milk" tone="important" />)
    const box = screen.getByRole("checkbox")
    // ::after is placed against the padding box (inside the 2px border): 20px + 2 * 12px = 44px.
    expect(box).toHaveClass("size-6", "border-2", "after:-inset-3")
    expect(box).toHaveClass("focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary")
    expect(box.className).not.toMatch(/focus-visible:(border|ring)-/)
  })
})

describe("TaskRow", () => {
  it("names the check after the title and opens from the title", async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const onOpen = vi.fn()
    render(
      <TaskRow
        title="Book dentist"
        meta="Tomorrow"
        checked={false}
        onCheckedChange={onCheckedChange}
        onOpen={onOpen}
        assignee={{ name: "Maya Chen" }}
      />,
    )
    await user.click(screen.getByRole("checkbox", { name: "Book dentist" }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    await user.click(screen.getByRole("button", { name: "Book dentist" }))
    expect(onOpen).toHaveBeenCalled()
    expect(screen.getByRole("img", { name: "Maya Chen" })).toBeInTheDocument()
  })
})

describe("Collapse", () => {
  it("hides and inerts closed content", () => {
    const { rerender } = render(<Collapse open>Body</Collapse>)
    const el = screen.getByText("Body").parentElement!
    expect(el).toHaveAttribute("data-state", "open")
    expect(el).not.toHaveAttribute("inert")
    rerender(<Collapse open={false}>Body</Collapse>)
    expect(el).toHaveAttribute("data-state", "closed")
    expect(el).toHaveAttribute("aria-hidden", "true")
    expect(el).toHaveAttribute("inert")
  })

  it("clips only vertically, so hit areas and focus rings at the sides are not cut off", () => {
    render(<Collapse open>Body</Collapse>)
    const inner = screen.getByText("Body")
    expect(inner).toHaveClass("overflow-y-clip", "overflow-x-visible", "min-w-0")
    expect(inner).not.toHaveClass("overflow-hidden")
  })
})

function ListHarness({ onAdd }: { onAdd?: (t: string) => void }) {
  const [sections, setSections] = useState<SectionedListSection[]>([
    {
      id: "today",
      title: "Today",
      items: [
        { id: "a", title: "Milk" },
        { id: "b", title: "Bread", done: true },
      ],
    },
  ])
  return (
    <SectionedList
      sections={sections}
      onAdd={onAdd}
      empty={<p>All done</p>}
      onToggle={(id, done) =>
        setSections((s) =>
          s.map((sec) => ({ ...sec, items: sec.items.map((i) => (i.id === id ? { ...i, done } : i)) })),
        )
      }
    />
  )
}

describe("SectionedList", () => {
  it("adds, folds done items behind a toggle and shows the empty state", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onAdd = vi.fn()
    render(<ListHarness onAdd={onAdd} />)
    await user.type(screen.getByLabelText("Add a to-do"), "Eggs{Enter}")
    expect(onAdd).toHaveBeenCalledWith("Eggs")
    expect(screen.getByLabelText("Add a to-do")).toHaveValue("")

    const toggle = screen.getByRole("button", { name: "Show 1 done" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await user.click(screen.getByRole("checkbox", { name: "Milk" }))
    act(() => vi.advanceTimersByTime(700))
    expect(screen.getByRole("button", { name: "Show 2 done" })).toBeInTheDocument()
    expect(screen.getByText("All done")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Show 2 done" }))
    expect(screen.getByRole("button", { name: "Hide done" })).toHaveAttribute("aria-expanded", "true")
    vi.useRealTimers()
  })
})

function LingerHarness() {
  const [done, setDone] = useState(false)
  return (
    <SectionedList
      lingerMs={9000}
      sections={[{ id: "today", items: [{ id: "a", title: "Milk", done }] }]}
      onToggle={(_, v) => setDone(v)}
    />
  )
}

describe("SectionedList options", () => {
  it("keeps a ticked row for lingerMs, then folds it away", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<LingerHarness />)
    // The first match is the row in its section; once it folds away it also appears under "Show 1 done".
    const row = () => screen.getAllByText("Milk")[0]?.closest("[data-slot=collapse]")
    await user.click(screen.getByRole("checkbox", { name: "Milk" }))
    act(() => vi.advanceTimersByTime(8000))
    expect(row()).toHaveAttribute("data-state", "open")
    act(() => vi.advanceTimersByTime(1100))
    expect(row()).toHaveAttribute("data-state", "closed")
    vi.useRealTimers()
  })

  it("puts the section id on the section, an action in its heading and keeps empty sections", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    const { container } = render(
      <SectionedList
        sections={[
          {
            id: "overdue",
            title: "Overdue",
            action: (
              <button type="button" onClick={onMove}>
                Move to today
              </button>
            ),
            items: [{ id: "a", title: "Bins" }],
          },
          {
            id: "day-sat",
            title: "Saturday",
            empty: "Nothing planned",
            items: [{ id: "b", title: "Mow", done: true }],
          },
        ]}
        onToggle={() => {}}
      />,
    )
    const overdue = screen.getByRole("region", { name: "Overdue" })
    expect(overdue).toHaveAttribute("id", "overdue")
    await user.click(within(overdue).getByRole("button", { name: "Move to today" }))
    expect(onMove).toHaveBeenCalled()
    const sat = container.querySelector("#day-sat")
    expect(sat?.closest("[data-slot=collapse]")).toHaveAttribute("data-state", "open")
    expect(within(sat as HTMLElement).getByText("Nothing planned")).toBeVisible()
  })

  it("shows add box chips from the typed text", async () => {
    const user = userEvent.setup()
    const addChips = vi.fn((text: string) => (/tomorrow/.test(text) ? <span>Tomorrow</span> : null))
    render(<SectionedList sections={[]} onToggle={() => {}} onAdd={() => {}} addChips={addChips} />)
    expect(addChips).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText("Add a to-do"), "Bins tomorrow")
    expect(addChips).toHaveBeenLastCalledWith("Bins tomorrow")
    expect(screen.getByText("Tomorrow")).toBeInTheDocument()
  })

  it("draws rows with renderItem; events stay, to-dos tick through toggle", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    type Row = { id: string; title: string; done?: boolean; kind: "todo" | "event"; time: string }
    const items: Row[] = [
      { id: "e", title: "Hockey", kind: "event", time: "10:00" },
      { id: "t", title: "Clean the gutters", kind: "todo", time: "All day", done: false },
    ]
    render(
      <SectionedList<Row>
        sections={[{ id: "sat", title: "Saturday", items }]}
        onToggle={onToggle}
        renderItem={(item, toggle) =>
          item.kind === "event" ? (
            <AgendaRow title={item.title} time={item.time} />
          ) : (
            <AgendaRow title={item.title} time={item.time} checked={!!item.done} onCheckedChange={toggle} />
          )
        }
      />,
    )
    expect(screen.getByText("Hockey").closest("[data-slot=agenda-row]")).toBeInTheDocument()
    await user.click(screen.getByRole("checkbox", { name: "Clean the gutters" }))
    expect(onToggle).toHaveBeenCalledWith("t", true)
  })
})

describe("AgendaRow", () => {
  it("shows an event icon without a check, a check for to-dos, whose name and opens from the title", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const { rerender } = render(
      <AgendaRow time="3:15" title="School pickup" who={{ name: "Harrison", color: 2 }} onOpen={onOpen} />,
    )
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    expect(screen.getByText("3:15")).toBeInTheDocument()
    expect(screen.getByText("Harrison")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "School pickup" }))
    expect(onOpen).toHaveBeenCalled()
    const onCheckedChange = vi.fn()
    rerender(<AgendaRow title="Gutters" checked={false} onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByRole("checkbox", { name: "Gutters" }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})

describe("DayStrip", () => {
  // jsdom has no scrollIntoView: stub it once, spy per test, restore after each.
  Element.prototype.scrollIntoView ??= () => {}
  const realMatchMedia = window.matchMedia
  afterEach(() => {
    window.matchMedia = realMatchMedia
    vi.restoreAllMocks()
  })

  it("jumps to the day's element, marks the selected day and says which days have plans", async () => {
    const user = userEvent.setup()
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {})
    const onValueChange = vi.fn()
    render(
      <>
        <DayStrip
          value="d11"
          onValueChange={onValueChange}
          days={[
            { id: "d11", date: "2026-11-11", hasPlans: true },
            { id: "d12", date: "2026-11-12" },
          ]}
        />
        <section id="d12">Thursday</section>
      </>,
    )
    const nav = screen.getByRole("navigation", { name: "Jump to a day" })
    const links = within(nav).getAllByRole("link")
    expect(links[0]).toHaveAttribute("aria-current", "true")
    expect(links[0]).toHaveAccessibleName(/has plans$/)
    expect(links[1]).not.toHaveAccessibleName(/has plans/)
    // The full date is visually hidden text, not an aria-label that drops the visible "Thu 12".
    for (const link of links) expect(link).not.toHaveAttribute("aria-label")
    expect(links[1]!.querySelector(".sr-only")).toHaveTextContent(/12/)
    // A floating date is local: "2026-11-12" shows 12 in any time zone.
    expect(links[1]).toHaveTextContent("12")
    expect(links[1]).not.toHaveTextContent("11")
    await user.click(links[1] as HTMLElement)
    expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "start" })
    expect(onValueChange).toHaveBeenCalledWith("d12")
    expect(document.activeElement).toBe(document.getElementById("d12"))
  })

  it("jumps without smooth scrolling under reduced motion", async () => {
    const user = userEvent.setup()
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {})
    window.matchMedia = (query: string) =>
      ({ ...realMatchMedia(query), matches: query.includes("prefers-reduced-motion"), media: query }) as MediaQueryList
    render(
      <>
        <DayStrip days={[{ id: "d13", date: "2026-11-13" }]} />
        <section id="d13">Friday</section>
      </>,
    )
    await user.click(screen.getByRole("link"))
    expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" })
  })
})

describe("DictationButton", () => {
  it("is a mic when empty, stop while listening, send with text", async () => {
    const user = userEvent.setup()
    const speech = fakeSpeech()
    const onTranscript = vi.fn()
    const onSend = vi.fn()
    const { rerender } = render(
      <DictationButton value="" source={speech.source} onTranscript={onTranscript} onSend={onSend} />,
    )
    await user.click(screen.getByRole("button", { name: "Dictate" }))
    expect(screen.getByRole("status")).toHaveTextContent("Listening")
    speech.say("buy milk")
    expect(onTranscript).toHaveBeenCalledWith("buy milk")
    await user.click(screen.getByRole("button", { name: "Stop dictation" }))
    expect(speech.stop).toHaveBeenCalled()
    expect(screen.getByRole("status")).toHaveTextContent("")
    rerender(<DictationButton value="buy milk" source={speech.source} onTranscript={onTranscript} onSend={onSend} />)
    await user.click(screen.getByRole("button", { name: "Send message" }))
    expect(onSend).toHaveBeenCalled()
  })

  it("hides the mic without a supported source", () => {
    render(
      <DictationButton value="" source={{ isSupported: () => false, start: () => () => {} }} onTranscript={() => {}} />,
    )
    expect(screen.queryByRole("button", { name: "Dictate" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled()
  })
})

function AskHarness({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [v, setV] = useState("")
  return (
    <AskBox
      value={v}
      onValueChange={setV}
      onSubmit={onSubmit}
      dictation={false}
      chips={<span>Tomorrow</span>}
      suggestions={["What's on today?"]}
    />
  )
}

describe("AskBox", () => {
  it("submits on Enter, shows chips while typing and sends suggestions", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AskHarness onSubmit={onSubmit} />)
    expect(screen.queryByText("Tomorrow")).not.toBeInTheDocument()
    await user.type(screen.getByLabelText("Ask anything"), "Dentist tomorrow")
    expect(screen.getByText("Tomorrow")).toBeInTheDocument()
    await user.keyboard("{Enter}")
    expect(onSubmit).toHaveBeenCalledWith("Dentist tomorrow")
    await user.click(screen.getByRole("button", { name: "What's on today?" }))
    expect(onSubmit).toHaveBeenCalledWith("What's on today?")
  })
})

function StoppableAskBox() {
  const [v, setV] = useState("Plan my day")
  const [pending, setPending] = useState(false)
  return (
    <AskBox
      value={v}
      onValueChange={setV}
      onSubmit={() => setPending(true)}
      dictation={false}
      pending={pending}
      onStop={() => setPending(false)}
    />
  )
}

describe("AskBox stop and reply", () => {
  it("swaps send for Stop while pending, blocks Enter and calls onStop", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onStop = vi.fn()
    render(
      <AskBox
        value="Plan my day"
        onValueChange={() => {}}
        onSubmit={onSubmit}
        dictation={false}
        pending
        onStop={onStop}
      />,
    )
    expect(screen.queryByRole("button", { name: "Send message" })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText("Ask anything"), "{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it("keeps focus in the field after Send and after Stop", async () => {
    const user = userEvent.setup()
    render(<StoppableAskBox />)
    const field = screen.getByLabelText("Ask anything")
    await user.click(screen.getByRole("button", { name: "Send message" }))
    expect(document.activeElement).toBe(field)
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(document.activeElement).toBe(field)
  })

  it("shows the answer under the box with an Open chat link, and a typing indicator while waiting", () => {
    const props = { value: "", onValueChange: () => {}, onSubmit: () => {}, dictation: false as const }
    const { container, rerender } = render(<AskBox {...props} />)
    expect(container.querySelector("[data-slot=ask-box-reply]")).toBeNull()
    rerender(<AskBox {...props} pending reply={null} />)
    expect(screen.getByText("Working")).toBeInTheDocument()
    rerender(<AskBox {...props} reply={<p>Riley has soccer at 4:30.</p>} chatHref="/chat/7" />)
    const region = container.querySelector<HTMLElement>("[data-slot=ask-box-reply]")!
    expect(within(region).getByText("Riley has soccer at 4:30.")).toBeInTheDocument()
    expect(within(region).getByRole("link", { name: "Open chat" })).toHaveAttribute("href", "/chat/7")
  })
})

function InlineAsk() {
  const { send, pending, stop, reply, open } = useAssistant()
  const [v, setV] = useState("")
  return (
    <>
      <AskBox
        value={v}
        onValueChange={setV}
        onSubmit={(text) => {
          setV("")
          void send(text, { open: false })
        }}
        dictation={false}
        pending={pending}
        onStop={stop}
        reply={reply}
      />
      <p>{open ? "dock open" : "dock closed"}</p>
    </>
  )
}

describe("useAssistant inline reply and stop", () => {
  it("answers inline without opening the dock", async () => {
    const user = userEvent.setup()
    render(
      <AssistantProvider
        onSend={(text, { append }) => {
          append({ role: "assistant", content: <span>Added {text}</span> })
          return "Anything else?"
        }}
      >
        <InlineAsk />
      </AssistantProvider>,
    )
    await user.type(screen.getByLabelText("Ask anything"), "milk{Enter}")
    expect(await screen.findByText("Anything else?")).toBeInTheDocument()
    expect(screen.getByText("Added milk")).toBeInTheDocument()
    expect(screen.getByText("dock closed")).toBeInTheDocument()
  })

  it("Stop aborts the send signal, ends pending and drops the late reply", async () => {
    const user = userEvent.setup()
    let signal: AbortSignal | undefined
    let finish: (v: string) => void = () => {}
    render(
      <AssistantProvider
        onSend={(_text, ctx) => {
          signal = ctx.signal
          return new Promise<string>((resolve) => {
            finish = resolve
          })
        }}
      >
        <InlineAsk />
      </AssistantProvider>,
    )
    await user.type(screen.getByLabelText("Ask anything"), "slow question{Enter}")
    expect(screen.getByText("Working")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(signal?.aborted).toBe(true)
    expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument()
    await act(async () => finish("too late"))
    expect(screen.queryByText("too late")).not.toBeInTheDocument()
  })

  it("Stop drops streamed appends and updates that arrive after it", async () => {
    const user = userEvent.setup()
    let ctx: AssistantSendContext | undefined
    let streamId = ""
    render(
      <AssistantProvider
        onSend={(_text, c) => {
          ctx = c
          streamId = c.append({ role: "assistant", content: "Thinking" })
          return new Promise<undefined>(() => {})
        }}
      >
        <InlineAsk />
      </AssistantProvider>,
    )
    await user.type(screen.getByLabelText("Ask anything"), "stream it{Enter}")
    expect(screen.getByText("Thinking")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Stop" }))
    act(() => {
      ctx?.update(streamId, "late delta")
      ctx?.append({ role: "assistant", content: "late message" })
    })
    expect(screen.getByText("Thinking")).toBeInTheDocument()
    expect(screen.queryByText("late delta")).not.toBeInTheDocument()
    expect(screen.queryByText("late message")).not.toBeInTheDocument()
  })
})

describe("ActionReceipt", () => {
  it("offers undo, then shows it was undone", async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    const { rerender } = render(<ActionReceipt title="Added milk" meta="Groceries" onUndo={onUndo} />)
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(onUndo).toHaveBeenCalled()
    rerender(<ActionReceipt title="Added milk" onUndo={onUndo} undone />)
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument()
    expect(screen.getByText("Undone")).toBeInTheDocument()
  })
})

function TodayPage() {
  useAssistantPage({ id: "today", title: "Today", suggestions: ["Plan my day"] })
  return null
}

describe("AssistantDock", () => {
  it("opens from the launcher, uses page suggestions, sends with page context and closes on Escape", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn(
      async (text: string, ctx: { page: { title?: string } | null }) => `Done: ${text} on ${ctx.page?.title}`,
    )
    render(
      <AssistantProvider onSend={onSend}>
        <TodayPage />
        <AssistantDock title="HomeBot" dictation={false} />
      </AssistantProvider>,
    )
    await user.click(screen.getByRole("button", { name: "Ask HomeBot" }))
    const dock = screen.getByRole("dialog", { name: "HomeBot" })
    expect(within(dock).getByText("How can I help?")).toBeInTheDocument()
    await user.click(within(dock).getByRole("button", { name: "Plan my day" }))
    expect(await within(dock).findByText("Done: Plan my day on Today")).toBeInTheDocument()
    expect(onSend).toHaveBeenCalledTimes(1)
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ask HomeBot" })).toHaveFocus()
  })

  it("shows Stop while the assistant works and stops it", async () => {
    const user = userEvent.setup()
    let signal: AbortSignal | undefined
    render(
      <AssistantProvider
        defaultOpen
        onSend={(_t, ctx) => {
          signal = ctx.signal
          return new Promise<string>(() => {})
        }}
      >
        <AssistantDock title="HomeBot" dictation={false} />
      </AssistantProvider>,
    )
    await user.type(screen.getByLabelText("Ask HomeBot"), "Is my show ready?{Enter}")
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(signal?.aborted).toBe(true)
    expect(screen.queryByText("Working")).not.toBeInTheDocument()
  })
})

describe("AppNav", () => {
  it("renders places in the sidebar and up to 5 tabs with the active one marked", () => {
    const places = ["Today", "Upcoming", "Calendar", "Docs", "Chats", "Settings"].map((label) => ({
      label,
      href: `/${label.toLowerCase()}`,
      active: label === "Today",
      count: label === "Today" ? 3 : undefined,
    }))
    render(
      <ThemeProvider>
        <AppNav
          places={places}
          group={{
            label: "Lists",
            items: [{ label: "Groceries", href: "/l/1" }],
            onAdd: () => {},
            addLabel: "New list",
          }}
          action={{ label: "New to-do", icon: <span />, onSelect: () => {} }}
        >
          <p>Page</p>
        </AppNav>
      </ThemeProvider>,
    )
    const navs = screen.getAllByRole("navigation", { name: "Main" })
    const tabs = navs.find((n) => n.dataset.slot === "app-nav-tabs")!
    expect(within(tabs).getAllByRole("link")).toHaveLength(5)
    expect(within(tabs).getByRole("link", { name: /Today/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getAllByRole("button", { name: "New to-do" }).length).toBeGreaterThan(0)
    expect(screen.getByText("Page")).toBeInTheDocument()
  })

  it("keeps sidebar: false places and actions out of the desktop sidebar", () => {
    const { container } = render(
      <ThemeProvider>
        <AppNav
          places={[
            { label: "Today", href: "/" },
            { label: "Lists", href: "/lists", sidebar: false },
          ]}
          action={{ label: "New chat", icon: <span />, onSelect: () => {}, sidebar: false }}
        />
      </ThemeProvider>,
    )
    const sidebar = container.querySelector<HTMLElement>("[data-slot=app-nav]")!
    const tabs = container.querySelector<HTMLElement>("[data-slot=app-nav-tabs]")!
    expect(within(sidebar).queryByRole("link", { name: "Lists" })).not.toBeInTheDocument()
    expect(within(tabs).getByRole("link", { name: "Lists" })).toHaveAttribute("href", "/lists")
    const buttons = screen.getAllByRole("button", { name: "New chat" })
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveAttribute("data-slot", "app-nav-fab")
  })

  it("pads the main column past the round action button only when there is one", () => {
    const main = (action?: boolean) => {
      const { container, unmount } = render(
        <ThemeProvider>
          <AppNav
            places={[{ label: "Today", href: "/" }]}
            action={action ? { label: "New", icon: <span />, onSelect: () => {} } : undefined}
          >
            <p>Page</p>
          </AppNav>
        </ThemeProvider>,
      )
      const cls = container.querySelector("[data-slot=sidebar-layout]")!.className
      unmount()
      return cls
    }
    expect(main(true)).toContain("max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]")
    expect(main(true)).not.toContain("max-md:pb-[calc(4.5rem+env(safe-area-inset-bottom))]")
    expect(main(false)).toContain("max-md:pb-[calc(4.5rem+env(safe-area-inset-bottom))]")
  })
})

describe("Toast clearance", () => {
  it("registers space for the tab bar, action button and launcher while they show, and clears it", async () => {
    const user = userEvent.setup()
    const root = document.documentElement
    const { unmount } = render(
      <ThemeProvider>
        <AssistantProvider onSend={() => "ok"}>
          <AppNav
            places={[{ label: "Today", href: "/" }]}
            action={{ label: "New", icon: <span />, onSelect: () => {} }}
          >
            <AssistantDock title="HomeBot" dictation={false} />
          </AppNav>
        </AssistantProvider>
      </ThemeProvider>,
    )
    expect(root.style.getPropertyValue("--hb-toast-nav")).toContain("4.5rem")
    expect(root.style.getPropertyValue("--hb-toast-fab")).toBe("4.5rem")
    expect(root.style.getPropertyValue("--hb-toast-launcher")).toBe("3.5rem")
    // The open panel replaces the launcher, so its clearance goes away.
    await user.click(screen.getByRole("button", { name: "Ask HomeBot" }))
    expect(root.style.getPropertyValue("--hb-toast-launcher")).toBe("")
    unmount()
    expect(root.style.getPropertyValue("--hb-toast-nav")).toBe("")
    expect(root.style.getPropertyValue("--hb-toast-fab")).toBe("")
  })
})

describe("Settings and FocusLayout", () => {
  it("expands a row's content from its default button", async () => {
    const user = userEvent.setup()
    render(
      <FocusLayout title="Settings" back={<a href="/">Back</a>}>
        <SettingsSection title="Account" description="Your sign-in">
          <SettingsRow label="Password" description="Last changed in May" content={<p>Form</p>} />
        </SettingsSection>
      </FocusLayout>,
    )
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Account" })).toBeInTheDocument()
    const button = screen.getByRole("button", { name: "Change" })
    expect(button).toHaveAttribute("aria-expanded", "false")
    await user.click(button)
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("aria-expanded", "true")
  })
})
