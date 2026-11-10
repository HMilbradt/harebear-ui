import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import * as lib from "@/index"

const names = Object.keys(lib).sort()

describe("public API", () => {
  it("matches the export snapshot (update with `pnpm test -u` when the change is intended)", () => {
    expect(names).toMatchSnapshot()
  })

  it("documents every exported component in docs/COMPONENTS.md", () => {
    const docs = readFileSync(join(process.cwd(), "docs/COMPONENTS.md"), "utf8")
    const components = names.filter((n) => /^[A-Z]/.test(n))
    const missing = components.filter((n) => !new RegExp(`\\b${n}\\b`).test(docs))
    expect(missing, `Add these to docs/COMPONENTS.md: ${missing.join(", ")}`).toEqual([])
  })
})
