# Markify

**Streaming-first Markdown renderer for React — in the spirit of shadcn/ui.**

Markify doesn't install itself as a black box. One command copies the renderer — the config, the tokens, and every component it renders — straight into your project. From that moment it's **your code**: restyle it, rewire it, delete the parts you don't want. No fighting a library's API to make markdown look the way you want.

```bash
npx @glitchoff/markify init
```

```tsx
import { Markify } from "@/components/markify/config";

<Markify isStreaming={generating}>{reply}</Markify>
```

## Why Markify

- **Streaming-first** — partial AI output is repaired (`remend`), split into memoized blocks, and rendered without flicker while tokens arrive
- **shadcn-compatible by default** — components consume standard shadcn tokens (`--background`, `--muted`, `--border`, `--primary`, `--radius`, …). Your theme, your radius, your dark mode — inherited automatically, zero configuration
- **Copy-in, zero lock-in** — everything lives in your repo; `markify add <comp>` restores any file to its registry default after you've customized it
- **Batteries included** —
  - Code blocks with lazy-loaded highlight.js grammars, copy / wrap / collapse, optional web-worker highlighting
  - KaTeX math (inline + centered display)
  - GitHub-style callouts in 17 tones
  - Interactive tables with copy-as-Markdown and CSV / TSV / MD export
  - Mermaid diagrams with zoom, pan, fullscreen, SVG/PNG export
  - Interactive chess — PGN viewer and playable FEN board
  - YouTube and Twitter/X embeds via `![](youtube:…)` / `![](twitter:…)`

## Requirements

- React 18 or 19
- Tailwind CSS v4
- Any modern bundler (Vite, Next.js, Astro, …)

## Quick start

```bash
npx @glitchoff/markify init
```

The CLI detects your shadcn `components.json` (or falls back to `components/markify`), copies the full scaffold, installs dependencies with your package manager, and prints the import to use:

```tsx
import { Markify } from "@/components/markify/config";

export function Chat({ reply, generating }) {
  return <Markify isStreaming={generating}>{reply}</Markify>;
}
```

Configure everything in one file — `components/markify/config.tsx`:

```ts
export const markifyConfig = {
  theme: {},            // shadcn token overrides
  cssVars: {},          // raw custom properties, e.g. { "--markify-gap": "1.5rem" }
  spacing: "normal",    // "compact" | "normal" | "relaxed" | granular object
  codeBlock: { worker: false, hljsTheme: "dark", hljsLanguages: "default" },
  table: { showCopyButton: true, downloadFormats: ["csv"], scrollable: true },
  mermaid: { showHeader: true, showBackground: true, fit: false },
  chess: { enabled: true, maxWidth: 420, showNotation: true },
  embeds: { youtube: true, twitter: true },
};
```

## CLI

| Command | Effect |
|---|---|
| `markify init` | Copy the full scaffold + install dependencies (shadcn-aware) |
| `markify add <comp>` | Restore one component to its registry default |
| `markify add` (no args) | List available components |

## Documentation

All docs live in [`docs/`](docs/) and are rendered by Markify itself in the demo app:

1. [Getting Started](docs/getting-started.md) — init, scaffold layout, first render
2. [Theming & Dark Mode](docs/theming.md) — shadcn inheritance, overrides, accents
3. [Styling & Spacing](docs/styling.md) — container props, spacing presets
4. [Features](docs/features.md) — code, math, callouts, tables, Mermaid, chess, embeds
5. [Streaming Guide](docs/streaming.md) — how token-by-token rendering works
6. [Customization](docs/customization.md) — the three levels of ownership
7. [API Reference](docs/api-reference.md) — every prop and config key

## Development

```bash
pnpm install
pnpm build        # build the CLI + typecheck the registry
pnpm demo         # run the Astro demo app
```

The `registry/` directory is the single source of truth — the CLI copies its files verbatim into user projects.

## License

MIT — see [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
