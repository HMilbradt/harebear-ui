import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import {
  ChatMessage,
  CodeBlockCopyButton,
  CodeSnippet,
  LoginForm,
  Metric,
  ShowMore,
  SignupForm,
  createDataTableColumnHelper,
  DataTable,
  PromptInput,
  StatCard,
  ThemeProvider,
  ThemeToggle,
  UsageMeter,
} from "@/index"

type Row = { id: string; name: string; mrr: number }
const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `Customer ${i}`, mrr: i * 10 }))
const col = createDataTableColumnHelper<Row>()
const columns = col.columns([col.accessor("name", { header: "Name" }), col.accessor("mrr", { header: "MRR" })])

describe("DataTable", () => {
  it("paginates, searches and reports row clicks", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        searchable
        pageSize={10}
        onRowClick={onRowClick}
      />,
    )
    expect(screen.getByText("Showing 1-10 of 25")).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox"), "Customer 2")
    expect(screen.getByText("Showing 1-6 of 6")).toBeInTheDocument() // "Customer 2" and 20-24
    await user.click(screen.getByText("Customer 21"))
    expect(onRowClick).toHaveBeenCalledWith(rows[21])
  })

  it("selects rows and reports the selection", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={rows.slice(0, 3)}
        getRowId={(r) => r.id}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    )
    const [, first] = screen.getAllByRole("checkbox")
    await user.click(first!)
    expect(onSelectionChange).toHaveBeenLastCalledWith([rows[0]])
  })

  it("sorts when a header is clicked", async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={rows.slice(0, 3)} getRowId={(r) => r.id} />)
    await user.click(screen.getByRole("button", { name: /MRR/ }))
    const sort = screen.getByRole("columnheader", { name: /MRR/ }).getAttribute("aria-sort")
    expect(sort).toMatch(/ascending|descending/)
    const body = screen.getAllByRole("rowgroup")[1]!
    const first = within(body).getAllByRole("row")[0]
    expect(first).toHaveTextContent(sort === "descending" ? "Customer 2" : "Customer 0")
  })
})

function Harness({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [v, setV] = useState("")
  return (
    <PromptInput
      value={v}
      onValueChange={setV}
      onSubmit={(t) => {
        onSubmit(t)
        setV("")
      }}
    />
  )
}

describe("PromptInput", () => {
  it("submits trimmed text on Enter and keeps Shift+Enter as newline", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)
    const box = screen.getByLabelText("Message")
    await user.type(box, "  hello{Shift>}{Enter}{/Shift}world  ")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.type(box, "{Enter}")
    expect(onSubmit).toHaveBeenCalledWith("hello\nworld")
    expect(box).toHaveValue("")
  })

  it("disables send when empty", () => {
    render(<Harness onSubmit={() => {}} />)
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled()
  })
})

describe("ThemeProvider", () => {
  it("toggles the dark class on <html>", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider defaultMode="light" storageKey={null}>
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(document.documentElement).not.toHaveClass("dark")
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }))
    expect(document.documentElement).toHaveClass("dark")
  })

  it("applies accent and radius as CSS variables", () => {
    render(<ThemeProvider accent="#123456" radius={8} storageKey={null} />)
    expect(document.documentElement.style.getPropertyValue("--brand")).toBe("#123456")
    expect(document.documentElement.style.getPropertyValue("--radius")).toBe("0.5rem")
  })
})

describe("layout and text", () => {
  it("collapses ShowMore after `initial` children", async () => {
    const user = userEvent.setup()
    render(
      <ShowMore initial={2}>
        {["a", "b", "c", "d"].map((x) => (
          <span key={x}>{x}</span>
        ))}
      </ShowMore>,
    )
    expect(screen.queryByText("c")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Show 2 more" }))
    expect(screen.getByText("d")).toBeInTheDocument()
  })

  it("colors a Metric delta by direction", () => {
    const { rerender } = render(<Metric label="Ping" value={21} unit="ms" delta={-12} lowerIsBetter />)
    expect(screen.getByText("-12.0%").className).toContain("text-success")
    rerender(<Metric label="Down" value={90} delta={-12} />)
    expect(screen.getByText("-12.0%").className).toContain("text-destructive")
  })
})

describe("display components", () => {
  it("renders StatCard content", () => {
    render(<StatCard label="Revenue" value="$48,210" delta="12.4%" note="vs last month" data={[1, 2, 3]} />)
    expect(screen.getByText("$48,210")).toBeInTheDocument()
    expect(screen.getByText("12.4%")).toBeInTheDocument()
  })

  it("clamps UsageMeter and exposes it as a meter", () => {
    render(<UsageMeter label="Storage" percent={140} value="140%" />)
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100")
  })

  it("renders user and assistant chat turns", () => {
    render(
      <>
        <ChatMessage role="user">Hi</ChatMessage>
        <ChatMessage role="assistant">Hello</ChatMessage>
      </>,
    )
    expect(screen.getByText("Hi").closest("[data-role]")).toHaveAttribute("data-role", "user")
    expect(screen.getByText("Hello").closest("[data-role]")).toHaveAttribute("data-role", "assistant")
  })
})

describe("auth forms", () => {
  it("LoginForm submits email and password", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Email"), "a@b.co")
    await user.type(screen.getByLabelText("Password"), "hunter22")
    await user.click(screen.getByRole("button", { name: "Sign in" }))
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.co", password: "hunter22" })
  })

  it("LoginForm email-only mode has no password", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm mode="email-only" onSubmit={onSubmit} />)
    expect(screen.queryByLabelText("Password")).toBeNull()
    await user.type(screen.getByLabelText("Email"), "a@b.co")
    await user.click(screen.getByRole("button", { name: "Send sign-in link" }))
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.co" })
  })

  it("SignupForm blocks mismatched passwords", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Full name"), "Ada")
    await user.type(screen.getByLabelText("Email"), "a@b.co")
    await user.type(screen.getByLabelText("Password"), "longpassword")
    await user.type(screen.getByLabelText("Confirm password"), "different1")
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(onSubmit).not.toHaveBeenCalled()
    await user.clear(screen.getByLabelText("Confirm password"))
    await user.type(screen.getByLabelText("Confirm password"), "longpassword")
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(onSubmit).toHaveBeenCalledWith(
      { name: "Ada", email: "a@b.co", password: "longpassword" },
      expect.any(FormData),
    )
  })

  it("renders provider buttons and reports clicks", async () => {
    const user = userEvent.setup()
    const onProviderClick = vi.fn()
    render(<LoginForm providers={[{ id: "github", label: "GitHub" }]} onProviderClick={onProviderClick} />)
    await user.click(screen.getByRole("button", { name: "Continue with GitHub" }))
    expect(onProviderClick).toHaveBeenCalledWith("github")
  })
})

describe("CodeSnippet", () => {
  it("renders the code and a copy button", () => {
    render(<CodeSnippet language="bash" code={"echo hi\nls"} />)
    expect(screen.getByText("echo hi")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument()
  })
})

describe("review fixes", () => {
  it("SignupForm submits after the password (not the confirmation) is corrected", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SignupForm nameField={false} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Email"), "a@b.co")
    await user.type(screen.getByLabelText("Password"), "wrongpassword")
    await user.type(screen.getByLabelText("Confirm password"), "rightpassword")
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(onSubmit).not.toHaveBeenCalled()
    await user.clear(screen.getByLabelText("Password"))
    await user.type(screen.getByLabelText("Password"), "rightpassword")
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.co", password: "rightpassword" }, expect.any(FormData))
  })

  it("gives each LoginForm instance its own field ids", () => {
    render(
      <>
        <LoginForm />
        <LoginForm />
      </>,
    )
    const emails = screen.getAllByLabelText("Email")
    expect(emails).toHaveLength(2)
    expect(emails[0]).not.toBe(emails[1])
    expect(emails[0]!.id).not.toBe(emails[1]!.id)
  })

  it("CodeBlockCopyButton does not submit a surrounding form", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <CodeBlockCopyButton value="x" />
      </form>,
    )
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
