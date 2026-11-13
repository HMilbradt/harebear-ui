import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  AuthForm,
  Celebration,
  TaskRow,
  Combobox,
  ComboboxInput,
  CopyField,
  celebrate,
  DateTimePicker,
  type DateTimeValue,
  DetailSheet,
  LoginForm,
  MarkdownEditor,
  NewPasswordForm,
  PasswordInput,
  PromptDialog,
  Prose,
  ProseBlockquote,
  SignupForm,
  TimeZonePicker,
  Toaster,
  toast,
  toastUndo,
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

  it("moves toasts left of the open side sheet, counted across sheets, and clears it on close", () => {
    matchMediaWhere((q) => q === "(min-width: 768px)")
    const root = document.documentElement
    const sheets = (a: boolean, b: boolean) => (
      <>
        <DetailSheet open={a} onOpenChange={() => {}} title="A">
          <p>A</p>
        </DetailSheet>
        <DetailSheet open={b} onOpenChange={() => {}} title="B">
          <p>B</p>
        </DetailSheet>
      </>
    )
    const { rerender, unmount } = render(sheets(false, false))
    expect(root.style.getPropertyValue("--hb-toast-sheet")).toBe("")
    rerender(sheets(true, false))
    expect(root.style.getPropertyValue("--hb-toast-sheet")).toBe("calc(min(420px, 100vw - 32px) + 1rem)")
    expect(root.style.getPropertyValue("--hb-toast-drawer")).toBe("")
    rerender(sheets(true, true))
    rerender(sheets(false, true))
    expect(root.style.getPropertyValue("--hb-toast-sheet")).not.toBe("")
    rerender(sheets(false, false))
    expect(root.style.getPropertyValue("--hb-toast-sheet")).toBe("")
    unmount()
  })

  it("lifts toasts above the open drawer's footer on phones, in place of the tab bar's space", () => {
    const root = document.documentElement
    const sheet = (open: boolean, footer?: React.ReactNode) => (
      <DetailSheet open={open} onOpenChange={() => {}} title="To-do" footer={footer}>
        <p>Fields</p>
      </DetailSheet>
    )
    const { rerender, unmount } = render(sheet(true, <button type="button">Delete</button>))
    expect(root.style.getPropertyValue("--hb-toast-drawer")).toBe(
      "calc(3.5625rem + max(1rem, env(safe-area-inset-bottom)))",
    )
    expect(root.style.getPropertyValue("--hb-toast-sheet")).toBe("")
    rerender(sheet(true))
    expect(root.style.getPropertyValue("--hb-toast-drawer")).toBe("env(safe-area-inset-bottom, 0px)")
    rerender(sheet(false))
    expect(root.style.getPropertyValue("--hb-toast-drawer")).toBe("")
    unmount()
  })

  it.each([
    ["side sheet", true],
    ["phone drawer", false],
  ])("keeps a toast's Undo clickable while the %s is open, and stays open", async (_, desktop) => {
    matchMediaWhere((q) => desktop && q === "(min-width: 768px)")
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onUndo = vi.fn()
    const { unmount } = render(
      <>
        <Toaster />
        <DetailSheet open onOpenChange={onOpenChange} title="To-do">
          <p>Fields</p>
        </DetailSheet>
      </>,
    )
    await screen.findByRole("dialog", { name: "To-do" })
    act(() => {
      toastUndo("Moved to Done", { onUndo })
    })
    // The modal hides the rest of the page from assistive tech, so the toast is found with hidden: true.
    await user.click(await screen.findByRole("button", { name: "Undo", hidden: true }))
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog", { name: "To-do" })).toBeInTheDocument()
    act(() => toast.dismiss())
    unmount()
  })
})

function CelebrationTaskRow() {
  const [done, setDone] = useState(false)
  return <TaskRow title="Take out the bins" checked={done} onCheckedChange={setDone} />
}

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

  it("only plays on demand: ticking a TaskRow or CheckCircle does not fire it", async () => {
    const user = userEvent.setup()
    render(
      <>
        <Celebration />
        <CelebrationTaskRow />
      </>,
    )
    await user.click(screen.getByRole("checkbox", { name: "Take out the bins" }))
    expect(screen.getByRole("checkbox", { name: "Take out the bins" })).toBeChecked()
    expect(document.querySelector("[data-slot=celebration]")).toBeNull()
  })

  it("does nothing under prefers-reduced-motion", () => {
    matchMediaWhere((q) => q.includes("prefers-reduced-motion"))
    render(<Celebration />)
    act(() => celebrate())
    expect(document.querySelector("[data-slot=celebration]")).toBeNull()
  })
})

describe("CopyField", () => {
  it("says copiedLabel on the button and next to it for a moment after copying", async () => {
    const user = userEvent.setup()
    const { container } = render(<CopyField value="abc-123" aria-label="ID" copiedLabel="Copied!" />)
    await user.click(screen.getByRole("button", { name: "Copy id" }))
    expect(await navigator.clipboard.readText()).toBe("abc-123")
    expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=copy-field-status]")).toHaveTextContent("Copied!")
  })

  it("defaults copiedLabel to Copied and shows nothing before copying", async () => {
    const user = userEvent.setup()
    const { container } = render(<CopyField value="x" />)
    expect(container.querySelector("[data-slot=copy-field-status]")).toBeEmptyDOMElement()
    await user.click(screen.getByRole("button", { name: "Copy value" }))
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()
  })
})

describe("ComboboxInput", () => {
  it("names its built-in trigger button", () => {
    render(
      <Combobox items={["Apple"]}>
        <ComboboxInput aria-label="Fruit" />
      </Combobox>,
    )
    expect(screen.getByRole("button", { name: "Show options" })).toBeInTheDocument()
  })
})

describe("AuthForm", () => {
  it("passes its fields as FormData once they are valid", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AuthForm title="Join" submitLabel="Join" onSubmit={onSubmit}>
        <label htmlFor="code">Invite code</label>
        <input id="code" name="code" required />
      </AuthForm>,
    )
    expect(screen.getByRole("heading", { name: "Join" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Join" }))
    expect(onSubmit).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText("Invite code"), "abc")
    await user.click(screen.getByRole("button", { name: "Join" }))
    expect((onSubmit.mock.calls[0]![0] as FormData).get("code")).toBe("abc")
  })

  it("disables every control while loading and shows the error", () => {
    render(
      <AuthForm title="Join" submitLabel="Join" loading error="Link expired">
        <input aria-label="Code" name="code" />
      </AuthForm>,
    )
    expect(screen.getByLabelText("Code")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Join" })).toBeDisabled()
    expect(screen.getByText("Link expired")).toBeInTheDocument()
  })
})

describe("SignupForm leading fields", () => {
  it("shows children before the name field and passes them in FormData", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <SignupForm confirmPassword={false} onSubmit={onSubmit}>
        <input aria-label="Home name" name="householdName" required />
      </SignupForm>,
    )
    const inputs = screen.getAllByRole("textbox")
    expect(inputs[0]).toBe(screen.getByLabelText("Home name"))
    await user.type(screen.getByLabelText("Home name"), "Maple St")
    await user.type(screen.getByLabelText("Full name"), "Ada")
    await user.type(screen.getByLabelText("Email"), "a@b.co")
    await user.type(screen.getByLabelText("Password"), "longpassword")
    await user.click(screen.getByRole("button", { name: "Create account" }))
    const [values, data] = onSubmit.mock.calls[0] as [unknown, FormData]
    expect(values).toEqual({ name: "Ada", email: "a@b.co", password: "longpassword" })
    expect(data.get("householdName")).toBe("Maple St")
  })
})

describe("NewPasswordForm", () => {
  it("submits only when both fields match and are long enough", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<NewPasswordForm minPasswordLength={10} onSubmit={onSubmit} />)
    expect(screen.getByText("At least 10 characters.")).toBeInTheDocument()
    expect(screen.getByLabelText("New password")).toHaveAttribute("minlength", "10")
    await user.type(screen.getByLabelText("New password"), "longpassword")
    await user.type(screen.getByLabelText("Confirm password"), "longpasswore")
    await user.click(screen.getByRole("button", { name: "Save password" }))
    expect(onSubmit).not.toHaveBeenCalled()
    await user.clear(screen.getByLabelText("Confirm password"))
    await user.type(screen.getByLabelText("Confirm password"), "longpassword")
    await user.click(screen.getByRole("button", { name: "Save password" }))
    expect(onSubmit).toHaveBeenCalledWith({ password: "longpassword" })
  })
})

function PromptHarness({ onSubmit }: { onSubmit: (value: string) => void | Promise<void> }) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <PromptDialog
        open={open}
        onOpenChange={setOpen}
        title="Rename list"
        label="Name"
        defaultValue="Groceries"
        submitLabel="Rename"
        maxLength={20}
        onSubmit={onSubmit}
      />
    </>
  )
}

describe("PromptDialog", () => {
  it("shows a thrown error under the field, then closes on success", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("That name is taken")).mockResolvedValueOnce(undefined)
    render(<PromptHarness onSubmit={onSubmit} />)
    const field = await screen.findByLabelText("Name")
    expect(field).toHaveValue("Groceries")
    expect(field).toHaveAttribute("maxlength", "20")
    await user.clear(field)
    expect(screen.getByRole("button", { name: "Rename" })).toBeDisabled()
    await user.type(field, "  Food  ")
    await user.click(screen.getByRole("button", { name: "Rename" }))
    expect(onSubmit).toHaveBeenLastCalledWith("Food")
    expect(await screen.findByText("That name is taken")).toBeInTheDocument()
    expect(field).toHaveAttribute("aria-invalid", "true")
    await user.click(screen.getByRole("button", { name: "Rename" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("starts fresh on reopen and accepts a synchronous handler", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn<(value: string) => void>(() => {
      throw new Error("That name is taken")
    })
    render(<PromptHarness onSubmit={onSubmit} />)
    const field = await screen.findByLabelText("Name")
    await user.clear(field)
    await user.type(field, "Food")
    await user.click(screen.getByRole("button", { name: "Rename" }))
    expect(await screen.findByText("That name is taken")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Open" }))
    const reopened = await screen.findByLabelText("Name")
    expect(reopened).toHaveValue("Groceries")
    expect(reopened).not.toHaveAttribute("aria-invalid")
    expect(screen.queryByText("That name is taken")).not.toBeInTheDocument()
  })
})

describe("TimeZonePicker", () => {
  it("filters IANA zones and reports the chosen one", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimeZonePicker id="tz" value="UTC" onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("id", "tz")
    await user.clear(input)
    await user.type(input, "vancouver")
    await user.click(await screen.findByRole("option", { name: "America/Vancouver" }))
    expect(onValueChange).toHaveBeenCalledWith("America/Vancouver")
  })

  it("keeps a value that is not in the supported list, such as an alias", async () => {
    const user = userEvent.setup()
    render(<TimeZonePicker value="US/Pacific" onValueChange={() => {}} />)
    const input = screen.getByRole("combobox")
    expect(input).toHaveValue("US/Pacific")
    await user.clear(input)
    await user.type(input, "US/Pac")
    expect(await screen.findByRole("option", { name: "US/Pacific" })).toBeInTheDocument()
  })
})

describe("toast", () => {
  it("is sonner's toast, shown by the harebear Toaster", async () => {
    render(<Toaster />)
    act(() => {
      toast.success("Saved")
      toast.error("Could not save")
    })
    expect(await screen.findByText("Saved")).toBeInTheDocument()
    expect(screen.getByText("Could not save")).toBeInTheDocument()
  })
})
