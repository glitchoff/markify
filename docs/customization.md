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

Pass a full [Mermaid config](https://mermaid.js.org/config/) to the `mermaidConfig` prop. Markify extends the standard `MermaidConfig` with extra UI options:

| Option | Type | Default | Description |
|---|---|---|---|
| `theme` | `string` | Synced with `hljsTheme` | Mermaid theme (`"dark"`, `"default"`, `"forest"`, etc). |
| `showHeader` | `boolean` | `true` | Show the toolbar with copy/download/fullscreen buttons. |
| `showBackground` | `boolean` | `true` | Show the card border and background around diagrams. |
| `fit` | `boolean` | `false` | Auto-fit the diagram to the container width. |

```tsx
<Markify
  mermaidConfig={{
    theme: "dark",
    fontFamily: "Inter, sans-serif",
    flowchart: { curve: "basis", nodeSpacing: 50, rankSpacing: 50 },
    themeVariables: { primaryColor: "#334155" },
    fit: true,
  }}
>
  {markdown}
</Markify>
```

### Remove header and background

For a minimal inline look:

```tsx
<Markify
  mermaidConfig={{
    showHeader: false,
    showBackground: false,
  }}
>
  {markdown}
</Markify>
```

### Auto-fit diagrams

When `fit` is enabled, diagrams are scaled to fit their container. Users can still zoom and pan — the fit button in the header re-centers:

```tsx
<Markify mermaidConfig={{ fit: true }}>
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

## 7. Syntax Highlighting Language Loading (`hljsLanguages`)

Markify uses `highlight.js/lib/core` and loads language definitions **on demand** — only the languages actually used in your markdown are fetched, keeping the bundle small.

By default, **20 common languages** are preloaded on mount so they're available instantly:

> `xml`, `css`, `javascript`, `typescript`, `python`, `bash`, `json`, `sql`, `rust`, `go`, `csharp`, `cpp`, `java`, `php`, `ruby`, `yaml`, `markdown`, `diff`, `dart`, `kotlin`

Any other supported language is lazy-loaded the first time a code block with that language is encountered.

### Preload specific languages

```tsx
<Markify hljsLanguages={["python", "rust", "swift", "lua"]}>
  {markdown}
</Markify>
```

### Preload all supported languages

```tsx
<Markify hljsLanguages="all">
  {markdown}
</Markify>
```

### Disable preloading (pure on-demand)

```tsx
<Markify hljsLanguages={[]}>
  {markdown}
</Markify>
```

> [!NOTE]
> Languages are loaded via dynamic `import()`, so each language definition becomes a separate chunk in your bundle. Preloading fetches them on mount (non-blocking), while on-demand loading fetches them only when a code block with that language is rendered.

## 8. Custom Block Renderers (`renderers`)

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