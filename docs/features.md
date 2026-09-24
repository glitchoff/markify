# Features

## Code blocks

Fenced code blocks render with lazy-loaded highlight.js grammars (Atom theme), a colored language badge, copy button, line wrapping toggle, and auto-collapse for long snippets (with an "N more lines" expander).

```ts
const greet = (name: string) => `Hello, ${name}`;
```

Configured via `codeBlock` in config:

| Option | Default | Description |
|---|---|---|
| `worker` | `false` | Highlight in a web worker (off the main thread) |
| `hljsTheme` | `"dark"` | Built-in Atom theme: `"dark"` or `"light"` |
| `hljsCustomCss` | — | Inject custom hljs CSS instead of the Atom theme |
| `hljsThemeUrl` | — | Load an hljs theme stylesheet from a URL |
| `hljsThemeBg` | `false` | Tint the code background with the theme's own background |
| `codeFontFamily` | — | Font family for code |
| `hljsLanguages` | `"default"` | `"default"` (20 common languages), `"all"`, or a custom array |

Grammars load lazily on first use — rendering stays fast no matter how many languages exist.

## Math (KaTeX)

Inline `$E = mc^2$` and block `$$…$$` math render via KaTeX. Single-line `$$a + b$$` is normalized into centered display math, so AI-written math centers properly. Unicode quirks inside math (non-breaking spaces, unicode hyphens) are fixed by a small remark plugin. Requires `katex/dist/katex.min.css` (imported by `config.tsx`).

## Callouts

GitHub-style blockquote callouts in 17 tones:

> [!NOTE]
> A friendly note to keep things calm.

> [!TIP]
> A small hint that saves the day.

> [!SUCCESS]
> Everything worked.

> [!WARNING]
> Be careful here.

> [!CAUTION]
> This action cannot be undone.

> [!DANGER]
> This is dangerous.

> [!QUESTION]
> Why does this work?

> [!BUG]
> A known issue, tracked and visible.

Types: `NOTE`, `TIP`, `HINT`, `IMPORTANT`, `WARNING`, `CAUTION`, `ATTENTION`, `INFO`, `SUCCESS`, `QUESTION`, `ABSTRACT`, `TODO`, `FAILURE`, `DANGER`, `BUG`, `EXAMPLE`, `QUOTE`. Colors come from `--markify-callout-*` (see [theming](theming.md)).

Plain blockquotes (without the `> [!TYPE]` marker) render as a simple styled quote.

## Tables

Tables render in a card with hover actions: copy as Markdown and download as CSV / TSV / MD.

| Option | Default | Description |
|---|---|---|
| `showCopyButton` | `true` | Copy the table as Markdown |
| `downloadFormats` | `[]` | e.g. `["csv", "tsv", "md"]` |
| `scrollable` | `true` | Horizontal scroll for wide tables |

## Mermaid diagrams

```` ```mermaid ```` blocks render lazily (only when scrolled into view) with zoom, pan, pinch, fullscreen, double-click reset, and SVG / PNG / MMD export.

| Option | Default | Description |
|---|---|---|
| `showHeader` | `true` | Toolbar with copy/download/fullscreen |
| `showBackground` | `true` | Card border and background |
| `fit` | `false` | Auto-fit diagram to container width |
| `theme` | auto | Any mermaid `MermaidConfig` option passes through |

## Chess

Enabled with `chess.enabled: true` in config:

- ` ```pgn ` / ` ```chess ` → interactive PGN viewer: score-sheet move grid (desktop), chess.com-style move strip (mobile), navigation, flip (F key), slider, result/status line, PGN copy & download
- ` ```fen ` → interactive FEN board: drag or click-to-move, flip, reset with move counter, code/board toggle

Invalid games and positions render friendly error cards with the source shown.

## Images & embeds

`![alt](url)` renders a normal image. **Embed prefixes in the URL position** differentiate media — alt text stays for plain images:

```markdown
![](youtube:https://www.youtube.com/watch?v=M5PbLfVGOQs)
![](youtube:M5PbLfVGOQs)
![](twitter:https://x.com/username/status/1234567890)
![](twitter:1234567890)
![alt text](https://example.com/image.png)
```

Toggle with `embeds: { youtube: true, twitter: true }` in config. YouTube embeds are lazy-loaded and cookie-free (`youtube-nocookie.com`); tweets render via the oEmbed API with light/dark follow.
