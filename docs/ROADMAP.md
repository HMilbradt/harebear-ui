# Roadmap: components for household and agent-first apps

Status: the "Build first" list shipped in 0.8.0 (2026-11-11). Everything else is still proposed. Built items name their exports; see `docs/COMPONENTS.md` and the "Agent-first apps" recipe there.

These come from designing Homeclub, a household app with shared to-dos, calendars, docs and an assistant (HomeBot) on every page. The design and its notes live in the `HMilbradt/homeclub` repository (`design/`, `docs/missing-components.md`, `docs/research/`). Everything below was drawn there as plain markup with harebear-ui tokens. The aim is that the next app like it needs none of that markup: the library covers the common cases.

Judged against harebear-ui 0.7.0 (`src/components/`). Props of existing components were not checked one by one; an item marked "extends" may already be partly covered.

## Reuse before building

These already exist and the Homeclub designs map onto them; new work should extend them, not fork them.

SidebarLayout, AppShell, UserMenu, ChatShell, ChatMessage, PromptInput, ConversationList, ToolSteps, TypingIndicator, ApprovalCard, Sheet, Drawer, Dialog, Popover, Sonner (Toaster), ToggleGroup, Tabs, Calendar, Empty, Avatar, Badge, Status, LinkTile, CopyField, Prose, AuthLayout.

## Build first

Most reuse across apps, and Homeclub needs each on day one.

All built in 0.8.0:

1. **AppNav** (`AppNav`, types `AppNavPlace`, `AppNavGroup`, `AppNavAction`): one config, desktop sidebar on SidebarLayout and a phone tab bar with a floating action button.
2. **Assistant layer**: `AssistantProvider`, `useAssistant`, `useAssistantPage`, `AssistantDock`, `AskBox`, `DictationButton`, `useDictation`, `browserSpeechSource`, `ActionReceipt`.
3. **Undo toast and motion**: `toastUndo` (Sonner), `Collapse`, `animate-check-pop`, all CSS and off under reduced motion.
4. **Lists**: `CheckCircle`, `TaskRow`, `SectionedList`.
5. **Settings**: `FocusLayout`, `SettingsSection`, `SettingsRow` (a settings page is FocusLayout plus sections; no separate SettingsLayout).
6. **Foundations**: `category-1` to `category-6` tokens and the `focus-box` utility.

Calendar views and SmartInput follow when a second app needs them.

## 1. Layouts and app frame (`admin/` or `layout/`)

| Component                            | What it does                                                                                                                                                                                                                                                                                        | Notes                                                      |
| :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| AppNav (built)                       | Takes one config (places, a collapsible group such as Lists, an "add" action, the profile menu). Renders the desktop sidebar (no border, active item as a raised card, profile popover at the bottom, sticky on long pages) and, under a breakpoint, a bottom tab bar with one round action button. | Extends SidebarLayout and UserMenu. The phone half is new. |
| FocusLayout (built)                  | A page outside the app frame: slim top bar with a close or back link and a title, then one centred column.                                                                                                                                                                                          | Settings, onboarding, setup flows.                         |
| SettingsSection, SettingsRow (built) | Card with a heading; rows with label, one-line description and a control slot (switch, select, segmented control, button). Rows can expand inline (change password, add a connection).                                                                                                              | Most settings pages become composition only.               |
| DetailSheet                          | A record's details: side sheet on desktop, full-screen sheet on a phone, with a close button and a scrollable body.                                                                                                                                                                                 | Extends Sheet and Drawer with one responsive API.          |
| ReaderLayout                         | Back link, title, author and updated line, actions at the top (Edit, Chat with HomeBot), then Prose.                                                                                                                                                                                                | Docs, help, notes.                                         |
| PageColumn                           | Centred column with a standard header slot (greeting or title, filter, primary input).                                                                                                                                                                                                              | Today, Upcoming, list pages.                               |
| AuthLayout, single card variant      | Calm centred card with the product mark, for sign in, invite and first-run setup.                                                                                                                                                                                                                   | Extends AuthLayout.                                        |

## 2. Assistant layer (`ai/`)

| Component                               | What it does                                                                                                                                                                                                             | Notes                                             |
| :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| AssistantProvider (built)               | Holds the current conversation across pages and knows which page is open, so the assistant can use it as context.                                                                                                        | Hook: `useAssistant()`.                           |
| AssistantDock (built)                   | Floating panel over the page (never reflows it) with header, empty state, thread, receipts and composer; a soft launcher button when closed; a link to full screen. Same on every page; pages pass suggestions only.     | Extends ChatShell.                                |
| AskBox (built)                          | Large rounded input with chips that appear as you type, suggestion pills under it, and the dictation button. Focus ring on the box, not the field.                                                                       | One placeholder per app ("Ask HomeBot anything"). |
| DictationButton, `useDictation` (built) | One button that is a microphone when empty, a stop button while listening (with listening bars and a live region), and send once there is text. The speech source plugs in (browser speech recognition, a server model). | Off-animation under reduced motion.               |
| ActionReceipt (built)                   | What the assistant did, as a compact card: round check, title, one meta line, Undo. One per action.                                                                                                                      | The core of "safe actions run on their own".      |
| WhatIDid                                | Collapsed list of plain past-tense steps under an answer.                                                                                                                                                                | A plain-language variant of ToolSteps.            |
| ProgressCard                            | A long-running job: title, status word, progress bar, time left, an action when finished.                                                                                                                                | Downloads, imports, syncs.                        |
| ChatsHome                               | Recent chats grouped Today, This week, Earlier, with search and a row menu (Rename, Delete with inline confirm).                                                                                                         | Extends ConversationList.                         |
| CitationChip                            | Pill link to the source an answer used.                                                                                                                                                                                  |                                                   |
| AssistantStatus                         | Working, needs you, done, shown on the launcher and in chat lists.                                                                                                                                                       |                                                   |

## 3. Items, lists and calendar

| Component                                  | What it does                                                                                                                           | Notes                                 |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| CheckCircle (built)                        | 24px round check, top-aligned with the first line, a pop when ticked, an "important" tint paired with a word.                          | `ui/` primitive.                      |
| TaskRow (built)                            | Check, title, one meta line, optional assignee avatar, opens a DetailSheet.                                                            | Works in any to-do or checklist app.  |
| SectionedList (built)                      | Sections, one add box, finished items folded into "Show N done", empty state, items leaving without layout shift.                      | Uses the motion helpers below.        |
| SmartInput                                 | A text input that turns phrases into removable chips; the app supplies the rules (dates, people, lists).                               | Shared by quick add and the AskBox.   |
| AgendaRow, DayStrip, WeekScroll, MiniMonth | Time, icon or check, title and whose dot; a strip of day buttons that jump to a day; stacked days you scroll; a month with event dots. | Calendar today is a date picker only. |
| SegmentedControl                           | Two or three options, raised selected segment (Mine / Everyone, Agenda / Week).                                                        | Restyle of ToggleGroup.               |
| FilterChips, VisibilityBadge               | On/off chips; "Only you" with a lock or "Everyone" with faces.                                                                         |                                       |
| InlineConfirm                              | A plain confirmation shown in place, for the few destructive actions that keep one.                                                    | Lighter than ConfirmDialog.           |
| ChoiceCards                                | Two or three large side-by-side options (Google or Calendar link, Adult or Child).                                                     |                                       |
| SearchHero, CardGrid                       | Big search box over a grid of LinkTiles grouped by topic.                                                                              |                                       |

## 4. People

| Component         | What it does                                                                                |
| :---------------- | :------------------------------------------------------------------------------------------ |
| MemberAvatar      | Photo, falling back to initial on the member's colour; sizes; ring variant. Extends Avatar. |
| AvatarStack       | Overlapping faces with a "+N".                                                              |
| AvatarUpload      | Upload, change or remove a photo with live preview.                                         |
| ColorSwatchPicker | Radio group of category colours; colours used by someone else are marked and disabled.      |

## 5. Feedback and motion

| Item                  | What it does                                                                                                       | Notes                                                                                                                                                 |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toastUndo()` (built) | Standard wrapper around Sonner: action label, Undo, 9 second window, pause on hover, stacking and entry animation. | Sonner is already the toast layer. Check its current API before building.                                                                             |
| Motion helpers        | Check pop, collapse without layout shift, an optimistic list hook (`useOptimisticList`).                           | Built as CSS with no new dependency: `animate-check-pop`, `Collapse`. `useOptimisticList` is still proposed (React 19 `useOptimistic` may be enough). |
| Celebration           | Occasional confetti when a day is cleared. Off under reduced motion.                                               | Candidate: canvas-confetti.                                                                                                                           |

## 6. Foundations (`src/styles.css`)

- **Category palette (built: `category-1..6`).** Six or so non-status colours for members, lists and calendars, each with a dark-mode value. Homeclub hard-codes hex values that stay the same in dark mode. Status colours (`success`, `warning`, `destructive`) must never double as category colours.
- **Composite focus (built: `focus-box`).** A documented class or token for "the box around a bare field shows the focus ring" (`focus-within`), so apps stop working around inline styles.
- **Size floors.** Checks 24px, phone touch targets 44px, no text under 12px. New components follow them; existing avatar initials and `kbd` are still 11px.
- **Brand mark slot.** AppNav (`brand`) and AuthLayout (`brand`) take the product mark as a prop.
- **Design canvas loading.** The design system artifact's README names `window.HarebearUI` but not which files to load on a Design canvas, so designs copy components as markup. Add a "Consuming this system" section listing the bundle and stylesheet.
