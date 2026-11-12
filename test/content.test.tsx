import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { type ChecklistItem, ChecklistEditor, CommentThread, Markdown, MarkdownEditor } from "@/index"

function RouterLink({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} data-router="">
      {children}
    </a>
  )
}

function Editor() {
  const [md, setMd] = useState("")
  return <MarkdownEditor aria-label="Body" value={md} onValueChange={setMd} />
}

describe("Markdown", () => {
  it("renders GFM inside Prose, drops raw HTML and unsafe links", () => {
    const { container } = render(
      <Markdown>
        {
          "# Furnace\n\n~~old~~ filter\n\n| Part | Size |\n| - | - |\n| Filter | 16x25 |\n\n- [x] Buy filter\n\n<script>alert(1)</script><b>raw</b>\n\n[bad](javascript:alert(1))"
        }
      </Markdown>,
    )
    expect(screen.getByRole("heading", { name: "Furnace" }).closest("[data-slot=markdown]")).toBeInTheDocument()
    expect(container.querySelector("del")).toHaveTextContent("old")
    expect(screen.getByRole("table")).toHaveTextContent("16x25")
    expect(screen.getByRole("checkbox", { name: "Done" })).toBeChecked()
    expect(container.querySelector("script, b")).toBeNull()
    expect(screen.getByText("bad").getAttribute("href") ?? "").not.toMatch(/javascript/)
  })

  it("renders Tip blockquotes as a Callout", () => {
    const { container } = render(<Markdown>{"> Tip: Turn the power off first."}</Markdown>)
    const tip = container.querySelector("[data-tip]")
    expect(tip).toHaveTextContent("Turn the power off first.")
    expect(tip).not.toHaveTextContent("Tip:")
  })

  it("sends in-app links through linkComponent and keeps external links plain", () => {
    render(<Markdown linkComponent={RouterLink}>{"[Lists](/lists/2) and [Docs](https://example.com)"}</Markdown>)
    expect(screen.getByRole("link", { name: "Lists" })).toHaveAttribute("data-router")
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("data-router")
  })
})

describe("MarkdownEditor", () => {
  it("previews with Markdown when no renderPreview is given", async () => {
    const user = userEvent.setup()
    render(<Editor />)
    await user.type(screen.getByRole("textbox", { name: "Body" }), "**Bold** note")
    await user.click(screen.getByRole("tab", { name: "Preview" }))
    expect(screen.getByText("Bold").tagName).toBe("STRONG")
  })
})

describe("ChecklistEditor", () => {
  const items: ChecklistItem[] = [
    { id: "a", text: "Buy filter", done: true },
    { id: "b", text: "Swap filter", done: false },
  ]

  it("toggles, removes, adds and shows progress", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onRemove = vi.fn()
    const onAdd = vi.fn()
    render(<ChecklistEditor items={items} onToggle={onToggle} onRemove={onRemove} onAdd={onAdd} />)
    expect(screen.getByText("1 of 2 done")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Buy filter" })).toBeChecked()

    await user.click(screen.getByText("Swap filter"))
    expect(onToggle).toHaveBeenCalledWith("b", true)
    await user.click(screen.getByRole("button", { name: "Remove Buy filter" }))
    expect(onRemove).toHaveBeenCalledWith("a")

    const add = screen.getByRole("textbox", { name: "Add an item" })
    await user.type(add, "   {Enter}")
    expect(onAdd).not.toHaveBeenCalled()
    await user.type(add, " Recycle old one {Enter}")
    expect(onAdd).toHaveBeenCalledWith("Recycle old one")
    expect(add).toHaveValue("")
  })

  it("takes a custom progress label and hides it with no items", () => {
    const { rerender } = render(
      <ChecklistEditor
        items={items}
        onToggle={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        progressLabel={(d, t) => `${d}/${t}`}
      />,
    )
    expect(screen.getByText("1/2")).toBeInTheDocument()
    rerender(<ChecklistEditor items={[]} onToggle={() => {}} onRemove={() => {}} onAdd={() => {}} />)
    expect(screen.queryByText(/done/)).toBeNull()
  })
})

describe("CommentThread", () => {
  it("renders comments as Markdown and submits trimmed text", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <CommentThread
        comments={[
          { id: "1", author: { name: "Maya Chen", color: 2 }, meta: "2 h ago", body: "Got the **16x25** one" },
        ]}
        onSubmit={onSubmit}
      />,
    )
    const item = screen.getByRole("listitem")
    expect(within(item).getByText("Maya Chen")).toBeInTheDocument()
    expect(within(item).getByText(/2 h ago/)).toBeInTheDocument()
    expect(within(item).getByText("16x25").tagName).toBe("STRONG")

    const submit = screen.getByRole("button", { name: "Comment" })
    expect(submit).toBeDisabled()
    const box = screen.getByRole("textbox", { name: "Add a comment" })
    await user.type(box, "  Thanks!  ")
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalledWith("Thanks!")
    expect(box).toHaveValue("")
  })
})
