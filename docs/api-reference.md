# API Reference

## `<Markify>`

Imported from your own config: `import { Markify } from "@/components/markify/config"`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | Markdown source to render |
| `isStreaming` | `boolean` | `false` | Streaming repair + progressive block rendering |
| `className` | `string` | — | Merged onto the root `.markify-root` wrapper |
| `spacing` | `"compact" \| "normal" \| "relaxed" \| { block?, headingTop?, listItem? }` | from config | Vertical rhythm |
| `theme` | `Partial<MarkifyTheme>` | from config | shadcn token overrides |
| `cssVars` | `Record<string, string>` | from config | Raw custom-property overrides |
| `fontFamily` | `string` | from config | Font family for the whole renderer |
| `components` | `Partial<Components>` | — | react-markdown component overrides (merged over the built-in map) |

## `markifyConfig`

Global defaults in `components/markify/config.tsx`:

| Key | Type | Description |
|---|---|---|
| `theme` | `Partial<MarkifyTheme>` | Token overrides (shadcn token names) |
| `cssVars` | `Record<string, string>` | Raw CSS custom properties |
| `spacing` | preset or object | Vertical rhythm |
| `fontFamily` | `string?` | Renderer font |
| `codeBlock` | `{ worker?, hljsTheme?, hljsCustomCss?, hljsThemeUrl?, hljsThemeBg?, codeFontFamily?, hljsLanguages? }` | Code block behavior |
| `table` | `{ showCopyButton?, downloadFormats?, scrollable? }` | Table actions |
| `mermaid` | `MarkifyMermaidConfig` | `showHeader`, `showBackground`, `fit` + any mermaid config option |
| `chess` | `{ enabled?, maxWidth?, showNotation? }` | PGN/FEN blocks |
| `embeds` | `{ youtube?, twitter? }` | Image-URL embeds |

## `MarkifyTheme`

`background`, `foreground`, `card`, `cardForeground`, `popover`, `popoverForeground`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `muted`, `mutedForeground`, `accent`, `accentForeground`, `destructive`, `destructiveForeground`, `border`, `input`, `ring`, `fontSans`, `fontMono` — all optional CSS values.

## Exported helpers (`config.tsx`)

| Export | Signature | Description |
|---|---|---|
| `Markify` | component | The renderer |
| `markifyConfig` | object | Global settings seam |
| `toMarkifyVars` | `(theme?) => Record<string, string>` | Theme object → `--markify-*` CSS vars |
| `parseBlocks` | `(content) => string[]` | Fence-aware top-level block splitting |
| `normalizeDisplayMath` | `(content) => string` | Single-line `$$…$$` → centered block math |
| `useStreamingReveal` | `(content, isStreaming) => string` | Streaming repair hook |

## Component exports (`comps/`)

| File | Exports |
|---|---|
| `code-block.tsx` | `CodeBlock`, `extractLanguage`, `getCodeText`, `preloadLanguages`, `ensureLanguage`, `DEFAULT_LANGUAGES`, `ALL_LANGUAGES`, `injectHljsTheme` |
| `typography.tsx` | `H1`–`H6`, `Paragraph`, `Link`, `InlineCode`, `OrderedList`, `UnorderedList`, `ListItem`, `Hr` |
| `callout.tsx` | `Callout`, `parseCallout`, `stripCalloutMarker`, `getText`, `CalloutType` |
| `blockquote.tsx` | `Blockquote` (renders `Callout` when the marker is present) |
| `table.tsx` | `Table`, `THead`, `TBody`, `TR`, `TH`, `TD`, `TableOptionsContext`, `defaultTableOptions` |
| `embeds.tsx` | `Image`, `parseYouTubeId`, `parseTweetId`, `YouTubeVideo` |
| `mermaid.tsx` | `MermaidBlock`, `MarkifyMermaidConfig` |
| `chess.tsx` | `ChessGame`, `FenBoard` |
| `fallbacks.tsx` | `Spinner`, `ChessFallback`, `MermaidFallback` |
| `_lib.ts` | `cn`, `hash`, `copyToClipboard`, `downloadBlob`, `downloadText`, `getText` |
