import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/highlight.worker.ts", "src/chess/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: true,
  external: ["react", "react-dom"],
});
