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
| `children` | `string` | — (required) | The Markdown source to render. |
| `isStreaming` | `boolean` | `false` | Enable progressive reveal animation while content streams in. |
| `className` | `string` | `""` | Extra class names for the root `.markify-root` wrapper. |
| `codeBlockWorker` | `boolean` | `false` | Offload syntax highlighting to a Web Worker. |
| `table` | `TableOptions` | — | See [Customization → Tables](/docs/customization). |
| `hljsTheme` | `"dark" \| "light"` | `"dark"` | Built-in syntax highlighting theme. |
| `hljsCustomCss` | `string` | — | Raw CSS string overriding `.hljs` colors. |
| `hljsThemeUrl` | `string` | — | URL of an external highlight.js stylesheet to inject. |
| `hljsThemeBg` | `boolean` | `false` | Apply the theme background to the `.hljs` container. |
| `codeBlockClassName` | `string` | — | Extra classes for each code block wrapper. |
| `fontFamily` | `string` | — | Root font family for rendered content. |
| `codeFontFamily` | `string` | — | Font family for code blocks. |
| `mermaidConfig` | `MermaidConfig` | — | Mermaid rendering configuration. |
| `components` | `Partial<Components>` | — | Override any markdown element (react-markdown). |

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
| `parseCallout(blockquote)` | util | Parses `[!NOTE]`-style callout blocks. |
| `getText(node)` | util | Extracts plain text from a markdown AST node. |
| `cn(...classes)` | util | Tailwind-friendly class combiner. |
| `injectHljsTheme(theme, customCss?)` | util | Injects built-in or custom `.hljs` CSS. |
| `MermaidBlock` | component | Standalone Mermaid renderer (see below). |
| `useTableOptions()` | hook | Read current table options from context. |
| `TableOptionsContext` | context | Context providing table options. |
| `ATOM_DARK_CSS` / `ATOM_LIGHT_CSS` | string | Built-in highlight themes as raw CSS. |
| `getThemeCss(theme)` | fn | Returns theme CSS for `"dark"` / `"light"`. |

## Types

- `MarkifyProps` — props of `<Markify>`.
- `Components` — react-markdown component map (re-exported).
- `HljsTheme` — `"dark" | "light"`.
- `MermaidBlockProps` — props of `MermaidBlock`.

## `<MermaidBlock>` Props

| Prop | Type | Description |
|---|---|---|
| `code` | `string` | Mermaid source code. |
| `config` | `MermaidConfig` | Mermaid configuration. |
| `className` | `string` | Wrapper class names. |

## Peer Dependencies

- `react`: `^18.0.0 || ^19.0.0`
- `react-dom`: `^18.0.0 || ^19.0.0`