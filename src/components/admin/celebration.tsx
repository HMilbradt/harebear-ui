"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DURATION_MS = 1600
const COLORS = ["bg-category-1", "bg-category-2", "bg-category-3", "bg-category-4", "bg-category-5", "bg-category-6"]
// Fixed pseudo-random spread so renders stay pure: 36 pieces fanned around the burst point.
const PIECES = Array.from({ length: 36 }, (_, i) => {
  const angle = (i / 36) * Math.PI * 2 + (i % 3) * 0.3
  const reach = 120 + ((i * 47) % 160)
  return {
    color: COLORS[i % COLORS.length],
    style: {
      "--hb-x": `${Math.round(Math.cos(angle) * reach)}px`,
      "--hb-y": `${Math.round(Math.sin(angle) * reach * 0.8 - 120)}px`,
      "--hb-r": `${((i * 137) % 720) - 360}deg`,
      animationDelay: `${(i % 6) * 25}ms`,
    } as React.CSSProperties,
  }
})

const listeners = new Set<() => void>()

/** Plays one confetti burst on the mounted `<Celebration />`. Does nothing under prefers-reduced-motion. */
function celebrate() {
  if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  for (const listener of listeners) listener()
}

export type CelebrationProps = React.ComponentProps<"div">

/** Confetti layer for `celebrate()`. Mount once near the root, like Toaster. Renders nothing between bursts. */
function Celebration({ className, ...props }: CelebrationProps) {
  const [burst, setBurst] = React.useState(0)
  React.useEffect(() => {
    const listener = () => setBurst((b) => b + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])
  React.useEffect(() => {
    if (!burst) return
    const t = setTimeout(() => setBurst(0), DURATION_MS)
    return () => clearTimeout(t)
  }, [burst])

  if (!burst) return null
  return (
    <div
      key={burst}
      data-slot="celebration"
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 z-[100] overflow-hidden motion-reduce:hidden", className)}
      {...props}
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={cn("absolute top-1/2 left-1/2 h-3 w-2 rounded-[2px] opacity-0 animate-confetti", p.color)}
          style={p.style}
        />
      ))}
    </div>
  )
}

export { Celebration, celebrate }
