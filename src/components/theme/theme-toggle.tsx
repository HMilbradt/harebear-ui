"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

/**
 * Icon button that flips between light and dark mode. Safe to server render: the icon follows the
 * `.dark` class through CSS, and the label names the target mode only after hydration.
 */
function ThemeToggle(props: Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const { resolvedMode, toggleMode } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const label = !mounted ? "Toggle dark mode" : resolvedMode === "dark" ? "Switch to light mode" : "Switch to dark mode"
  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} onClick={toggleMode} {...props}>
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Button>
  )
}

export { ThemeToggle }
