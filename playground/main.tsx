import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider, Toaster, TooltipProvider } from "@/index"
import "./styles.css"
import { AdminScreen } from "./screens/admin"
import { AgentScreen } from "./screens/agent"
import { AuthScreen } from "./screens/auth"
import { CatalogScreen } from "./screens/catalog"
import { ChatScreen } from "./screens/chat"
import { HomeScreen } from "./screens/home"
import { HouseholdScreen } from "./screens/household"
import { RecordsScreen } from "./screens/records"
import { SettingsScreen } from "./screens/settings"

const screens = {
  admin: AdminScreen,
  chat: ChatScreen,
  agent: AgentScreen,
  records: RecordsScreen,
  home: HomeScreen,
  household: HouseholdScreen,
  settings: SettingsScreen,
  auth: AuthScreen,
  catalog: CatalogScreen,
}
type Key = keyof typeof screens

const read = (): Key => (location.hash.slice(1) in screens ? (location.hash.slice(1) as Key) : "admin")

function useHash(): Key {
  const [key, setKey] = useState<Key>(read)
  useEffect(() => {
    const on = () => setKey(read())
    addEventListener("hashchange", on)
    return () => removeEventListener("hashchange", on)
  }, [])
  return key
}

// ?mode=dark|light pins the mode without persisting it; ?shot hides the screen switcher.
// scripts/screenshots.mjs uses both to capture the README images.
const params = new URLSearchParams(location.search)
const pinnedMode = params.get("mode") === "dark" ? "dark" : params.get("mode") === "light" ? "light" : undefined
const shot = params.has("shot")

function App() {
  const key = useHash()
  const Screen = screens[key]
  return (
    <>
      <nav
        hidden={shot}
        className="fixed right-3 bottom-3 z-50 flex gap-1 rounded-full border bg-card p-1 text-xs shadow-card"
      >
        {(Object.keys(screens) as Key[]).map((k) => (
          <a
            key={k}
            href={`#${k}`}
            className={`rounded-full px-3 py-1.5 font-medium ${k === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {k}
          </a>
        ))}
      </nav>
      <Screen />
    </>
  )
}

const root = document.getElementById("root")
if (root)
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider defaultMode={pinnedMode ?? "light"} storageKey={pinnedMode ? null : undefined}>
        <TooltipProvider>
          <App />
          <Toaster mobileOffset={{ bottom: "5.5rem" }} />
        </TooltipProvider>
      </ThemeProvider>
    </StrictMode>,
  )
