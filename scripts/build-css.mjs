#!/usr/bin/env node
/**
 * Regenerates src/themes/markify.css from source.
 *
 * This is the ONLY way markify.css should ever be changed. Never hand-edit
 * that file directly -- it will be silently overwritten next time this
 * script runs, and hand-edits are exactly how this file has drifted /
 * regressed in the past (font-size fixes getting lost, etc).
 *
 * What it does:
 *   1. Runs the real Tailwind v4 CLI against tailwind.entry.css, which
 *      @source-scans src/**\/*.{ts,tsx} for every utility class actually
 *      used by Markify's components, and compiles them into real CSS
 *      using the @theme token mapping (shadcn colors + font-size scale).
 *   2. Strips Tailwind's global preflight/reset (we don't want to nuke
 *      the consuming app's own base styles).
 *   3. Scopes every compiled rule under `.markify-root` so nothing leaks
 *      into or collides with the consumer's own styles.
 *   4. Concatenates: shadcn.css tokens + .markify-root base rule
 *      (font-family, line-height) + the scoped utility layer.
 *   5. Validates the result is parseable CSS (via lightningcss) before
 *      writing, so a malformed build never silently ships.
 *
 * Run via: npm run build:css (also runs automatically as part of
 * `npm run build`, before tsup).
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as lightningcss from "lightningcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const ENTRY = path.join(root, "tailwind.entry.css");
const SHADCN = path.join(root, "src/themes/shadcn.css");
const OUTPUT = path.join(root, "src/themes/markify.css");
const TMP_COMPILED = path.join(root, ".tmp-tw-compiled.css");

function scopeUtilities(css) {
  const startMarker = "@layer utilities {";
  const start = css.indexOf(startMarker);
  if (start === -1) {
    throw new Error(
      "Could not find '@layer utilities {' in Tailwind output -- " +
        "Tailwind's output format may have changed. Inspect .tmp-tw-compiled.css."
    );
  }

  // Find the matching closing brace for this @layer block by brace counting.
  let depth = 0;
  let i = start + startMarker.length - 1; // position of the opening '{'
  let end = -1;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) {
    throw new Error("Unbalanced braces while extracting @layer utilities block.");
  }

  const inner = css.slice(start + startMarker.length, end);

  const scopedLines = inner.split("\n").map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith(".") && line.includes("{")) {
      const indent = line.slice(0, line.length - line.trimStart().length);
      return `${indent}.markify-root ${trimmed}`;
    }
    return line;
  });

  return `@layer utilities {\n${scopedLines.join("\n")}\n}\n`;
}

function main() {
  console.log("[build-css] Compiling Tailwind utilities from source...");
  execSync(
    `npx tailwindcss -i "${ENTRY}" -o "${TMP_COMPILED}"`,
    { cwd: root, stdio: "inherit" }
  );

  const compiled = readFileSync(TMP_COMPILED, "utf8");
  const scopedUtilities = scopeUtilities(compiled);

  const shadcnTokens = readFileSync(SHADCN, "utf8");

  const banner = `
/* ─────────────────────────────────────────────────────────────────────
 * Standalone utility layer
 *
 * Markify's built-in components (headings, code blocks, tables,
 * callouts, links) use Tailwind utility class names internally. If your
 * app already runs Tailwind, those classes compile normally and this
 * section is redundant (harmless, just unused).
 *
 * If your app does NOT run Tailwind, this pre-compiled utility layer
 * makes Markify render correctly out of the box. Every rule below is
 * scoped under \`.markify-root\` (applied automatically to Markify's
 * wrapper element) so nothing here leaks into or collides with the
 * rest of your app's styles.
 *
 * GENERATED FILE -- do not hand-edit. Run \`npm run build:css\` to
 * regenerate from src/themes/shadcn.css + Tailwind's compile of
 * src/**\\/*.{ts,tsx}. See scripts/build-css.mjs.
 * ───────────────────────────────────────────────────────────────────── */

`;

  const baseRule = `.markify-root {\n  font-family: var(--font-sans);\n  line-height: 1.6;\n}\n\n`;

  const finalCss = shadcnTokens + "\n" + baseRule + banner + scopedUtilities;

  // Validate before writing -- never ship a malformed build.
  try {
    lightningcss.transform({
      filename: "markify.css",
      code: Buffer.from(finalCss),
      minify: true,
    });
  } catch (err) {
    throw new Error(
      `Generated markify.css failed CSS validation: ${err.message}\n` +
        `Inspect ${TMP_COMPILED} for the raw Tailwind output.`
    );
  }

  writeFileSync(OUTPUT, finalCss);
  console.log(`[build-css] Wrote ${OUTPUT} (${finalCss.length} bytes), validated OK.`);
}

main();
