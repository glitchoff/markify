import { defineConfig } from "tsup";

export default defineConfig({
  entry: { cli: "cli/index.ts" },
  format: ["esm"],
  platform: "node",
  target: "node18",
  clean: true,
  minify: false,
  sourcemap: true,
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module';\nconst require = __createRequire(import.meta.url);",
  },
});
