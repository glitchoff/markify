# Getting Started

Markify is a streaming-first Markdown renderer for React, built in the shadcn/ui spirit: you don't install a styled library — you **copy the components into your project** and they're yours.

## Requirements

- **React 18 or 19**
- **Tailwind CSS v4** — components are styled with Tailwind utilities + shadcn design tokens
- A bundler that handles TSX and web workers (Vite, Next.js, Astro, etc.)

## 1. Run init

```bash
npx @glitchoff/markify init
```

The CLI:

1. Detects your `components.json` (shadcn) and resolves the components path — otherwise it defaults to `components/markify`
2. Copies the **entire scaffold** in one shot
3. Installs the required dependencies with your detected package manager (npm / pnpm / yarn / bun) — skipping anything already installed
4. Prints the exact import to use

### What you get

```
components/markify/
├── config.tsx        # settings + theming + component map + <Markify> export
├── tokens.css        # shadcn token aliases + fallbacks (imported by config.tsx)
└── comps/
    ├── code-block.tsx        # syntax highlighting, copy/wrap/collapse
    ├── code-block.worker.ts  # optional off-thread highlighting
    ├── typography.tsx        # headings, paragraphs, links, inline code, lists, rules
    ├── callout.tsx           # GitHub-style callouts
    ├── blockquote.tsx        # plain blockquotes
    ├── table.tsx             # tables with copy/export
    ├── embeds.tsx            # images + YouTube/Twitter embeds
    ├── mermaid.tsx           # diagrams
    ├── chess.tsx             # PGN viewer + FEN board
    ├── fallbacks.tsx         # spinners and lazy-loading cards
    ├── _lib.ts               # tiny shared helpers (cn, copy, download…)
    └── _katex-unicode.ts     # remark plugin for math unicode fixes
```

### Environment checks

`init` warns (non-blocking) if React or Tailwind CSS can't be found in your project — it still copies the scaffold either way.

## 2. Use it

Import `Markify` from your own config — never from the npm package:

```tsx
import { Markify } from "@/components/markify/config";

export function Chat({ reply, generating }) {
  return <Markify isStreaming={generating}>{reply}</Markify>;
}
```

## 3. Configure it

Everything is configured in one file — `components/markify/config.tsx`:

```ts
export const markifyConfig = {
  theme: {},            // shadcn token overrides
  cssVars: {},          // raw custom properties, e.g. { "--markify-gap": "1.5rem" }
  spacing: "normal",    // "compact" | "normal" | "relaxed" | granular object
  fontFamily: undefined,

  codeBlock: { worker: false, hljsTheme: "dark", hljsLanguages: "default" },
  table: { showCopyButton: true, downloadFormats: ["csv"], scrollable: true },
  mermaid: { showHeader: true, showBackground: true, fit: false },
  chess: { enabled: true, maxWidth: 420, showNotation: true },
  embeds: { youtube: true, twitter: true },
};
```

Every setting is a **default** — `spacing`, `theme`, `cssVars`, `fontFamily` and the component map can still be overridden per-instance as `<Markify>` props.

## Framework notes

- **Next.js / Vite / Astro**: works out of the box. In Astro, mount `<Markify>` inside a `client:*` island.
- **Workers**: `codeBlock.worker` uses `new Worker(new URL(...), import.meta.url)` — supported by Vite, Next.js (webpack 5), and most bundlers.
- **KaTeX**: `config.tsx` imports `katex/dist/katex.min.css` — remove that import if you load KaTeX styles globally already.

## Next steps

- [Theming & dark mode](/docs/theming)
- [Styling & spacing](/docs/styling)
- [Features](/docs/features)
- [Customization](/docs/customization)
