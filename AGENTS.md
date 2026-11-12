# harebear-ui: agent guide

This repo is the `harebear-ui` npm package: shadcn/ui primitives restyled to one design system, plus admin, data, and AI chat composites. React 19, Tailwind CSS v4, Radix (`radix-ui`), TanStack Table v9, Recharts 3, TypeScript 7, pnpm.

Consumers get compiled ESM + types from `dist/` and a Tailwind stylesheet (`harebear-ui/styles.css`). The source of truth for the look is `src/styles.css` (tokens) and the class strings in components.

## Commands

| Command                  | What it does                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `pnpm dev`               | Playground at http://localhost:5199 with the reference screens.                                   |
| `pnpm check`             | Everything CI runs: lint, typecheck, tests, build, publint, attw. Run before you say you're done. |
| `pnpm test`              | Vitest. `pnpm test -u` updates the export snapshot after an intended API change.                  |
| `pnpm gen`               | Regenerate `src/index.ts` from component export lists. Run after adding or renaming exports.      |
| `pnpm format`            | Biome format + safe fixes.                                                                        |
| `pnpm shadcn add <name>` | Pull a new shadcn component into `src/components/ui/`.                                            |
| `pnpm shots [filter]`    | Regenerate README images in `.github/assets/` (needs `pnpm dev` running, Chrome and `cwebp`).     |

## Layout

```
src/
  styles.css            Theme: tokens on :root/.dark, @theme mapping, @source for consumers. Shipped as harebear-ui/styles.css.
  shadcn-base.css       Vendored copy of shadcn/tailwind.css (variants, keyframes). Re-copy on shadcn upgrades.
  index.ts              Generated barrel. Do not edit by hand.
  components/ui/        shadcn primitives (radix-nova style), restyled. Keep upstream structure.
  components/theme/     ThemeProvider, ThemeToggle, ThemeScript.
  components/admin/     Layout and dashboard composites (AppShell, AppNav, FocusLayout, SettingsSection, StatCard...).
  components/data/      DataTable, TrendChart, Sparkline, BarList, StatusBars, TaskRow, SectionedList, AgendaRow, DayStrip.
  components/ai/        Chat composites (ChatThread, ChatMessage, PromptInput...) and the assistant layer (AssistantProvider, AssistantDock, AskBox, DictationButton, ActionReceipt).
  components/auth/      AuthLayout, LoginForm, SignupForm (parameterized shadcn login/signup blocks).
  components/layout/    Prop-driven layout and text (Stack, Text, Metric, ShowMore, Collapse).
  hooks/, lib/utils.ts  Shared hooks and cn().
playground/screens/     Reference screens that use only public exports (#admin, #chat, #agent, #records, #home, #household, #settings, #auth, #catalog). Visual spec and usage examples.
docs/COMPONENTS.md      Consumer-facing catalog. Shipped. Test-enforced to mention every export. "Agent-first apps" is the recipe for household/assistant apps.
docs/ROADMAP.md         Proposed and built components for household and agent-first apps. Mark items built when they land.
docs/guides/            Getting started (per framework), theming, working with agents. Shipped.
llms.txt, skills/       Consumer-facing agent docs. Shipped.
bin/harebear-ui.mjs     `npx harebear-ui init|docs [name...]` for consuming apps. Zero dependencies.
scripts/screenshots.mjs `pnpm shots`: captures playground screens and renders .github/assets/art/*.html to images.
.github/assets/         README imagery (not shipped): logo.svg, screens/*.webp, hero/light-dark/agents art, social.png.
test/                   Vitest: API snapshot, docs coverage, token integrity, behavior.
```

## Adding a component

1. Pick the folder by purpose (`admin`, `layout`, `data`, `ai`, `auth`; `ui` only for shadcn primitives and small harebear primitives such as `CheckCircle`).
2. Follow the existing files: `"use client"` first line, named function component, props interface exported as `<Name>Props`, `data-slot="<kebab-name>"` on the root, `className` merged last with `cn()`, rest props spread on the root.
3. Style only with tokens (`bg-card`, `text-muted-foreground`, `bg-primary-soft`, `shadow-card`, `rounded-xl`). No hex, no palette colors. Status takes a `tone` (`success | warning | danger | info | neutral`); categories (members, lists) use `category-1..6`. A box around a bare field uses `focus-box`. Motion is CSS only and off under `prefers-reduced-motion` (`motion-reduce:`; `Collapse` for height changes).
4. Floors: checks 24px, phone touch targets 44px, no text under 12px, icon-only buttons have `aria-label`.
5. `pnpm gen`, then add the component to `docs/COMPONENTS.md` (the docs test fails otherwise) and to the index in `llms.txt`. Use a heading like ``### `Name` `` or a table row with the name in backticks, so `npx harebear-ui docs Name` finds it.
6. Use it in a playground screen if it is visual, and look at it in light and dark mode and at 375px width.
7. Add a behavior test in `test/` if it has logic (`components.test.tsx`, `building-blocks.test.tsx`, `household.test.tsx` for the household and assistant layer, `people.test.tsx` (avatars, category colours), `forms.test.tsx` (form fields, DetailSheet, Prose tips)). `pnpm test -u` to accept the new export in the snapshot.
8. `pnpm check`.

## Looking at your work

- `pnpm dev`, then open http://localhost:5199/#admin (or `#chat`, `#agent`, `#records`, `#home`, `#household`, `#settings`, `#auth`, `#catalog`).
- `?mode=dark` or `?mode=light` pins the theme without touching localStorage; `?shot` hides the screen switcher. Example: http://localhost:5199/?mode=dark&shot#agent
- A headless capture: `pnpm shots admin` writes `.github/assets/screens/admin-*.webp`.

## README imagery

- `.github/assets/logo.svg` is the mark. It is hand-written SVG; edit it directly. `logo.png` is exported from it.
- Screens are real playground captures. Art (`hero`, `light-dark`, `agents`) is HTML in `.github/assets/art/` that composes those captures, rendered by `pnpm shots`. `social.png` is the hero at 1x for GitHub's social preview (upload it by hand in repo Settings).
- After a visible change to a screen or the theme, run `pnpm shots` and commit the images with the change. Check the results by eye before committing.
- If `npx harebear-ui init` output changes, update the terminal text in `art/agents.html` to match.

## Changing shadcn primitives

- Keep upstream file structure so `pnpm shadcn add <name> -o` diffs stay readable. Change class strings, add variants; avoid restructuring.
- shadcn sometimes rewrites the utils import to `from "cn"`. It must be `from "@/lib/utils"`. Remove any `cn` dependency it adds. Same for `next-themes` (sonner uses our `useTheme`).
- New shadcn files need `"use client"` as the first line.
- Restyle new primitives to harebear's look: form controls are 40px `rounded-md bg-muted border-transparent` with `focus-visible:border-primary focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15`; replace `border-input` / `dark:bg-input/30` patterns; selected states use `bg-primary-soft`.
- The package includes every `registry:ui` item. Check for gaps with `pnpm shadcn list @shadcn --json` and compare names against `src/components/ui/`.

## Gotchas

- `@/` is a source alias. tsdown rewrites it to relative paths in `dist`. Do not import from `harebear-ui` inside `src`.
- TanStack Table v9 needs features registered in `tableFeatures()` with row-model slots; see `dataTableFeatures` in `src/components/data/data-table.tsx` and the skills shipped in `node_modules/@tanstack/react-table/skills/`.
- `src/styles.css` has `@source "./"` so a consumer's Tailwind scans `dist/`. Classes must be complete literal strings (no string concatenation) or consumers will not get the CSS.
- Biome formats with no semicolons and double quotes. Rules for `src/components/ui/**` are relaxed in `biome.json` to keep upstream code as is.

## Releasing

Bump `version` in package.json, commit, tag `vX.Y.Z`, push the tag. The `release` workflow publishes to npm with provenance (trusted publishing, no token in the repo). Ask the maintainer before tagging.
