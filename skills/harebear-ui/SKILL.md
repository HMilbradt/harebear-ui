---

name: harebear-ui
description: Build React UI with the harebear-ui component library (pre-themed shadcn/ui + admin, data table, chart, and AI chat components on Tailwind v4). Use whenever creating or changing UI, pages, layouts, dashboards, tables, forms, or chat interfaces in a project that depends on harebear-ui.
---

# Building UI with harebear-ui

This project uses `harebear-ui` for all UI. Its theme, tokens, and components are already installed.

## Before writing UI

1. Read the catalog: `node_modules/harebear-ui/docs/COMPONENTS.md`. It lists every export with props and examples. To pull only what you need, run `npx harebear-ui docs DataTable StatCard` (export names, a name prefix such as `Prompt`, or a section such as `Tokens`).
2. Pick existing components first. Build new components only by composing harebear-ui parts.
3. For a whole screen, start from the closest reference screen: admin dashboard, AI chat, data table with detail panel, status home page, or auth (https://github.com/hmilbradt/harebear-ui/tree/main/playground/screens).

## Rules

- Import from the package root: `import { Button, Card, DataTable } from "harebear-ui"`. Never copy component source into the app.
- Primitives keep shadcn/ui names, parts, and props (Dialog, DropdownMenu, Select, Sidebar, Tabs...).
- Style only with theme tokens: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-primary-soft text-primary-soft-foreground`, `text-success`, `text-warning`, `text-destructive`, `border-border`, `shadow-card`, `rounded-md` (controls), `rounded-xl` (cards). No hex colors, no Tailwind palette colors like `bg-blue-500`, no inline color styles.
- Status uses a tone prop: `success | warning | danger | info | neutral` (StatusBadge, StatusDot, Timeline, StatusBars, LinkTile).
- Icons are lucide-react elements passed as nodes: `icon={<UsersIcon />}`. Icon-only buttons need `aria-label`.
- Touch: `Button`, `Toggle` and `Input` already meet 44px under `pointer: coarse` (buttons via an invisible `::after`, which `overflow-hidden` ancestors clip: there, size the button itself with `pointer-coarse:size-11`); don't override their size.
- Compose `className` with `cn()` from harebear-ui.
- Lay out pages as columns of `Card`s with `gap-5`, page sections with `gap-7`. Use `PageHeader` for page titles and `AppShell` for sidebar apps. Every shell (`AppShell`, `ChatShell`) is built on `SidebarLayout`, which gives the collapsible icon rail; use it directly for other sidebar layouts instead of the raw Sidebar primitives.
- DataTable columns: define with `createDataTableColumnHelper<Row>()` at module scope, pass `getRowId`.
- Chat apps: `ChatShell` (sidebar: `AppBrand`, `NewConversationButton`, `ConversationList` + `groupByDate`, `UserMenu`; optional `details` panel) around a `ChatPanel` (title, actions, `notice`, `composer`). Don't hand-build the sidebar, rail or panel.
- Chat content: `ChatMessage role="user" | "assistant"`; render model output inside `Prose`; composer is `PromptInput` (+ `PromptInputChip`, `PromptInputSelect`; `label` names its field, default the placeholder); code is `CodeSnippet`; agent tool calls are `ToolGroup`/`ToolStep` (or the lighter `Trace`); permission prompts are `ApprovalCard`/`ApprovalResult`; working state is `TypingIndicator label`; clarifying questions are `Questionnaire`.
- Agent-first and household apps: `AppNav` (sidebar on desktop, tab bar on phones; `fill` for a chat page, minus the round action button's space when `action` is set) around pages, each a `Page` with a `PageHeader` (`UserMenu compact className="md:hidden"` in its actions, hidden from md up) and `PageSection`s (h2; `Heading level={3}` inside cards); `AssistantProvider` + `AssistantDock` (pages call `useAssistantPage`); `AskBox` with `DictationButton` (inline answers: `AskBox` `reply={reply}` from `useAssistant()` plus your own `chatHref`, `send(text, { open: false })`; Stop: `pending` + `onStop={stop}`; follow-ups while it works: `queue` on `AskBox`/`PromptInput`/`AssistantDock`, and in `onSend` tell the server to stop only when `signal.reason === "stop"`, not `"superseded"`; a superseded send's later `append`/`update` calls and return value are dropped, so the new send shows the rest); `ActionReceipt` for each action the agent took; `toastUndo` after undoable changes; to-dos are `SectionedList` / `TaskRow` / `CheckCircle` (`lingerMs` = the Undo window); a week agenda is `DayStrip sticky` + one `SectionedList` with a section per day and `AgendaRow` rows via `renderItem`; settings are `FocusLayout` + `SettingsSection` + `SettingsRow`. Recipe: `npx harebear-ui docs "Agent-first apps"`. Categories (members, lists) use `category-1..6`. People are `MemberAvatar` (photo or initials on their `color`), `AvatarStack` and `VisibilityBadge`; list dots are `CategoryDot` (`locked` for private); profile settings use `AvatarUpload` and `ColorSwatchPicker`.
- Notices: `Alert variant="warning" | "success" | "info" | "destructive"`. Confirmations: `ConfirmDialog`; one line of text (New, Rename): `PromptDialog`. Toasts: `toast` / `toast.success` / `toast.error` from harebear-ui. Copyable IDs: `CopyField`. Live status: `StatusDot`/`StatusBadge` with `pulse`.
- If you need a className to fix spacing, color, wrapping or borders on a harebear component, that is a library gap: report it instead of overriding.
- Sign-in and sign-up pages: `AuthLayout` + `LoginForm` / `SignupForm` (extra fields as `children`) / `NewPasswordForm`; other signed-out steps use `AuthForm`. Don't hand-build auth forms.
- Form fields beyond `Input`: `PasswordInput` (Show/Hide; every password field), `DateTimePicker` (`{ date: "YYYY-MM-DD", time?: "HH:MM" }`, floating local), `TimeZonePicker` (IANA name), `MarkdownEditor` (Write/Preview), `ChecklistEditor` (steps: tick, remove, add), `CommentThread` (comments + box). A record's details open in `DetailSheet` (side sheet on desktop, full screen on phones). Render Markdown strings with `Markdown` (GFM, no raw HTML, `> Tip:` becomes a `Callout`, `linkComponent` for in-app links), not your own parser. Rare joy moments: mount `Celebration` once, call `celebrate()`.
- Theme: `ThemeProvider` at the root (`accent`, `radius`, `defaultMode`), `ThemeToggle` for the light/dark button. Both modes must work: never style for only one.

## Check your work

- Run the app and look at the screen in light and dark mode.
- Narrow the viewport to phone width: rows should wrap, tables scroll inside their card, and the sidebar becomes a sheet.
