import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import {
  ActionReceipt,
  AppNav,
  AskBox,
  AssistantDock,
  AssistantProvider,
  CheckCircle,
  Collapse,
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
