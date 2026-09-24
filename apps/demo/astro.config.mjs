import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages project site: https://glitchoff.github.io/markify/
export default defineConfig({
  site: "https://glitchoff.github.io",
  base: "/markify",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    worker: {
      format: "es",
    },
  },
});
