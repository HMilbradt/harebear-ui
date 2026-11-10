# harebear-ui: agent guide

This repo is the `harebear-ui` npm package: shadcn/ui primitives restyled to one design system, plus admin, data, and AI chat composites. React 19, Tailwind CSS v4, Radix (`radix-ui`), TanStack Table v9, Recharts 3, TypeScript 7, pnpm.

Consumers get compiled ESM + types from `dist/` and a Tailwind stylesheet (`harebear-ui/styles.css`). The source of truth for the look is `src/styles.css` (tokens) and the class strings in components.

## Commands

| Command                  | What it does                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`               | Playground at http://localhost:5199 with the four reference screens (`#admin`, `#chat`, `#records`, `#home`). |
| `pnpm check`             | Everything CI runs: lint, typecheck, tests, build, publint, attw. Run before you say you're done.             |
| `pnpm test`              | Vitest. `pnpm test -u` updates the export snapshot after an intended API change.                              |
| `pnpm gen`               | Regenerate `src/index.ts` from component export lists. Run after adding or renaming exports.                  |
| `pnpm format`            | Biome format + safe fixes.                                                                                    |
| `pnpm shadcn add <name>` | Pull a new shadcn component into `src/components/ui/`.                                                        |

## Layout

```
src/
  styles.css            Theme: tokens on :root/.dark, @theme mapping, @source for consumers. Shipped as harebear-ui/styles.css.
  shadcn-base.css       Vendored copy of shadcn/tailwind.css (variants, keyframes). Re-copy on shadcn upgrades.
  index.ts              Generated barrel. Do not edit by hand.
  components/ui/        shadcn primitives (radix-nova style), restyled. Keep upstream structure.
  components/theme/     ThemeProvider, ThemeToggle, ThemeScript.
  components/admin/     Layout and dashboard composites (AppShell, StatCard, PageHeader...).
  components/data/      DataTable, TrendChart, Sparkline, BarList, StatusBars.
  components/ai/        Chat composites (ChatThread, ChatMessage, PromptInput, ModelPicker...).
  hooks/, lib/utils.ts  Shared hooks and cn().
playground/screens/     Reference screens that use only public exports. They are the visual spec and usage examples.
docs/COMPONENTS.md      Consumer-facing catalog. Shipped. Test-enforced to mention every export.
llms.txt, skills/       Consumer-facing agent docs. Shipped.
bin/harebear-ui.mjs     `npx harebear-ui init|docs` for consuming apps.
test/                   Vitest: API snapshot, docs coverage, token integrity, behavior.
```

## Adding a component

1. Pick the folder by purpose (`admin`, `data`, `ai`; `ui` only for shadcn primitives).
2. Follow the existing files: `"use client"` first line, named function component, props interface exported as `<Name>Props`, `data-slot="<kebab-name>"` on the root, `className` merged last with `cn()`, rest props spread on the root.
3. Style only with tokens (`bg-card`, `text-muted-foreground`, `bg-primary-soft`, `shadow-card`, `rounded-xl`). No hex, no palette colors. Status takes a `tone` (`success | warning | danger | info | neutral`).
4. `pnpm gen`, then add the component to `docs/COMPONENTS.md` (the docs test fails otherwise) and to the index in `llms.txt`.
5. Use it in a playground screen if it is visual, and look at it in light and dark mode and at 375px width.
6. Add a behavior test in `test/components.test.tsx` if it has logic. `pnpm test -u` to accept the new export in the snapshot.
7. `pnpm check`.

## Changing shadcn primitives

- Keep upstream file structure so `pnpm shadcn add <name> -o` diffs stay readable. Change class strings, add variants; avoid restructuring.
- shadcn sometimes rewrites the utils import to `from "cn"`. It must be `from "@/lib/utils"`. Remove any `cn` dependency it adds. Same for `next-themes` (sonner uses our `useTheme`).
- New shadcn files need `"use client"` as the first line.

## Gotchas

- `@/` is a source alias. tsdown rewrites it to relative paths in `dist`. Do not import from `harebear-ui` inside `src`.
- TanStack Table v9 needs features registered in `tableFeatures()` with row-model slots; see `dataTableFeatures` in `src/components/data/data-table.tsx` and the skills shipped in `node_modules/@tanstack/react-table/skills/`.
- `src/styles.css` has `@source "./"` so a consumer's Tailwind scans `dist/`. Classes must be complete literal strings (no string concatenation) or consumers will not get the CSS.
- Biome formats with no semicolons and double quotes. Rules for `src/components/ui/**` are relaxed in `biome.json` to keep upstream code as is.

## Releasing

Bump `version` in package.json, commit, tag `vX.Y.Z`, push the tag. The `release` workflow publishes to npm with provenance (trusted publishing, no token in the repo). Ask the maintainer before tagging.
