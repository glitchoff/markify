# Customization

Markify ships with sensible defaults but exposes several knobs for deep customization — from swapping code-block styling to overriding any rendered component.

## 1. Custom Components (`components`)

Use the `components` prop (react-markdown's `Components` map) to override any markdown element:

```tsx
import { Markify } from "@glitchoff/markify";

<Markify
  components={{
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold my-6 pb-2 border-b border-border">{children}</h1>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
        {children}
      </a>
    ),
  }}
>
  {markdown}
</Markify>
```

## 2. Typography & Fonts

Control the base and code font families without touching CSS:

```tsx
<Markify
  fontFamily="Inter, system-ui, sans-serif"
  codeFontFamily="JetBrains Mono, monospace"
>
  {markdown}
</Markify>
```

## 3. Code Block Styling

Style code blocks by targeting their wrapper or injecting your own syntax-highlighting CSS:

```tsx
<Markify
  codeBlockClassName="rounded-lg overflow-hidden my-4"
  hljsCustomCss={`
    .hljs { background: #1e1e2e; color: #cdd6f4; }
    .hljs-keyword { color: #cba6f7; }
  `}
>
  {markdown}
</Markify>
```

### External Highlighting Themes

Load any CSS file (e.g. a `highlight.js` theme) at runtime:

```tsx
<Markify hljsThemeUrl={isDark ? "/hljs/atom-one-dark.css" : "/hljs/atom-one-light.css"}>
  {markdown}
</Markify>
```

The exported helpers `ATOM_DARK_CSS`, `ATOM_LIGHT_CSS`, and `getThemeCss()` give you the built-in Atom themes as raw strings if you want to inline them yourself.

## 4. Table Options (`table`)

Tune the interactive table features:

| Option | Type | Default | Description |
|---|---|---|---|
| `showCopyButton` | `boolean` | `true` | Show the "copy as Markdown" button on hover. |
| `downloadFormats` | `("csv"\|"tsv"\|"md")[]` | `[]` | Which export buttons to show. |
| `scrollable` | `boolean` | `true` | Wrap wide tables in a horizontal scroll container. |

```tsx
<Markify table={{ showCopyButton: true, downloadFormats: ["csv", "md"], scrollable: true }}>
  {markdownTable}
</Markify>
```

## 5. Mermaid Configuration (`mermaidConfig`)

Pass a full [Mermaid config](https://mermaid.js.org/config/) to the `mermaidConfig` prop:

```tsx
<Markify
  mermaidConfig={{
    theme: "dark",
    fontFamily: "Inter, sans-serif",
    flowchart: { curve: "basis", nodeSpacing: 50, rankSpacing: 50 },
    themeVariables: { primaryColor: "#334155" },
  }}
>
  {markdown}
</Markify>
```

## 6. Background Class Sync (`hljsThemeBg`)

When `true`, Markify applies the selected `hljsTheme` background to the `.hljs` container so code blocks always blend with the surrounding card:

```tsx
<Markify hljsTheme={isDark ? "dark" : "light"} hljsThemeBg>
  {markdown}
</Markify>
```

## 7. Custom Block Renderers (`renderers`)

Use the `renderers` prop to swap out any built-in block renderer — mermaid, chess (PGN), FEN, or the default code block — while keeping Markify's streaming, block-splitting, and parsing intact. Each renderer is optional; pass only the ones you want to override.

```tsx
import { Markify, type Renderers } from "@glitchoff/markify";

const renderers: Renderers = {
  // Replace the PGN viewer with your own
  chess: ({ code, isStreaming }) => <MyChessViewer pgn={code} loading={isStreaming} />,
  // Replace the FEN viewer
  fen: ({ code, isStreaming }) => <MyFenBoard fen={code} />,
  // Replace the mermaid diagram renderer
  mermaid: ({ code }) => <MyMermaid diagram={code} />,
  // Replace the default code block for all other languages
  code: ({ children, language }) => <MyCodeBlock lang={language}>{children}</MyCodeBlock>,
};

<Markify chessEnabled renderers={renderers}>
  {markdown}
</Markify>
```

### Renderer signatures

| Renderer   | Args                                          | When it's called                          |
| ---------- | --------------------------------------------- | ---------------------------------------- |
| `mermaid`  | `{ code, isStreaming }`                       | A ` ```mermaid ` fence.                  |
| `chess`    | `{ code, isStreaming }`                        | A ` ```pgn ` or ` ```chess ` fence (requires `chessEnabled`). |
| `fen`      | `{ code, isStreaming }`                        | A ` ```fen ` fence (requires `chessEnabled`).               |
| `code`     | `{ children, className, language }`           | Any other fenced code block.             |

`code` is the raw text inside the fence. `isStreaming` is `true` while the block is still being revealed (so you can show a loading state). The `code` renderer receives the original `children` (the `<code>` element) plus the parsed `language`.

> **Note:** `renderers` is granular — overriding `chess` doesn't affect `fen`, `mermaid`, or regular code blocks. To override an entire markdown element (e.g. all `<pre>`), use the `components` prop instead.