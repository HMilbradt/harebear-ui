import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import {
  ChatPanel,
  ChatShell,
  ConfirmDialog,
  ConversationList,
  DropdownMenuItem,
  groupByDate,
  PromptInputSelect,
  ToolGroup,
  ThemeProvider,
  ToolStep,
  type ToolStatus,
  UserMenu,
} from "@/index"

describe("groupByDate", () => {
  it("buckets newest first and drops empty groups", () => {
    const now = new Date(2026, 10, 10, 12).getTime()
    const day = 24 * 3600 * 1000
    const items = [
      { id: "old", t: now - 30 * day },
      { id: "today", t: now - 1000 },
      { id: "yday", t: now - day },
      { id: "week", t: now - 3 * day },
      { id: "today2", t: now },
    ]
    const groups = groupByDate(
      items,
      (i) => i.t,
      (i) => ({ id: i.id, title: i.id }),
      now,
    )
    expect(groups.map((g) => [g.label, g.items.map((c) => c.id)])).toEqual([
      ["Today", ["today2", "today"]],
      ["Yesterday", ["yday"]],
      ["Previous 7 days", ["week"]],
      ["Earlier", ["old"]],
    ])
    expect(
      groupByDate(
        [],
        () => 0,
        () => ({ id: "", title: "" }),
        now,
      ),
    ).toEqual([])
  })

  it("uses calendar days across a daylight-saving change", () => {
    const tz = process.env.TZ
    process.env.TZ = "America/New_York"
    try {
      // Nov 1 2026 is 25 hours long in New York (clocks fall back at 02:00).
      const now = new Date(2026, 10, 2, 12).getTime()
      const items = [{ id: "nov1-early", t: new Date(2026, 10, 1, 0, 30).getTime() }]
      const groups = groupByDate(
        items,
        (i) => i.t,
        (i) => ({ id: i.id, title: i.id }),
        now,
      )
      expect(groups.map((g) => g.label)).toEqual(["Yesterday"])
    } finally {
      process.env.TZ = tz
    }
  })
})

describe("ConversationList", () => {
  it("renders descriptions and per-row actions, and an empty state", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onDelete = vi.fn()
    const { rerender } = render(
      <ConversationList
        groups={[{ label: "Today", items: [{ id: "a", title: "Disk alert", description: "Working", tone: "info" }] }]}
        activeId="a"
        onSelect={onSelect}
        renderAction={(c) => (
          <button type="button" onClick={() => onDelete(c.id)}>
            Delete {c.title}
          </button>
        )}
      />,
    )
    expect(screen.getByText("Working")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /^Disk alert/ }))
    expect(onSelect).toHaveBeenCalledWith("a")
    await user.click(screen.getByRole("button", { name: "Delete Disk alert" }))
    expect(onDelete).toHaveBeenCalledWith("a")
    rerender(<ConversationList groups={[]} empty="Nothing here" />)
    expect(screen.getByText("Nothing here")).toBeInTheDocument()
  })
})

function ToolHarness() {
  const [status, setStatus] = useState<ToolStatus>("queued")
  return (
    <>
      <button type="button" onClick={() => setStatus("running")}>
        start
      </button>
      <button type="button" onClick={() => setStatus("done")}>
        finish
      </button>
      <ToolGroup title="Ran a command" status={status} autoOpen>
        <ToolStep kind="Run" detail="uptime" status={status} output="up 3 days" />
      </ToolGroup>
    </>
  )
}

describe("ToolStep", () => {
  it("opens while running and keeps the user's choice after a toggle", async () => {
    const user = userEvent.setup()
    render(<ToolHarness />)
    expect(screen.queryByText("up 3 days")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "start" }))
    expect(screen.getByText("up 3 days")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /uptime/ }))
    expect(screen.queryByText("up 3 days")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /uptime/ }))
    await user.click(screen.getByRole("button", { name: "finish" }))
    expect(screen.getByText("up 3 days")).toBeInTheDocument()
  })
})

function ConfirmHarness({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(true)
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title="Delete chat?"
      confirmLabel="Delete"
      destructive
      onConfirm={onConfirm}
    />
  )
}

describe("ConfirmDialog", () => {
  it("confirms and closes", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmHarness onConfirm={onConfirm} />)
    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(screen.queryByText("Delete chat?")).not.toBeInTheDocument()
  })
})

describe("PromptInputSelect", () => {
  it("shows the current option and reports a new choice", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <PromptInputSelect
        value="ask"
        onValueChange={onValueChange}
        label="Permissions"
        options={[
          { value: "ask", label: "Ask before changes" },
          { value: "off", label: "Permissions off", description: "Runs without asking", tone: "warning" },
        ]}
      />,
    )
    const trigger = screen.getByRole("button", { name: "Ask before changes" })
    await user.click(trigger)
    await user.click(await screen.findByRole("menuitemradio", { name: /Permissions off/ }))
    expect(onValueChange).toHaveBeenCalledWith("off")
  })
})

describe("ChatShell", () => {
  it("adds the details toggle to the panel and remembers the sidebar state", async () => {
    const user = userEvent.setup()
    localStorage.setItem("test-sidebar", "collapsed")
    render(
      <ChatShell storageKey="test-sidebar" details={<p>Model: x</p>} detailsTitle="Conversation details">
        <ChatPanel title="Hello" notice="Reconnecting">
          <p>thread</p>
        </ChatPanel>
      </ChatShell>,
    )
    expect(screen.getByRole("heading", { name: "Hello" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting")
    expect(document.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-state", "collapsed")
    await user.click(screen.getByRole("button", { name: "Expand sidebar" }))
    expect(localStorage.getItem("test-sidebar")).toBe("open")
    // jsdom's matchMedia never matches, so details open as a sheet.
    await user.click(screen.getByRole("button", { name: "Toggle conversation details" }))
    expect(await screen.findByText("Model: x")).toBeInTheDocument()
  })
})

describe("UserMenu", () => {
  it("switches theme, runs app items and signs out", async () => {
    const user = userEvent.setup()
    const onSignOut = vi.fn()
    const onSettings = vi.fn()
    render(
      <ThemeProvider defaultMode="light" storageKey={null}>
        <UserMenu name="pat@example.com" subtitle="Signed in" onSignOut={onSignOut}>
          <DropdownMenuItem onSelect={onSettings}>Settings</DropdownMenuItem>
        </UserMenu>
      </ThemeProvider>,
    )
    const trigger = screen.getByRole("button", { name: "Account menu for pat@example.com" })
    await user.click(trigger)
    await user.click(await screen.findByRole("menuitemradio", { name: "Dark" }))
    expect(document.documentElement).toHaveClass("dark")
    // Choosing a theme keeps the menu open.
    expect(screen.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true")
    await user.click(screen.getByRole("menuitem", { name: "Settings" }))
    expect(onSettings).toHaveBeenCalledOnce()
    await user.click(trigger)
    await user.click(await screen.findByRole("menuitem", { name: "Sign out" }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
