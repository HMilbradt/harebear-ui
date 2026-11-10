# harebear-ui

Pre-themed React components for admin tools, data apps, and AI chat. shadcn/ui primitives restyled to one opinionated design system, plus the composites you end up building every time: app shell, KPI cards, data table, trend charts, chat thread, prompt composer, model picker.

React 19 · Tailwind CSS v4 · Radix · TanStack Table v9 · Recharts 3 · TypeScript

## Install

```bash
npm i harebear-ui
```

```bash
npx harebear-ui init
```

`init` adds the stylesheet import to your Tailwind entry CSS, writes a harebear-ui section into `AGENTS.md` (or `CLAUDE.md`), and installs a Claude Code skill in `.claude/skills/`. Flags: `--css <file>`, `--no-agents`, `--no-skill`.

Manual setup, if you prefer:

```css
/* app.css */
@import "tailwindcss";
@import "harebear-ui/styles.css";
```

```tsx
import { ThemeProvider, Toaster, TooltipProvider } from "harebear-ui"

export function Root() {
  return (
    <ThemeProvider accent="#2F5BD3" radius={14}>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

Requires Tailwind CSS v4 in the app. Geist and Geist Mono are bundled.

## Use

```tsx
import { AppShell, PageHeader, StatCard, Button, DataTable } from "harebear-ui"
```

Everything imports from the package root. Primitives keep shadcn/ui names and props.

- **Component catalog:** [docs/COMPONENTS.md](docs/COMPONENTS.md), also at `node_modules/harebear-ui/docs/COMPONENTS.md` or `npx harebear-ui docs`.
- **Reference screens:** [playground/screens](playground/screens) has an admin dashboard, an AI chat, a data table with detail panel, and a status home page built only from public exports.

## Theming

Light and dark mode, accent, radius, and font are runtime props on `ThemeProvider` (`useTheme()` changes them live). Every component reads shadcn-named tokens, so you can override any of them in CSS:

```css
:root {
  --brand: #0f8a7e;
  --radius: 0.625rem;
}
.dark {
  --background: #0b0b0d;
}
```

For SSR apps, render `<ThemeScript />` in `<head>` to avoid a flash of the wrong mode.

## For AI agents

The package ships its own agent docs:

| File                          | For                                                    |
| ----------------------------- | ------------------------------------------------------ |
| `llms.txt`                    | Short index: setup, rules, component list.             |
| `docs/COMPONENTS.md`          | Every export with props and examples.                  |
| `skills/harebear-ui/SKILL.md` | Claude Code skill; `npx harebear-ui init` installs it. |

Working on this repo with an agent: see [AGENTS.md](AGENTS.md).

## Develop

```bash
pnpm install
pnpm dev     # playground on :5199
pnpm check   # lint, typecheck, test, build, package lint
```

## License

MIT
