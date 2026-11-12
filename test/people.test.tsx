import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  AvatarStack,
  AvatarUpload,
  CategoryDot,
  ColorSwatchPicker,
  cropImageToSquare,
  Kbd,
  MemberAvatar,
  TaskRow,
  VisibilityBadge,
} from "@/index"

/** jsdom has no canvas or image decoding: fake a 2000x1500 image and a canvas whose blob size depends on quality. */
function fakeCanvas(bytesAt: (quality: number) => number = () => 1000) {
  const drawImage = vi.fn()
  const close = vi.fn()
  const canvases: HTMLCanvasElement[] = []
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => ({ width: 2000, height: 1500, close })),
  )
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement) {
    canvases.push(this)
    return { drawImage, fillRect: vi.fn() } as unknown as CanvasRenderingContext2D
  } as unknown as typeof HTMLCanvasElement.prototype.getContext)
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback, type, quality) => {
    callback(new Blob([new Uint8Array(bytesAt(quality as number))], { type }))
  })
  return { drawImage, close, canvases }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("MemberAvatar", () => {
  it("is named after the person and shows initials on the category colour", () => {
    render(<MemberAvatar name="Sam Rivera" color={3} size="sm" />)
    const avatar = screen.getByRole("img", { name: "Sam Rivera" })
    expect(avatar).toHaveAttribute("data-color", "3")
    const fallback = avatar.querySelector("[data-slot=avatar-fallback]")
    expect(fallback).toHaveTextContent("SR")
    expect(fallback).toHaveClass("bg-category-3", "text-category-foreground")
    // Small initials are 12px (text-xs), not 11px.
    expect(fallback?.className).toContain("group-data-[size=sm]/avatar:text-xs")
    expect(fallback?.className).not.toContain("text-[11px]")
  })

  it("is used for TaskRow assignees with their colour", () => {
    render(<TaskRow title="Fence" checked={false} onCheckedChange={() => {}} assignee={{ name: "Riley", color: 4 }} />)
    expect(screen.getByRole("img", { name: "Riley" })).toHaveAttribute("data-color", "4")
  })

  it("keeps Kbd text at 12px", () => {
    render(<Kbd>⌘K</Kbd>)
    expect(screen.getByText("⌘K")).toHaveClass("text-xs")
  })
})

describe("AvatarStack and VisibilityBadge", () => {
  const members = [
    { name: "Harrison" },
    { name: "Sam", color: 2 as const },
    { name: "Riley" },
    { name: "Ada" },
    { name: "Lee" },
  ]

  it("names each face and folds the rest into +N", () => {
    render(<AvatarStack members={members} max={3} />)
    expect(screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"))).toEqual(["Harrison", "Sam", "3 more"])
    expect(screen.getByText("+3")).toBeInTheDocument()
  })

  it("says shared with faces, or only you with a lock", () => {
    const { rerender, container } = render(<VisibilityBadge visibility="shared" members={members.slice(0, 3)} />)
    expect(screen.getByText("Shared with everyone")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=avatar-stack]")).toHaveAttribute("aria-hidden", "true")
    rerender(<VisibilityBadge visibility="private" />)
    expect(screen.getByText("Only you")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=avatar-stack]")).toBeNull()
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("CategoryDot", () => {
  it("is decorative unless labelled, and adds a named lock", () => {
    const { container, rerender } = render(<CategoryDot color={2} />)
    expect(container.querySelector(".bg-category-2")).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("img")).toBeNull()
    rerender(<CategoryDot color={2} label="Sam" locked />)
    expect(screen.getByRole("img", { name: "Sam" })).toHaveClass("bg-category-2")
    expect(screen.getByRole("img", { name: "Only you" })).toBeInTheDocument()
  })
})

describe("ColorSwatchPicker", () => {
  it("picks a free colour and disables taken ones with who has them", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ColorSwatchPicker aria-label="Your colour" value={1} onValueChange={onValueChange} taken={{ 3: "Riley" }} />,
    )
    expect(screen.getByRole("radiogroup", { name: "Your colour" })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(6)
    expect(screen.getByRole("radio", { name: "Blue" })).toBeChecked()
    const taken = screen.getByRole("radio", { name: "Violet, taken by Riley" })
    expect(taken).toBeDisabled()
    expect(taken).toHaveTextContent("R")
    await user.click(taken)
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole("radio", { name: "Teal" }))
    expect(onValueChange).toHaveBeenCalledWith(2)
  })
})

describe("cropImageToSquare", () => {
  it("crops the centred square to a 256x256 JPEG", async () => {
    const { drawImage, close, canvases } = fakeCanvas()
    const blob = await cropImageToSquare(new Blob(["png"], { type: "image/png" }))
    expect(blob.type).toBe("image/jpeg")
    expect(canvases[0]?.width).toBe(256)
    expect(canvases[0]?.height).toBe(256)
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 250, 0, 1500, 1500, 0, 0, 256, 256)
    expect(close).toHaveBeenCalled()
  })

  it("lowers quality to fit maxBytes, and rejects when it cannot", async () => {
    fakeCanvas((q) => (q > 0.75 ? 600_000 : 400_000))
    const blob = await cropImageToSquare(new Blob(["png"]), { maxBytes: 512 * 1024 })
    expect(blob.size).toBe(400_000)
    await expect(cropImageToSquare(new Blob(["png"]), { maxBytes: 1000 })).rejects.toThrow("That photo is too big.")
  })
})

describe("AvatarUpload", () => {
  it("hands back the cropped photo, previews it, and removes it", async () => {
    fakeCanvas()
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() }))
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<AvatarUpload name="Sam Rivera" color={2} onChange={onChange} maxBytes={512 * 1024} />)
    expect(screen.getByRole("img", { name: "Sam Rivera" })).toHaveTextContent("SR")
    const input = container.querySelector<HTMLInputElement>("input[type=file]")
    expect(input).toHaveAttribute("accept", "image/*")
    await user.upload(input as HTMLInputElement, new File(["png"], "me.png", { type: "image/png" }))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.any(Blob)))
    expect(screen.getByRole("img", { name: "Sam Rivera's photo" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove photo" }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole("button", { name: "Upload a photo" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Remove photo" })).toBeNull()
  })

  it("reports a file it cannot read", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => {
        throw new Error("decode")
      }),
    )
    const user = userEvent.setup()
    const onError = vi.fn()
    const onChange = vi.fn()
    const { container } = render(<AvatarUpload name="Sam" onChange={onChange} onError={onError} />)
    await user.upload(
      container.querySelector("input[type=file]") as HTMLInputElement,
      new File(["x"], "x.png", { type: "image/png" }),
    )
    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onError.mock.calls[0]?.[0].message).toBe("Could not read that image.")
    expect(onChange).not.toHaveBeenCalled()
  })
})
