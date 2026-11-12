import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  Celebration,
  celebrate,
  DateTimePicker,
  type DateTimeValue,
  DetailSheet,
  LoginForm,
  MarkdownEditor,
  PasswordInput,
  Prose,
  ProseBlockquote,
  SignupForm,
} from "@/index"

// jsdom has no pointer capture; vaul's Drawer calls it on pointer down.
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}

const realMatchMedia = window.matchMedia
function matchMediaWhere(matches: (query: string) => boolean) {
  window.matchMedia = (query: string) =>
    ({ ...realMatchMedia(query), matches: matches(query), media: query }) as MediaQueryList
}
afterEach(() => {
  window.matchMedia = realMatchMedia
  vi.useRealTimers()
})

function Editor() {
  const [md, setMd] = useState("")
  return (
    <MarkdownEditor
      aria-label="Body"
      value={md}
      onValueChange={setMd}
      renderPreview={(text) => <h1>{text.replace(/^# /, "")}</h1>}
    />
  )
}

function Picker({ onChange }: { onChange: (v: DateTimeValue | null) => void }) {
  const [value, setValue] = useState<DateTimeValue | null>({ date: "2026-11-11" })
  return (
    <DateTimePicker
      aria-label="When"
      withTime
      value={value}
      onValueChange={(v) => {
        onChange(v)
        setValue(v)
      }}
    />
  )
}

describe("PasswordInput", () => {
  it("switches between password and text with Show and Hide", async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" />)
    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")
    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("is used for every password field in LoginForm and SignupForm", () => {
    const { unmount } = render(<LoginForm />)
    expect(screen.getAllByRole("button", { name: "Show password" })).toHaveLength(1)
    unmount()
    render(<SignupForm />)
    expect(screen.getAllByRole("button", { name: "Show password" })).toHaveLength(2)
  })
})

describe("Prose tips", () => {
  it("renders a blockquote starting with Tip: as a Callout without the word", () => {
    render(
      <Prose>
        <blockquote>
          <p>Tip: Turn the power off first.</p>
        </blockquote>
        <blockquote>
          <p>Just a quote.</p>
        </blockquote>
      </Prose>,
    )
    const callout = document.querySelector("[data-slot=callout]")
    expect(callout).toHaveTextContent(/^Turn the power off first\.$/)
    expect(screen.getByText("Just a quote.").closest("blockquote")).toBeInTheDocument()
    expect(document.querySelectorAll("blockquote")).toHaveLength(1)
  })

  it("ProseBlockquote works as a react-markdown component and drops the node prop", () => {
    render(
      <ProseBlockquote node={{}}>
        {"\n"}
        <p>Tip: Check the filter.</p>
        {"\n"}
      </ProseBlockquote>,
    )
    expect(document.querySelector("[data-slot=callout]")).toHaveTextContent("Check the filter.")
  })
})

describe("MarkdownEditor", () => {
  it("edits in Write and renders the Markdown inside Prose in Preview", async () => {
    const user = userEvent.setup()
    render(<Editor />)
    await user.type(screen.getByRole("textbox", { name: "Body" }), "# Furnace")
    await user.click(screen.getByRole("tab", { name: "Preview" }))
    const heading = await screen.findByRole("heading", { level: 1, name: "Furnace" })
    expect(heading.closest("[data-slot=prose]")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "Write" }))
    expect(screen.getByRole("textbox", { name: "Body" })).toHaveValue("# Furnace")
  })
})

describe("DateTimePicker", () => {
  it("picks a date, adds a time, and clears", async () => {
    const user = userEvent.setup()
    const changes: (DateTimeValue | null)[] = []
    render(<Picker onChange={(v) => changes.push(v)} />)
    await user.click(screen.getByRole("button", { name: "When" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: /November 12/ }))
    expect(changes.at(-1)).toEqual({ date: "2026-11-12" })
    const time = within(dialog).getByLabelText("Time")
    await user.type(time, "09:30")
    expect(changes.at(-1)).toEqual({ date: "2026-11-12", time: "09:30" })
    await user.click(within(dialog).getByRole("button", { name: "Clear" }))
    expect(changes.at(-1)).toBeNull()
    expect(screen.getByRole("button", { name: "When" })).toHaveTextContent("Pick a date")
  })
})

describe("DetailSheet", () => {
  it("is a side sheet from 768px up", async () => {
    matchMediaWhere((q) => q === "(min-width: 768px)")
    render(
      <DetailSheet open onOpenChange={() => {}} title="To-do">
        <p>Fields</p>
      </DetailSheet>,
    )
    const dialog = await screen.findByRole("dialog", { name: "To-do" })
    expect(dialog).toHaveAttribute("data-layout", "sheet")
    expect(within(dialog).getByText("Fields")).toBeInTheDocument()
  })

  it("is a full-screen drawer with a close button on phones", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <DetailSheet open onOpenChange={onOpenChange} title="To-do">
        <p>Fields</p>
      </DetailSheet>,
    )
    const dialog = await screen.findByRole("dialog", { name: "To-do" })
    expect(dialog).toHaveAttribute("data-layout", "drawer")
    expect(dialog).toHaveClass("h-dvh")
    await user.click(within(dialog).getByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe("Celebration", () => {
  it("shows one burst on celebrate() and removes it after it plays", () => {
    vi.useFakeTimers()
    render(<Celebration />)
    expect(document.querySelector("[data-slot=celebration]")).toBeNull()
    act(() => celebrate())
    expect(document.querySelectorAll("[data-slot=celebration]")).toHaveLength(1)
    act(() => vi.advanceTimersByTime(2000))
    expect(document.querySelector("[data-slot=celebration]")).toBeNull()
  })

  it("does nothing under prefers-reduced-motion", () => {
    matchMediaWhere((q) => q.includes("prefers-reduced-motion"))
    render(<Celebration />)
    act(() => celebrate())
    expect(document.querySelector("[data-slot=celebration]")).toBeNull()
  })
})
