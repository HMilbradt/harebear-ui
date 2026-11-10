"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

/** Icon button that flips between light and dark mode. */
function ThemeToggle(props: Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const { resolvedMode, toggleMode } = useTheme()
  const dark = resolvedMode === "dark"
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleMode}
      {...props}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export { ThemeToggle }
