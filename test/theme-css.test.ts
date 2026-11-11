import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

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
