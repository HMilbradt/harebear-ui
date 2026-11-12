import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import {
  AppShell,
  ApprovalCard,
  Badge,
  Button,
  ChatMessage,
  ChatPanel,
  ChatShell,
  ConfirmDialog,
  ConversationList,
  DropdownMenuItem,
  Empty,
  formatWhen,
  groupByDate,
  InlineCode,
  ModelPicker,
  PromptInputSelect,
  StatusBadge,
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

  it("buckets Today / This week / Earlier with buckets: week", () => {
    const now = new Date(2026, 10, 10, 12).getTime()
    const day = 24 * 3600 * 1000
    const items = [
      { id: "today", t: now - 1000 },
      { id: "yday", t: now - day },
      { id: "six", t: now - 6 * day },
      { id: "seven", t: now - 7 * day },
    ]
    const groups = groupByDate(
      items,
      (i) => i.t,
      (i) => ({ id: i.id, title: i.id }),
      { now, buckets: "week" },
    )
    expect(groups.map((g) => [g.label, g.items.map((c) => c.id)])).toEqual([
      ["Today", ["today"]],
      ["This week", ["yday", "six"]],
      ["Earlier", ["seven"]],
    ])
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
    // Named by its visible text (axe label-content-name-mismatch), not an aria-label that hides it.
    const trigger = screen.getByRole("button", { name: /^pat@example\.com\s*Signed in$/ })
    expect(trigger).not.toHaveAttribute("aria-label")
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

describe("AppShell", () => {
  it("collapses to the icon rail and remembers it", async () => {
    const user = userEvent.setup()
    localStorage.removeItem("test-admin")
    render(
      <AppShell
        storageKey="test-admin"
        nav={[{ label: "Workspace", items: [{ label: "Orders", href: "/orders", badge: 3 }] }]}
      >
        <p>page</p>
      </AppShell>,
    )
    const sidebar = () => document.querySelector("[data-slot=sidebar]")
    expect(sidebar()).toHaveAttribute("data-state", "expanded")
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }))
    expect(sidebar()).toHaveAttribute("data-state", "collapsed")
    expect(sidebar()).toHaveAttribute("data-collapsible", "icon")
    expect(localStorage.getItem("test-admin")).toBe("collapsed")
    expect(screen.getByRole("link", { name: /Orders/ })).toHaveAttribute("href", "/orders")
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument()
  })

  it("has no collapse button when collapsible is none", () => {
    render(
      <AppShell collapsible="none" nav={[]}>
        <p>page</p>
      </AppShell>,
    )
    expect(screen.queryByRole("button", { name: "Collapse sidebar" })).not.toBeInTheDocument()
  })
})

describe("P1 props", () => {
  it("Button loading disables the button and shows a spinner", () => {
    render(
      <>
        <Button loading>Save</Button>
        <Button loading size="icon" aria-label="Refresh">
          <span>icon</span>
        </Button>
      </>,
    )
    const save = screen.getByRole("button", { name: "Save" })
    expect(save).toBeDisabled()
    expect(save).toHaveAttribute("aria-busy", "true")
    expect(save.querySelector("[data-slot=spinner]")).toBeInTheDocument()
    expect(screen.queryByText("icon")).not.toBeInTheDocument()
  })

  it("Badge tone maps to the status variants", () => {
    render(
      <>
        <Badge tone="danger">failed</Badge>
        <Badge tone="neutral" variant="default">
          done
        </Badge>
      </>,
    )
    expect(screen.getByText("failed")).toHaveAttribute("data-variant", "destructive")
    expect(screen.getByText("done")).toHaveAttribute("data-variant", "secondary")
  })

  it("Empty size sm marks itself compact", () => {
    render(<Empty size="sm">none</Empty>)
    expect(screen.getByText("none")).toHaveAttribute("data-size", "sm")
  })

  it("InlineCode truncate cuts long strings and keeps the full text as a tooltip", () => {
    render(<InlineCode truncate={5}>docker restart sonarr</InlineCode>)
    const code = screen.getByText("docke…")
    expect(code).toHaveAttribute("title", "docker restart sonarr")
  })

  it("StatusBadge compact keeps the label for screen readers", () => {
    render(
      <StatusBadge tone="info" compact>
        Working
      </StatusBadge>,
    )
    expect(screen.getByText("Working")).toHaveClass("sr-only")
  })

  it("ModelPicker sections by group and lists an unknown current value", async () => {
    const user = userEvent.setup()
    render(
      <ModelPicker
        value="local/llama"
        onValueChange={() => {}}
        models={[
          { id: "a/one", label: "one", group: "Anthropic" },
          { id: "o/two", label: "two", group: "OpenAI" },
        ]}
      />,
    )
    await user.click(screen.getByRole("button", { name: /local\/llama/ }))
    expect(await screen.findByText("Anthropic")).toBeInTheDocument()
    expect(screen.getByText("OpenAI")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "local/llama" })).toBeInTheDocument()
  })

  it("ConversationList onDelete confirms first and respects deleteDisabled", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <ConversationList
        groups={[
          {
            label: "Today",
            items: [
              { id: "a", title: "Disk alert" },
              { id: "b", title: "Busy one", deleteDisabled: "Stop the agent first" },
            ],
          },
        ]}
        onDelete={onDelete}
        deleteDescription="Gone for good."
      />,
    )
    const blocked = screen.getByRole("button", { name: "Delete Busy one" })
    expect(blocked).toBeDisabled()
    expect(blocked).toHaveAttribute("title", "Stop the agent first")
    await user.click(screen.getByRole("button", { name: "Delete Disk alert" }))
    expect(await screen.findByText("Gone for good.")).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }))
  })

  it("ApprovalCard reason renders before the body", () => {
    render(
      <ApprovalCard title="Approval needed" reason="To free disk space">
        extra
      </ApprovalCard>,
    )
    expect(screen.getByText("Why:")).toBeInTheDocument()
    expect(screen.getByText("To free disk space")).toBeInTheDocument()
    expect(screen.getByText("extra")).toBeInTheDocument()
  })

  it("ChatMessage avatar false renders no avatar", () => {
    const { container } = render(
      <ChatMessage role="assistant" avatar={false}>
        hi
      </ChatMessage>,
    )
    expect(container.querySelector("[data-slot=assistant-avatar]")).not.toBeInTheDocument()
  })

  it("formatWhen picks time, date, or date with year", () => {
    const now = new Date(2026, 10, 10, 15)
    expect(formatWhen(new Date(2026, 10, 10, 9, 41), now, "en-US")).toBe("9:41 AM")
    expect(formatWhen(new Date(2026, 10, 3), now, "en-US")).toBe("Nov 3")
    expect(formatWhen(new Date(2025, 10, 3), now, "en-US")).toBe("Nov 3, 2025")
  })
})
