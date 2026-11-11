"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface MediaItemProps extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode
  /** Opens in a new tab. */
  href?: string
  image?: string
  imageShape?: "poster" | "square" | "wide"
  meta?: React.ReactNode
  description?: React.ReactNode
}

const shapeClass = {
  poster: "aspect-[2/3] w-14",
  square: "aspect-square w-12",
  wide: "aspect-video w-24",
} as const

/** Thumbnail, title, a meta line and a two-line description. For media, articles, releases. */
function MediaItem({
  title,
  href,
  image,
  imageShape = "poster",
  meta,
  description,
  className,
  ...props
}: MediaItemProps) {
  const img = image ? (
    <img
      src={image}
      alt=""
      loading="lazy"
      className={cn("shrink-0 rounded-md bg-muted object-cover", shapeClass[imageShape])}
    />
  ) : null
  return (
    <div data-slot="media-item" className={cn("flex min-w-0 items-start gap-3", className)} {...props}>
      {img && href ? (
        <a href={href} target="_blank" rel="noreferrer" tabIndex={-1} className="shrink-0">
          {img}
        </a>
      ) : (
        img
      )}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="line-clamp-2 font-medium">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="outline-none hover:underline focus-visible:underline"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </span>
        {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
        {description && <span className="line-clamp-2 text-[13px] text-muted-foreground">{description}</span>}
      </div>
    </div>
  )
}

export { MediaItem }
