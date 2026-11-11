# Getting started

harebear-ui needs React 19 and Tailwind CSS v4 in your app. Pick your framework below; each setup is about five minutes.

- [Vite](#vite)
- [Next.js (App Router)](#nextjs-app-router)
- [React Router v7 (framework mode)](#react-router-v7-framework-mode)
- [Check it works](#check-it-works)
- [Troubleshooting](#troubleshooting)

The fast path for any framework that already has Tailwind v4:

```bash
npm i harebear-ui
npx harebear-ui init
```

`init` finds the CSS file that contains `@import "tailwindcss"`, adds `@import "harebear-ui/styles.css";` after it, writes a harebear-ui section into `AGENTS.md` (or `CLAUDE.md` if that is what you have), and installs a Claude Code skill in `.claude/skills/harebear-ui/`. It is safe to run again: the CSS import is not duplicated and the agent section is replaced in place.

| Flag           | Effect                                                        |
| -------------- | ------------------------------------------------------------- |
| `--css <file>` | Use this CSS file. Needed when several files import Tailwind. |
| `--no-agents`  | Skip the `AGENTS.md` / `CLAUDE.md` section.                   |
| `--no-skill`   | Skip the Claude Code skill.                                   |

Then wrap your root (framework sections below show where).

## Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm i tailwindcss @tailwindcss/vite harebear-ui
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css: replace the contents */
@import "tailwindcss";
@import "harebear-ui/styles.css";
```

```tsx
// src/main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider, Toaster, TooltipProvider } from "harebear-ui"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
```

Tailwind's Vite guide: https://tailwindcss.com/docs/installation/using-vite

## Next.js (App Router)

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm i harebear-ui
```

`create-next-app --tailwind` sets up Tailwind v4 with `@tailwindcss/postcss`. Add the stylesheet after the Tailwind import:

```css
/* app/globals.css */
@import "tailwindcss";
@import "harebear-ui/styles.css";
```

```tsx
// app/layout.tsx
import type { ReactNode } from "react"
import { ThemeProvider, ThemeScript, Toaster, TooltipProvider } from "harebear-ui"
import "./globals.css"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- `ThemeScript` sets the `.dark` class before first paint, so dark-mode users don't see a light flash. `suppressHydrationWarning` on `<html>` is needed because that class is added before React hydrates.
- Every component module ships with `"use client"`, so you can import harebear-ui from server components (layouts, pages) and pass server data in as props.
- Remove the starter's own `:root` color variables and `body` styles from `globals.css`; they fight the harebear tokens.
- `AppShell` renders plain `<a>` links by default. Pass `linkComponent={Link}` (from `next/link`) for client-side navigation.

Tailwind's Next.js guide: https://tailwindcss.com/docs/installation/framework-guides/nextjs

## React Router v7 (framework mode)

```bash
npx create-react-router@latest my-app
cd my-app
npm i harebear-ui
```

The template ships Tailwind v4 through `@tailwindcss/vite`. Add the stylesheet:

```css
/* app/app.css */
@import "tailwindcss";
@import "harebear-ui/styles.css";
```

```tsx
// app/root.tsx (Layout only; keep the rest of the file)
import { ThemeProvider, ThemeScript, Toaster, TooltipProvider } from "harebear-ui"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ThemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

If the template's `app.css` sets its own font (`@theme { --font-sans: ... }`) or page colors (`html, body { @apply bg-white dark:bg-gray-950 }`), remove them, along with any Google Fonts `links` export in `root.tsx`. Geist is bundled and the tokens handle both modes.

## Check it works

Render a few components and look at them in both modes:

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle, StatusBadge, ThemeToggle } from "harebear-ui"
import { PlusIcon } from "lucide-react"

export default function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Hello harebear</h1>
        <ThemeToggle />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Deploys</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <StatusBadge tone="success">Healthy</StatusBadge>
          <Button>
            <PlusIcon /> New deploy
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
```

`lucide-react` is a dependency of harebear-ui; add it to your own `package.json` if you import icons directly (`npm i lucide-react`).

You should see a white card on a light grey page with Geist text and a blue button. The toggle flips to the dark theme.

## Troubleshooting

| Symptom                                   | Cause and fix                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Components render unstyled                | The stylesheet import is missing or comes before `@import "tailwindcss"`. It must come after.                                              |
| Some classes are missing (spacing, color) | Tailwind v3 is installed. harebear-ui needs v4 (`npm ls tailwindcss`).                                                                     |
| Flash of light theme on load (SSR)        | Render `<ThemeScript />` in `<head>`. If you pass `storageKey` or `defaultMode` to `ThemeProvider`, pass the same values to `ThemeScript`. |
| Accent or radius flashes on load (SSR)    | `accent` and `radius` props apply after hydration. For SSR, set `--brand` and `--radius` in CSS instead (see [Theming](theming.md)).       |
| Tooltips don't show                       | `TooltipProvider` is missing near the root.                                                                                                |
| `toast()` does nothing                    | `<Toaster />` is not mounted. Import `toast` from `sonner`.                                                                                |
| `init` says several Tailwind entry files  | Pass the one your app loads: `npx harebear-ui init --css src/index.css`.                                                                   |

Next: [Theming](theming.md) · [Working with AI agents](agents.md) · [Component catalog](../COMPONENTS.md)
