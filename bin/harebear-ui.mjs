#!/usr/bin/env node
// harebear-ui CLI. Zero dependencies.
//   npx harebear-ui init   wire the stylesheet and install agent docs into this project
//   npx harebear-ui docs   print the component catalog
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const cwd = process.cwd()
const [cmd = "help", ...args] = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const IMPORT_LINE = '@import "harebear-ui/styles.css";'
const START = "<!-- harebear-ui:start -->"
const END = "<!-- harebear-ui:end -->"
const AGENT_BLOCK = `${START}
## UI: harebear-ui

All UI in this project uses the \`harebear-ui\` component library (pre-themed shadcn/ui on Tailwind v4, plus admin, data table, chart, and AI chat components).

- Read \`node_modules/harebear-ui/docs/COMPONENTS.md\` before building UI. It lists every component with props and examples.
- Import from the package root: \`import { Button, Card, DataTable } from "harebear-ui"\`.
- Style only with theme tokens (\`bg-card\`, \`bg-muted\`, \`text-muted-foreground\`, \`bg-primary-soft\`, \`text-success\`, \`shadow-card\`, \`rounded-xl\`). No hex or Tailwind palette colors.
- Check new screens in light and dark mode and at phone width.
${END}`

function findCss(dir, depth = 0, out = []) {
  if (depth > 4) return out
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || ["node_modules", "dist", "build", ".next", "out", "coverage"].includes(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) findCss(p, depth + 1, out)
    else if (/\.css$/.test(name) && /@import\s+["']tailwindcss["']/.test(readFileSync(p, "utf8"))) out.push(p)
  }
  return out
}

function wireCss() {
  const explicit = option("css")
  const files = explicit ? [join(cwd, explicit)] : findCss(cwd)
  if (files.length === 0) {
    console.log(
      `! No CSS file with @import "tailwindcss" found. Add this after your Tailwind import:\n    ${IMPORT_LINE}`,
    )
    return
  }
  if (files.length > 1 && !explicit) {
    console.log(
      `! Several Tailwind entry files found; pass one with --css:\n${files.map((f) => `    ${relative(cwd, f)}`).join("\n")}`,
    )
    return
  }
  const file = files[0]
  const css = readFileSync(file, "utf8")
  if (css.includes("harebear-ui/styles.css")) {
    console.log(`✓ ${relative(cwd, file)} already imports harebear-ui/styles.css`)
    return
  }
  const next = css.replace(/(@import\s+["']tailwindcss["'][^;]*;)/, `$1\n${IMPORT_LINE}`)
  writeFileSync(file, next)
  console.log(`✓ Added ${IMPORT_LINE} to ${relative(cwd, file)}`)
}

function writeAgentInstructions() {
  const target = ["AGENTS.md", "CLAUDE.md"].map((f) => join(cwd, f)).find(existsSync) ?? join(cwd, "AGENTS.md")
  const current = existsSync(target) ? readFileSync(target, "utf8") : ""
  const block = new RegExp(`${START}[\\s\\S]*?${END}`)
  const next = block.test(current)
    ? current.replace(block, AGENT_BLOCK)
    : `${current}${current && !current.endsWith("\n") ? "\n" : ""}${current ? "\n" : ""}${AGENT_BLOCK}\n`
  writeFileSync(target, next)
  console.log(`✓ Wrote harebear-ui section to ${relative(cwd, target)}`)
}

function installSkill() {
  const src = join(pkgRoot, "skills/harebear-ui/SKILL.md")
  const destDir = join(cwd, ".claude/skills/harebear-ui")
  mkdirSync(destDir, { recursive: true })
  writeFileSync(join(destDir, "SKILL.md"), readFileSync(src, "utf8"))
  console.log(`✓ Installed Claude Code skill to ${relative(cwd, destDir)}/SKILL.md`)
}

switch (cmd) {
  case "init": {
    if (!existsSync(join(cwd, "package.json"))) {
      console.error("Run this from your app's root (no package.json here).")
      process.exit(1)
    }
    wireCss()
    if (!flag("no-agents")) writeAgentInstructions()
    if (!flag("no-skill")) installSkill()
    console.log(`
Next: wrap your app root.

  import { ThemeProvider, Toaster, TooltipProvider } from "harebear-ui"

  <ThemeProvider>
    <TooltipProvider>
      <App />
      <Toaster />
    </TooltipProvider>
  </ThemeProvider>
`)
    break
  }
  case "docs":
    process.stdout.write(readFileSync(join(pkgRoot, "docs/COMPONENTS.md"), "utf8"))
    break
  default:
    console.log(`harebear-ui

  npx harebear-ui init [--css <file>] [--no-agents] [--no-skill]
      Add the stylesheet import after @import "tailwindcss", add a harebear-ui
      section to AGENTS.md (or CLAUDE.md), and install the Claude Code skill.

  npx harebear-ui docs
      Print the component catalog (props and examples for every export).
`)
}
