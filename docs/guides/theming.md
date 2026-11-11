# Theming

Every harebear-ui component reads shadcn-named CSS variables. You change the look in three places, from least to most effort:

1. `ThemeProvider` props: accent, radius, font, default mode.
2. CSS variables after the stylesheet import: any token, per mode.
3. `className` on a component: one-off layout. Not for colors.

## ThemeProvider

```tsx
;<ThemeProvider defaultMode="system" accent="#0f8a7e" radius={10} font="Inter">
  <App />
</ThemeProvider>
```

| Prop          | Default            | What it does                                                                                  |
| ------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `defaultMode` | `"system"`         | `"light"`, `"dark"` or `"system"`. Used until the user picks a mode.                          |
| `accent`      | `#2f5bd3`          | Any CSS color. Sets `--brand`; `primary`, `primary-soft`, rings and `chart-1` derive from it. |
| `radius`      | `14`               | Base corner radius in px. The `rounded-sm` to `rounded-4xl` scale derives from it.            |
| `font`        | Geist              | Body font family name. Load the font yourself; Geist and Geist Mono are bundled.              |
| `storageKey`  | `"harebear-theme"` | localStorage key for the chosen mode. `null` turns persistence off.                           |

In dark mode `primary` is the accent mixed 26% toward white, so one accent reads well on both backgrounds.

### Change it at runtime

```tsx
import { useTheme } from "harebear-ui"

function AccentPicker() {
  const { accent, setAccent, radius, setRadius, mode, setMode } = useTheme()
  return (
    <>
      <input type="color" value={accent ?? "#2f5bd3"} onChange={(e) => setAccent(e.target.value)} />
      <input type="range" min={0} max={24} value={radius ?? 14} onChange={(e) => setRadius(Number(e.target.value))} />
      <button type="button" onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
        Toggle mode
      </button>
    </>
  )
}
```

`ThemeToggle` is the ready-made light/dark icon button. `UserMenu` includes a Light / Dark / System choice.

## CSS variables

Override tokens after the import. `:root` is light mode, `.dark` is dark mode:

```css
@import "tailwindcss";
@import "harebear-ui/styles.css";

:root {
  --brand: #0f8a7e;
  --radius: 0.625rem;
}

.dark {
  --background: #0b0b0d;
  --card: #141417;
}
```

Use CSS rather than props when the first paint must be right (SSR apps): `ThemeProvider` applies `accent` and `radius` in an effect, after hydration.

The full token list, with what each is for, is in the [component catalog](../COMPONENTS.md#tokens) (`npx harebear-ui docs Tokens`). The ones you will use most:

| Token                               | Tailwind utilities                                        |
| ----------------------------------- | --------------------------------------------------------- |
| `background`, `foreground`          | `bg-background`, `text-foreground`                        |
| `card`                              | `bg-card` (raised surfaces)                               |
| `muted`, `muted-foreground`         | `bg-muted` (inputs, quiet panels), secondary text         |
| `primary`, `primary-soft`           | `bg-primary`, `bg-primary-soft text-primary`              |
| `success`, `warning`, `destructive` | `text-success`, `bg-success/12`, and so on                |
| `category-1` … `category-6`         | `bg-category-2` (members, lists, calendars; never status) |
| `border`                            | `border-border` (the default border color)                |
| elevation                           | `shadow-card` (the one shadow)                            |

## Rules that keep a themed app consistent

- Colors come from tokens only. No hex values, no Tailwind palette colors (`bg-blue-500`), no inline `style={{ color }}`. A palette color will look wrong in one of the two modes.
- Status is a tone, not a color: `tone="success" | "warning" | "danger" | "info" | "neutral"` on `StatusBadge`, `StatusDot`, `Badge`, `Timeline`, `StatusBars`, `LinkTile`.
- Cards are `rounded-xl`, controls are `rounded-md`. Both follow `--radius`.
- If you reach for `className` to fix a harebear component's color, spacing or border, that is a gap in the library. Open an issue rather than overriding it per screen.

## Fonts

Geist (sans) and Geist Mono are bundled and on by default. To use another family, load it however your framework does (`next/font`, `@fontsource`, a `<link>`), then pass its name:

```tsx
<ThemeProvider font="Inter">
```

Or set it in CSS: `:root { --hb-font-sans: "Inter", ui-sans-serif, system-ui, sans-serif; }`. Code uses `--hb-font-mono`.

Next: [Working with AI agents](agents.md) · [Component catalog](../COMPONENTS.md)
