"use client"

import * as React from "react"

// Floating controls (AppNav's tab bar and action button, AssistantDock's launcher) register the space they take at
// the bottom of the viewport as CSS variables on <html>. styles.css adds them to Sonner's bottom offset, so toasts
// stack above those controls instead of covering them. Counted, so two mounted controls of one kind are fine.
const counts = new Map<string, number>()

export function useToastClearance(name: `--hb-toast-${string}`, value: string, enabled = true) {
  React.useEffect(() => {
    if (!enabled || typeof document === "undefined") return
    const root = document.documentElement
    counts.set(name, (counts.get(name) ?? 0) + 1)
    root.style.setProperty(name, value)
    return () => {
      const left = (counts.get(name) ?? 1) - 1
      counts.set(name, left)
      if (left === 0) root.style.removeProperty(name)
    }
  }, [name, value, enabled])
}
