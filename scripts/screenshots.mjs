#!/usr/bin/env node
// Regenerate the README imagery in .github/assets/. No npm dependencies: drives headless Chrome from its CLI.
//
//   pnpm dev            # in another terminal (playground on :5199)
//   pnpm shots          # all images
//   pnpm shots admin    # only images whose name contains "admin"
//
// Screens are playground pages captured with ?mode=dark|light&shot. Art is the HTML in .github/assets/art/,
// which composes those screenshots, so screens render first.
// Output is WebP (needs `cwebp`: brew install webp, apt install webp), except two PNGs: social.png, the
// 1280x640 GitHub social preview (Settings > Social preview takes PNG/JPG under 1 MB), and logo.png, a
// 512px transparent export of logo.svg for avatars and anywhere SVG isn't accepted.
// Env: CHROME=/path/to/chrome, PLAYGROUND=http://localhost:5199
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const assets = join(root, ".github/assets")
const playground = process.env.PLAYGROUND ?? "http://localhost:5199"
const filter = process.argv[2]

const chrome =
  process.env.CHROME ??
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find(existsSync)

if (!chrome) {
  console.error("No Chrome found. Set CHROME=/path/to/chrome.")
  process.exit(1)
}
try {
  execFileSync("cwebp", ["-version"], { stdio: "ignore" })
} catch {
  console.error("cwebp not found. Install it: brew install webp (macOS) or apt install webp (Debian/Ubuntu).")
  process.exit(1)
}

// name, url, viewport (CSS px). Images render at 2x unless scale says otherwise.
const screens = [
  ["admin-dark", "admin", "dark"],
  ["admin-light", "admin", "light"],
  ["chat-dark", "chat", "dark"],
  ["agent-dark", "agent", "dark"],
  ["records-dark", "records", "dark"],
  ["home-dark", "home", "dark"],
  ["auth-dark", "auth", "dark"],
].map(([name, screen, mode]) => ({
  name,
  out: join(assets, "screens", `${name}.webp`),
  url: `${playground}/?mode=${mode}&shot#${screen}`,
  size: [1440, 900],
}))

const art = [
  ["hero", "hero", 1280, 640],
  ["light-dark", "light-dark", 1280, 720],
  ["agents", "agents", 1280, 520],
  ["social", "hero", 1280, 640, 1],
].map(([name, page, w, h, scale = 2]) => ({
  name,
  out: join(assets, scale === 1 ? `${name}.png` : `${name}.webp`),
  url: pathToFileURL(join(assets, "art", `${page}.html`)).href,
  size: [w, h],
  scale,
}))
art.push({
  name: "logo",
  out: join(assets, "logo.png"),
  url: pathToFileURL(join(assets, "logo.svg")).href,
  size: [512, 512],
  scale: 1,
})

const jobs = [...screens, ...art].filter((j) => !filter || j.name.includes(filter))
if (screens.some((j) => jobs.includes(j))) {
  try {
    await fetch(playground)
  } catch {
    console.error(`Playground not reachable at ${playground}. Run \`pnpm dev\` first.`)
    process.exit(1)
  }
}

for (const job of jobs) {
  mkdirSync(dirname(job.out), { recursive: true })
  // A fresh profile per shot, so no stored theme or cache leaks between captures.
  const profile = mkdtempSync(join(tmpdir(), "hb-shot-"))
  const png = job.out.endsWith(".png") ? job.out : join(profile, "shot.png")
  try {
    execFileSync(
      chrome,
      [
        "--headless=new",
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--hide-scrollbars",
        "--default-background-color=00000000",
        "--allow-file-access-from-files",
        `--force-device-scale-factor=${job.scale ?? 2}`,
        `--window-size=${job.size.join(",")}`,
        // Lets fonts load and chart enter animations finish before capture.
        "--virtual-time-budget=6000",
        `--screenshot=${png}`,
        job.url,
      ],
      { stdio: "ignore" },
    )
    if (!existsSync(png)) throw new Error(`Chrome wrote no image for ${job.name} (${job.url})`)
    if (png !== job.out) execFileSync("cwebp", ["-quiet", "-q", "88", "-m", "6", png, "-o", job.out])
    console.log(`✓ ${job.name} (${Math.round(statSync(job.out).size / 1024)} KB)`)
  } finally {
    rmSync(profile, { recursive: true, force: true })
  }
}
