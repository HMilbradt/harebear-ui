import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { badgeVariants } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8")
const block = (selector: string) => css.match(new RegExp(`${selector} \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? ""

describe("theme tokens", () => {
  const root = block(":root")
  const dark = block("\\.dark")
  const theme = block("@theme inline")

  it("defines every token the Tailwind theme maps to", () => {
    const used = [...theme.matchAll(/--color-[\w-]+: var\((--[\w-]+)\)/g)].map((m) => m[1])
    const missing = used.filter((v) => !root.includes(`${v}:`))
    expect(missing).toEqual([])
  })

  it("only overrides tokens in .dark that exist in :root", () => {
    const darkVars = [...dark.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1])
    const unknown = darkVars.filter((v) => !root.includes(`${v}:`))
    expect(unknown).toEqual([])
  })

  it("keeps the category palette distinct from status colors in both modes", () => {
    for (const mode of [root, dark]) {
      const value = (name: string) => mode.match(new RegExp(`${name}: ([^;]+);`))?.[1]
      const status = ["--success", "--warning", "--destructive"].map(value)
      const categories = [1, 2, 3, 4, 5, 6].map((i) => value(`--category-${i}`))
      expect(categories.every(Boolean)).toBe(true)
      expect(categories.filter((c) => status.includes(c))).toEqual([])
      expect(new Set(categories).size).toBe(6)
    }
  })
})

// sRGB <-> OKLab, to resolve the theme's color-mix() tokens and measure WCAG contrast the way axe does.
type RGB = [number, number, number]
const hex = (h: string): RGB => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255) as RGB
const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLin = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const toOklab = (rgb: RGB): RGB => {
  const [r, g, b] = rgb.map(toLin) as RGB
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
const fromOklab = ([L, a, b]: RGB): RGB => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.min(1, Math.max(0, fromLin(c)))) as RGB
}
/** color-mix(in oklab, x p%, y) */
const mix = (x: RGB, y: RGB, p: number) => {
  const [a, b] = [toOklab(x), toOklab(y)]
  return fromOklab(a.map((v, i) => v * p + (b[i] ?? 0) * (1 - p)) as RGB)
}
const luminance = (rgb: RGB) => {
  const [r, g, b] = rgb.map(toLin) as RGB
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

describe("soft button contrast (axe color-contrast, 4.5:1 for text under 18px)", () => {
  const dark = block("\\.dark")
  const pct = (re: RegExp, src: string) => Number(src.match(re)?.[1]) / 100
  const white: RGB = [1, 1, 1]
  const card = hex(dark.match(/--card: (#[0-9a-f]{6});/)?.[1] ?? "")
  const brandWhite = pct(/--primary: color-mix\(in oklab, var\(--brand\), white (\d+)%\)/, dark)
  const softPrimary = pct(/--primary-soft: color-mix\(in oklab, var\(--primary\) (\d+)%, var\(--card\)\)/, dark)
  const soft = buttonVariants({ variant: "soft" })
  const hoverPrimary = pct(/hover:bg-\[color-mix\(in_oklab,var\(--primary-soft\),var\(--primary\)_(\d+)%\)\]/, soft)
  // Text on primary-soft: the --primary-soft-foreground token, if the dark theme mixes it with white; else plain --primary.
  const textWhite = dark.match(/--primary-soft-foreground: color-mix\(in oklab, var\(--primary\), white (\d+)%\);/)?.[1]

  it("uses the soft foreground token for soft-tinted text", () => {
    expect(soft).toContain("text-primary-soft-foreground")
    expect(badgeVariants({ variant: "soft" })).toContain("text-primary-soft-foreground")
  })

  // The default brand, plus a violet and a navy brand passed to ThemeProvider accent.
  for (const brand of ["#2f5bd3", "#7c3aed", "#1e3a8a"]) {
    it(`passes in dark mode with brand ${brand}, at rest and on hover`, () => {
      expect([brandWhite, softPrimary, hoverPrimary].every((n) => n > 0 && n < 1)).toBe(true)
      const primary = mix(hex(brand), white, 1 - brandWhite)
      const bg = mix(primary, card, softPrimary)
      const hoverBg = mix(bg, primary, 1 - hoverPrimary)
      const text = textWhite ? mix(primary, white, 1 - Number(textWhite) / 100) : primary
      expect(contrast(text, bg)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(text, hoverBg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe("page width", () => {
  it("keeps a stable scrollbar gutter and drops the scroll lock's extra body margin", () => {
    expect(css).toMatch(/html\s*{[^}]*scrollbar-gutter:\s*stable/)
    expect(css).toMatch(/html body\[data-scroll-locked\]\s*{[^}]*margin-right:\s*0 !important/)
  })
})
