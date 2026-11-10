---

name: harebear-ui
description: Build React UI with the harebear-ui component library (pre-themed shadcn/ui + admin, data table, chart, and AI chat components on Tailwind v4). Use whenever creating or changing UI, pages, layouts, dashboards, tables, forms, or chat interfaces in a project that depends on harebear-ui.
---

# Building UI with harebear-ui

This project uses `harebear-ui` for all UI. Its theme, tokens, and components are already installed.

## Before writing UI

1. Read the catalog: `node_modules/harebear-ui/docs/COMPONENTS.md`. It lists every export with props and examples.
2. Pick existing components first. Build new components only by composing harebear-ui parts.
3. For a whole screen, start from the closest reference screen: admin dashboard, AI chat, data table with detail panel, or status home page (https://github.com/hmilbradt/harebear-ui/tree/main/playground/screens).

## Rules

- Import from the package root: `import { Button, Card, DataTable } from "harebear-ui"`. Never copy component source into the app.
- Primitives keep shadcn/ui names, parts, and props (Dialog, DropdownMenu, Select, Sidebar, Tabs...).
- Style only with theme tokens: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-primary-soft text-primary`, `text-success`, `text-warning`, `text-destructive`, `border-border`, `shadow-card`, `rounded-md` (controls), `rounded-xl` (cards). No hex colors, no Tailwind palette colors like `bg-blue-500`, no inline color styles.
- Status uses a tone prop: `success | warning | danger | info | neutral` (StatusBadge, StatusDot, Timeline, StatusBars, LinkTile).
- Icons are lucide-react elements passed as nodes: `icon={<UsersIcon />}`. Icon-only buttons need `aria-label`.
- Compose `className` with `cn()` from harebear-ui.
- Lay out pages as columns of `Card`s with `gap-5`, page sections with `gap-7`. Use `PageHeader` for page titles and `AppShell` for sidebar apps.
- DataTable columns: define with `createDataTableColumnHelper<Row>()` at module scope, pass `getRowId`.
- Chat: `ChatThread` > `ChatMessage role="user" | "assistant"`; render model output inside `Prose`; composer is `PromptInput`.
- Theme: `ThemeProvider` at the root (`accent`, `radius`, `defaultMode`), `ThemeToggle` for the light/dark button. Both modes must work: never style for only one.

## Check your work

- Run the app and look at the screen in light and dark mode.
- Narrow the viewport to phone width: rows should wrap, tables scroll inside their card, and the sidebar becomes a sheet.
