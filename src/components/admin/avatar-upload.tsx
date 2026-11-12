"use client"

import * as React from "react"
import type { CategoryColor } from "@/components/admin/category"
import { MemberAvatar } from "@/components/admin/user-chip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Crops an image to its centred square and scales it to `size` (default 256) pixels, as a JPEG. With `maxBytes`,
 * steps the quality down until it fits, or rejects with "That photo is too big.".
 */
export async function cropImageToSquare(
  file: Blob,
  { size = 256, maxBytes }: { size?: number; maxBytes?: number } = {},
): Promise<Blob> {
  const image = await createImageBitmap(file).catch(() => {
    throw new Error("Could not read that image.")
  })
  const side = Math.min(image.width, image.height)
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not read that image.")
  // JPEG has no transparency: put see-through pixels on white instead of black.
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, size, size)
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size)
  image.close()
  for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    if (!blob) throw new Error("Could not read that image.")
    if (!maxBytes || blob.size <= maxBytes) return blob
  }
  throw new Error("That photo is too big.")
}

export interface AvatarUploadProps extends Omit<React.ComponentProps<"div">, "onChange" | "onError" | "color"> {
  /** Whose photo; gives the initials shown without one. */
  name: string
  /** Category colour behind the initials. */
  color?: CategoryColor
  /** The current photo. */
  avatarUrl?: string
  /** Called with a 256x256 JPEG after a photo is chosen, or `null` after Remove photo. */
  onChange: (photo: Blob | null) => void
  /** Largest photo to hand back, in bytes; JPEG quality steps down to fit. */
  maxBytes?: number
  /** Called when the file is not an image or cannot be made small enough. */
  onError?: (error: Error) => void
  /** A line under the buttons. */
  description?: React.ReactNode
}

/**
 * Profile photo picker: a large avatar, "Upload a photo" / "Change photo" and "Remove photo". The chosen image is
 * cropped to a centred square in the browser and previewed right away.
 */
function AvatarUpload({
  name,
  color,
  avatarUrl,
  onChange,
  maxBytes,
  onError,
  description,
  className,
  ...props
}: AvatarUploadProps) {
  const input = React.useRef<HTMLInputElement>(null)
  // undefined: show avatarUrl; null: removed; string: a local preview.
  const [preview, setPreview] = React.useState<string | null>()
  const [busy, setBusy] = React.useState(false)
  const shown = preview === undefined ? avatarUrl : (preview ?? undefined)

  React.useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  // A new photo from the parent replaces the local preview.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset only when avatarUrl changes
  React.useEffect(() => setPreview(undefined), [avatarUrl])

  async function choose(file: File) {
    setBusy(true)
    try {
      const blob = await cropImageToSquare(file, { maxBytes })
      setPreview(URL.createObjectURL(blob))
      onChange(blob)
    } catch (error) {
      onError?.(error as Error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-slot="avatar-upload" className={cn("flex flex-wrap items-center gap-5", className)} {...props}>
      <MemberAvatar
        name={name}
        avatarUrl={shown}
        color={color}
        size="lg"
        aria-label={shown ? `${name}'s photo` : name}
        className="size-18 *:data-[slot=avatar-fallback]:text-2xl"
      />
      <div className="flex min-w-0 flex-[1_1_14rem] flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            data-slot="avatar-upload-input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (file) void choose(file)
            }}
          />
          <Button type="button" variant="outline" loading={busy} onClick={() => input.current?.click()}>
            {shown ? "Change photo" : "Upload a photo"}
          </Button>
          {shown && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setPreview(null)
                onChange(null)
              }}
            >
              Remove photo
            </Button>
          )}
        </div>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

export { AvatarUpload }
