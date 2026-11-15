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

describe("confetti keyframes (Celebration)", () => {
  const frames = css.match(/@keyframes hb-confetti \{([\s\S]*?)\n\}/)?.[1] ?? ""
  const stops = [...frames.matchAll(/^ {2}(\d+)% \{([\s\S]*?)^ {2}\}/gm)].map((m) => ({
    at: Number(m[1]) / 100,
    body: m[2] ?? "",
  }))
  // Share of the fall covered at each stop: (60vh - var(--hb-y)) * k.
  const fall = stops
    .map((s) => ({ at: s.at, k: Number(s.body.match(/\(60vh - var\(--hb-y\)\) \* ([\d.]+)/)?.[1] ?? Number.NaN) }))
    .filter((s) => !Number.isNaN(s.k))

  it("peaks within the first 35% and falls for at least twice as long as it rose", () => {
    const peak = stops.find((s) => s.body.includes("translate(var(--hb-x), var(--hb-y))"))
    expect(peak?.at).toBeLessThanOrEqual(0.35)
    expect(1 - (peak?.at ?? 1)).toBeGreaterThanOrEqual(2 * (peak?.at ?? 1))
    expect(fall[0]?.at).toBeGreaterThan(peak?.at ?? 1)
  })

  it("falls ever further, its speed levelling off, while it drifts, sways, spins and flutters", () => {
    const speeds = fall.map((s, i) => {
      const prev = fall[i - 1] ?? { at: 0.24, k: 0 }
      return (s.k - prev.k) / (s.at - prev.at)
    })
    expect(speeds.every((v) => v > 0)).toBe(true)
    const [a, b] = speeds.slice(-2) as [number, number]
    expect(Math.abs(b - a) / a).toBeLessThan(0.15)
    expect(speeds[0]).toBeLessThan(b / 2)
    expect(fall.at(-1)?.k).toBe(1)
    for (const v of ["--hb-drift", "--hb-sway", "--hb-r", "--hb-flip"]) expect(frames).toContain(`var(${v})`)
    expect(frames).toContain("rotate3d(")
  })

  it("fades over the last quarter", () => {
    expect(stops.find((s) => s.at === 0.75)?.body).toContain("opacity: 1;")
    expect(stops.at(-1)?.body).toContain("opacity: 0;")
  })

  it("is off under reduced motion, as are view transitions", () => {
    const reduce = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n {0,2}\}/g)].map(
      (m) => m[1] ?? "",
    )
    expect(reduce.some((r) => /\.animate-confetti[\s\S]*?animation: none/.test(r))).toBe(true)
    expect(
      reduce.some((r) =>
        /::view-transition-group\(\*\)[\s\S]*?::view-transition-new\(\*\)[\s\S]*?animation: none/.test(r),
      ),
    ).toBe(true)
  })
})

describe("view transitions", () => {
  // A whole rule in the base layer: the selector list starts after the previous rule or comment.
  const rule = (selector: string) => css.match(new RegExp(`(?:\\}|\\*/)\\n  ${selector} \\{([\\s\\S]*?)\\}`))?.[1] ?? ""

  it("move named elements over 400 ms on a decelerating curve", () => {
    const group = rule("::view-transition-group\\(\\*\\)")
    expect(group).toContain("animation-duration: 400ms")
    expect(group).toContain("animation-timing-function: cubic-bezier(0.2, 0, 0, 1)")
  })

  it("draw a named element's new image over the old one, without plus-lighter blending", () => {
    expect(rule("::view-transition-old\\(\\*\\)")).toContain("animation: none")
    const incoming = rule("::view-transition-new\\(\\*\\)")
    expect(incoming).toMatch(/animation: hb-view-fade-in 300ms /)
    expect(incoming).toContain("mix-blend-mode: normal")
    const frames = css.match(/@keyframes hb-view-fade-in \{([\s\S]*?)\n\}/)?.[1] ?? ""
    expect(frames).toMatch(/from \{\s*opacity: 0;\s*\}/)
  })

  it("fade the page through: the old page is gone before the new one starts to show", () => {
    expect(rule("::view-transition-old\\(root\\)")).toMatch(/animation: hb-view-fade-out 100ms .* both/)
    expect(rule("::view-transition-new\\(root\\)")).toMatch(/animation: hb-view-fade-in 250ms .* 100ms both/)
    const frames = css.match(/@keyframes hb-view-fade-out \{([\s\S]*?)\n\}/)?.[1] ?? ""
    expect(frames).toMatch(/to \{\s*opacity: 0;\s*\}/)
  })

  it("draw a morph element as one clipped box whose old image gives way to the new within 100 ms", () => {
    const group = rule("::view-transition-group\\(\\*\\.morph\\)")
    expect(group).toContain("overflow: clip")
    expect(group).toContain("border-radius: var(--radius)")
    const images = rule("::view-transition-old\\(\\*\\.morph\\),\\n  ::view-transition-new\\(\\*\\.morph\\)")
    for (const decl of ["height: 100%", "object-fit: none", "object-position: left top"]) expect(images).toContain(decl)
    expect(rule("::view-transition-old\\(\\*\\.morph\\)")).toMatch(/animation: hb-view-fade-out 100ms /)
    expect(rule("::view-transition-new\\(\\*\\.morph\\)")).toMatch(/animation: hb-view-fade-in 100ms /)
  })
})
