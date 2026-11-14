"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const COLORS = ["bg-category-1", "bg-category-2", "bg-category-3", "bg-category-4", "bg-category-5", "bg-category-6"]
// Strips and squares, so the pieces read as paper.
const SHAPES = ["h-3.5 w-1.5 rounded-[1px]", "size-2 rounded-[1px]", "h-3 w-1 rounded-[1px]"]

// Small seeded generator so every burst looks the same and renders stay pure.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const random = seeded(7)
const between = (min: number, max: number) => min + random() * (max - min)

// 48 pieces fired up and out in a cone (25 to 155 degrees above horizontal) at varied speeds. Each lasts 2.5 to
// 3.5 s and starts up to 200 ms late. The hb-confetti keyframes in styles.css read the variables: where the piece
// peaks, how far it drifts and sways on the way down, and how much it spins and flutters.
const PIECES = Array.from({ length: 48 }, (_, i) => {
  const angle = (between(25, 155) * Math.PI) / 180
  const speed = between(170, 380)
  const duration = Math.round(between(2500, 3500))
  const delay = Math.round(between(0, 200))
  return {
    color: COLORS[i % COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    end: delay + duration,
    style: {
      "--hb-x": `${Math.round(Math.cos(angle) * speed)}px`,
      // Capped so the highest pieces stay on short screens.
      "--hb-y": `max(${Math.round(-Math.sin(angle) * speed)}px, -42vh)`,
      "--hb-drift": `${Math.round(between(-90, 90))}px`,
      "--hb-sway": `${Math.round(between(14, 34)) * (i % 2 ? 1 : -1)}px`,
      "--hb-r": `${Math.round(between(-540, 540))}deg`,
      "--hb-tilt": between(0.2, 1).toFixed(2),
      "--hb-flip": `${Math.round(between(540, 1260))}deg`,
      animationDuration: `${duration}ms`,
      animationDelay: `${delay}ms`,
    } as React.CSSProperties,
  }
})

// The layer stays until the last piece has finished.
const LAYER_MS = Math.max(...PIECES.map((p) => p.end))

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
    const t = setTimeout(() => setBurst(0), LAYER_MS)
    return () => clearTimeout(t)
  }, [burst])

  if (!burst) return null
  return (
    <div
      key={burst}
      data-slot="celebration"
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] overflow-hidden perspective-[600px] motion-reduce:hidden",
        className,
      )}
      {...props}
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={cn("absolute top-1/2 left-1/2 opacity-0 animate-confetti", p.shape, p.color)}
          style={p.style}
        />
      ))}
    </div>
  )
}

export { Celebration, celebrate }
