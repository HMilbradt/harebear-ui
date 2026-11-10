"use client"

import * as React from "react"

export type ThemeMode = "light" | "dark" | "system"
export type ResolvedThemeMode = "light" | "dark"

export interface ThemeProviderProps {
  children?: React.ReactNode
  /** Initial mode when nothing is stored. Default "system". */
  defaultMode?: ThemeMode
  /** Brand/accent color (any CSS color). Drives --brand, which primary derives from. */
  accent?: string
  /** Base corner radius in px. Default 14. */
  radius?: number
  /** Font family name for body text, e.g. "Inter". Default Geist (bundled). */
  font?: string
  /** localStorage key for the chosen mode. Pass null to disable persistence. */
  storageKey?: string | null
}

export interface ThemeContextValue {
  mode: ThemeMode
  resolvedMode: ResolvedThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  accent: string | undefined
  setAccent: (accent: string | undefined) => void
  radius: number | undefined
  setRadius: (radius: number | undefined) => void
}

const fallback: ThemeContextValue = {
  mode: "light",
  resolvedMode: "light",
  setMode: () => {},
  toggleMode: () => {},
  accent: undefined,
  setAccent: () => {},
  radius: undefined,
  setRadius: () => {},
}

const ThemeContext = React.createContext<ThemeContextValue>(fallback)

const DEFAULT_STORAGE_KEY = "harebear-theme"

function readStored(key: string | null): ThemeMode | null {
  if (!key || typeof window === "undefined") return null
  try {
    const v = window.localStorage.getItem(key)
    return v === "light" || v === "dark" || v === "system" ? v : null
  } catch {
    return null
  }
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
}

/**
 * Applies light/dark mode (the `.dark` class on <html>), accent, radius and
 * font to the document. Wrap your app once, near the root.
 */
function ThemeProvider({
  children,
  defaultMode = "system",
  accent: accentProp,
  radius: radiusProp,
  font,
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [mode, setModeState] = React.useState<ThemeMode>(() => readStored(storageKey) ?? defaultMode)
  const [systemDark, setSystemDark] = React.useState<boolean>(systemPrefersDark)
  const [accent, setAccent] = React.useState(accentProp)
  const [radius, setRadius] = React.useState(radiusProp)

  React.useEffect(() => setAccent(accentProp), [accentProp])
  React.useEffect(() => setRadius(radiusProp), [radiusProp])

  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)")
    if (!mq) return
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const resolvedMode: ResolvedThemeMode = mode === "system" ? (systemDark ? "dark" : "light") : mode

  React.useEffect(() => {
    const root = document.documentElement
    if (root.classList.contains("dark") === (resolvedMode === "dark")) return
    // Suspend transitions for one frame so every surface flips at once.
    const style = document.createElement("style")
    style.textContent = "*,*::before,*::after{transition:none!important}"
    document.head.appendChild(style)
    root.classList.toggle("dark", resolvedMode === "dark")
    void window.getComputedStyle(document.body).opacity
    requestAnimationFrame(() => style.remove())
  }, [resolvedMode])

  React.useEffect(() => {
    const s = document.documentElement.style
    if (accent) s.setProperty("--brand", accent)
    else s.removeProperty("--brand")
    if (radius !== undefined) s.setProperty("--radius", `${radius / 16}rem`)
    else s.removeProperty("--radius")
    if (font) s.setProperty("--hb-font-sans", `"${font}", ui-sans-serif, system-ui, sans-serif`)
    else s.removeProperty("--hb-font-sans")
  }, [accent, radius, font])

  const setMode = React.useCallback(
    (next: ThemeMode) => {
      setModeState(next)
      if (!storageKey) return
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Storage can be unavailable (private mode); mode still applies.
      }
    },
    [storageKey],
  )

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      setMode,
      toggleMode: () => setMode(resolvedMode === "dark" ? "light" : "dark"),
      accent,
      setAccent,
      radius,
      setRadius,
    }),
    [mode, resolvedMode, setMode, accent, radius],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

/** Read and change the current theme. Safe to call outside a provider (returns light). */
function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext)
}

/**
 * Inline script for SSR apps that sets `.dark` before first paint, avoiding a
 * flash of the wrong theme. Render it inside <head>.
 */
function ThemeScript({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultMode = "system",
}: {
  storageKey?: string
  defaultMode?: ThemeMode
}) {
  const code = `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultMode)};var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`
  // biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-authored script
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}

export { ThemeProvider, useTheme, ThemeScript }
