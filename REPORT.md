# Report: Markify styling breaks outside Tailwind-configured apps

## Summary
`@glitchoff/markify` renders correctly in Siora and in `apps/demo`, but headers,
code blocks, and other elements lose all styling in a fresh app (tested: Vite +
React + TS, no Tailwind installed). Root cause confirmed by reproduction.

## Root cause
Markify's components (`markdown-components.tsx`, `CodeBlock.tsx`, etc.) apply
styling via **raw Tailwind utility class names** (`text-foreground`,
`[&_table]:w-full`, `bg-muted`, etc.), combined with `cn()`.

These class name strings only produce visible CSS if a **Tailwind build
pipeline** processes them and generates matching CSS rules. Markify ships no
such pipeline, and the bundled `dist/themes/shadcn.css` only defines **CSS
custom properties** (`--foreground: oklch(...)`, `--muted: oklch(...)`, etc.) —
it does not define the utility classes themselves.

- In **Siora**, Tailwind + the shadcn Maia preset already runs across the app
  and compiles `text-foreground` → `{ color: var(--foreground) }` etc.
- In **`apps/demo`**, same story — the demo app also has Tailwind configured.
- In a **fresh app with no Tailwind** (Next.js, Vite, or otherwise), the class
  names are inert strings on the DOM. Importing
  `@glitchoff/markify/themes/shadcn.css` (as documented in the README) only
  gets you the CSS variables — with nothing consuming them, so headers, code
  blocks, tables, and callouts render with no color, spacing, or borders.

This is not a packaging bug (all theme CSS files are correctly built and
shipped — verified via `npm pack` + fresh install). It's an architectural
assumption: **the README documents Tailwind-variable theming, but the package
silently assumes a Tailwind pipeline is present downstream, which is only true
inside this monorepo's own apps.**

## Reproduction
1. `npm pack` the built package from a clean `tsup` build (verified all 3
   theme CSS files ship correctly in `dist/themes/`).
2. Fresh `npm create vite@latest` React+TS app, no Tailwind installed.
3. `npm install <tarball> react-markdown remark-gfm`
4. Render `<Markify>` with headers + a code block, import
   `@glitchoff/markify/themes/shadcn.css` per README instructions.
5. `vite build` succeeds with no errors — but resulting CSS only contains
   `:root` variable definitions, zero utility class rules. Headers and code
   blocks render unstyled.

## Secondary finding (unrelated, worth cleaning up separately)
The repo contains **two parallel implementations**:
- Root `src/` (TypeScript, tsup-built) — this is what actually publishes as
  `@glitchoff/markify` and what `apps/demo` + Siora consume.
- `packages/markify/src/` (JSX, Bun-built, unscoped `"markify"` name,
  `react-markdown ^9`, separate plugin system) — appears unused by anything
  in the workspace, not referenced by the demo or the published package.
  Likely dead code from an earlier architecture, worth deleting to avoid
  future confusion (this looked like the "real" package at first glance
  during investigation).

## Fix options

**Option A — Ship compiled, Tailwind-independent CSS (recommended)**
Hand-write or generate plain CSS rules for every class Markify's components
actually use (headers, code block chrome, table styling, callouts, mermaid
controls) into `dist/themes/*.css`, scoped so they don't leak into the rest
of the consumer's app. This makes Markify work correctly with zero
dependency on the consumer having Tailwind at all — matching the "zero-config
styling" promise already claimed in the README.
- Trade-off: larger CSS payload, needs to be kept in sync with component
  changes (candidate for a small build step that extracts classes used and
  validates coverage).

**Option B — Auto-detect / warn**
Ship a runtime dev-mode check: if computed styles for `--foreground` etc.
resolve to nothing after mount, `console.warn` with a link to the "Zero-config
styling" README section. Cheaper to build, but doesn't actually fix the
broken rendering — just improves discoverability of the existing docs.

**Option C — Both**
Ship Option A as the real fix; keep a lightweight version of Option B as a
safety net for any future case where a class change isn't reflected in the
shipped CSS.

## Recommendation
Go with **Option C**. Option A directly fixes the reported bug and honors
what the README already promises. Option B is cheap insurance against
regressions when new components/classes are added later without updating the
shipped CSS.

## Suggested next steps (as a PR)
1. Extract full list of Tailwind classes used across `src/*.tsx` components.
2. Write `dist`-targeted plain CSS (scoped under a root class, e.g.
   `.markify-root`) covering: headings, paragraphs, lists, code block header/
   body/copy-button/collapse-chevron, table (+ copy/download controls),
   callouts (NOTE/WARNING/TIP), mermaid container chrome.
3. Add a build step (`scripts/generate-fallback-css.ts` or similar) that
   pulls class usage from source and fails CI if new classes lack coverage.
4. Add a dev-only mount-time warning per Option B as a backstop.
5. Update README's "Zero-config styling" section to clarify this now works
   with or without Tailwind in the consumer app.
6. Separately: delete `packages/markify/` (dead, unused implementation) in
   its own PR to avoid conflating two unrelated changes.

## Verification performed
- Cloned repo, built `packages/markify` (root package) via `tsup`, confirmed
  all theme CSS ships in `dist/themes/`.
- Packed as a tarball (`npm pack`) and installed into a clean Vite+React+TS
  app with no Tailwind, following README instructions exactly.
- Confirmed build succeeds, confirmed final CSS bundle contains only CSS
  variable definitions and no utility class rules — reproducing the reported
  "headers/code blocks suck" behavior outside Siora/demo.
