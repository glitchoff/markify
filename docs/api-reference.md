# API Reference

Complete reference for the `<Markify>` component and the utilities exported from `@glitchoff/markify`.

## `<Markify>` Props

```tsx
import { Markify } from "@glitchoff/markify";

<Markify isStreaming hljsTheme="dark">
  {markdown}
</Markify>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | - (required) | The Markdown source to render. |
| `isStreaming` | `boolean` | `false` | Enable progressive reveal animation while content streams in. |
| `className` | `string` | `""` | Extra class names for the root `.markify-root` wrapper. |
| `codeBlockWorker` | `boolean` | `false` | Offload syntax highlighting to a Web Worker. |
| `table` | `TableOptions` | - | See [Customization → Tables](/docs/customization). |
| `hljsTheme` | `"dark" \| "light"` | `"dark"` | Built-in syntax highlighting theme. |
| `hljsCustomCss` | `string` | - | Raw CSS string overriding `.hljs` colors. |
| `hljsThemeUrl` | `string` | - | URL of an external highlight.js stylesheet to inject. |
| `hljsThemeBg` | `boolean` | `false` | Apply the theme background to the `.hljs` container. |
| `codeBlockClassName` | `string` | - | Extra classes for each code block wrapper. |
| `fontFamily` | `string` | - | Root font family for rendered content. |
| `codeFontFamily` | `string` | - | Font family for code blocks. |
| `mermaidConfig` | `MermaidConfig` | - | Mermaid rendering configuration. |
| `chessEnabled` | `boolean` | `false` | Enable chess (PGN/FEN) block rendering. |
| `renderers` | `Renderers` | - | Override built-in block renderers (mermaid, chess, fen, code). See [Customization → Renderers](/docs/customization). |
| `components` | `Partial<Components>` | - | Override any markdown element (react-markdown). |
| `themeType` | `MarkifyThemePreset` | `"shadcn"` | Which host-app token vocabulary the `--markify-*` aliases resolve to. One of `"shadcn"`, `"daisyui"`, `"radix"`, `"bootstrap"`, `"none"`. |
| `theme` | `Partial<MarkifyTheme>` | - | Per-instance token overrides, applied as inline `--markify-*` vars (highest priority). |
| `cssVars` | `Record<string, string>` | - | Escape hatch for setting raw `--markify-*` custom properties directly. |
| `hljsLanguages` | `string[] \| "all"` | 20 common languages | Which highlight.js languages to preload on mount. Pass `"all"` to preload every supported language, an array of language names, or `[]` to disable preloading (languages load on-demand when encountered). |

## `TableOptions`

| Option | Type | Default |
|---|---|---|
| `showCopyButton` | `boolean` | `true` |
| `downloadFormats` | `("csv" \| "tsv" \| "md")[]` | `[]` |
| `scrollable` | `boolean` | `true` |

## Exported Utilities

| Export | Kind | Description |
|---|---|---|
| `useStreamingReveal(content, isStreaming)` | hook | Returns reveal-rendered content while streaming. |
| `remarkFixKaTeXUnicode` | remark plugin | Normalizes Unicode in KaTeX math. |
| `parseCallout(blockquote)` | util | Parses `[!TYPE]` Obsidian-style callout blocks (NOTE, TIP, WARNING, INFO, etc.). |
| `getText(node)` | util | Extracts plain text from a markdown AST node. |
| `cn(...classes)` | util | Tailwind-friendly class combiner. |
| `injectHljsTheme(theme, customCss?)` | util | Injects built-in or custom `.hljs` CSS. |
| `MermaidBlock` | component | Standalone Mermaid renderer. Import from `@glitchoff/markify/mermaid` (see below). |
| `useTableOptions()` | hook | Read current table options from context. |
| `TableOptionsContext` | context | Context providing table options. |
| `ATOM_DARK_CSS` / `ATOM_LIGHT_CSS` | string | Built-in highlight themes as raw CSS. |
| `getThemeCss(theme)` | fn | Returns theme CSS for `"dark"` / `"light"`. |

### `@glitchoff/markify/chess`

| Export | Kind | Description |
|---|---|---|
| `ChessGame` | component | Standalone PGN viewer (see [Chess](/docs/chess)). |
| `ChessBlock` | component | Fence-style PGN wrapper around `ChessGame`. |
| `FenBoard` | component | Standalone FEN viewer (playable, with reset). |
| `ChessGameProps` / `ChessBlockProps` / `FenBoardProps` | type | Props for the chess components. |

### `@glitchoff/markify/mermaid`

| Export | Kind | Description |
|---|---|---|
| `MermaidBlock` | component | Standalone Mermaid renderer (see below). |
| `MermaidBlockProps` | type | Props of `MermaidBlock`. |
| `MarkifyMermaidConfig` | type | Extended `MermaidConfig` with `showHeader`, `showBackground`, `fit` options. |

## Types

- `MarkifyProps`: props of `<Markify>`.
- `Components`: react-markdown component map (re-exported).
- `HljsTheme`: `"dark" | "light"`.
- `MarkifyThemePreset`: `"shadcn" | "daisyui" | "radix" | "bootstrap" | "none"` — host-app token vocabulary for the `--markify-*` aliases.
- `MarkifyTheme`: per-instance token overrides (`background`, `card`, `muted`, `border`, `primary`, `radius`, `fontSans`, …).
- `MermaidBlockProps`: props of `MermaidBlock`.
- `MarkifyMermaidConfig`: extended Mermaid config with UI options (`showHeader`, `showBackground`, `fit`).
- `Renderers`: `{ mermaid?, chess?, fen?, code? }` custom block renderers.
- `BlockRendererArgs`: `{ code, isStreaming }` passed to `mermaid`/`chess`/`fen` renderers.
- `CodeRendererProps`: `{ children, className, language }` passed to the `code` renderer.

## `<MermaidBlock>` Props

| Prop | Type | Description |
|---|---|---|
| `code` | `string` | Mermaid source code. |
| `config` | `MermaidConfig` | Mermaid configuration. |
| `className` | `string` | Wrapper class names. |

## Peer Dependencies

- `react`: `^18.0.0 || ^19.0.0`
- `react-dom`: `^18.0.0 || ^19.0.0`