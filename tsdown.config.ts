import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "browser",
  // One output file per source module: keeps "use client" per component and tree-shaking exact.
  unbundle: true,
  dts: true,
  sourcemap: false,
  inputOptions: {
    // Directives are preserved because output is unbundled; the warning is noise here.
    onLog(level, log, handler) {
      if (log.code === "MODULE_LEVEL_DIRECTIVE") return
      handler(level, log)
    },
  },
  clean: true,
  copy: [
    { from: "src/styles.css", to: "dist" },
    { from: "src/shadcn-base.css", to: "dist" },
  ],
})
