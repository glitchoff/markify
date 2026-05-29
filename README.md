# @glitchoff/markify

A streaming markdown renderer for React with shadcn theming.

```tsx
import { Markify } from "@glitchoff/markify";

<Markify isStreaming={isLoading}>{markdownContent}</Markify>
```

## Features

- **Streaming** — RAF word-boundary reveal with adaptive catch-up speed
- **Syntax highlighting** — highlight.js with optional Web Worker offloading
- **Math/LaTeX** — KaTeX via `remark-math` + `rehype-katex`
- **Mermaid diagrams** — streamdown-style rendering with zoom/pan, download (SVG/PNG/MMD), fullscreen
- **Tables** — shadcn-styled with copy-as-markdown
- **Callouts** — `> [!NOTE/WARNING/TIP]` blockquotes
- **Theming** — 100% shadcn CSS variable tokens

## Installation

```bash
pnpm add @glitchoff/markify
```

Peer dependencies: `react ^18 || ^19`, `react-dom ^18 || ^19`

## Usage

```tsx
import { Markify } from "@glitchoff/markify";

// Static
<Markify># Hello **world**</Markify>

// Streaming (animated reveal)
<Markify isStreaming={true}>
  {streamingContent}
</Markify>

// With Web Worker for code highlighting
<Markify codeBlockWorker={true}>
  {contentWithCodeBlocks}
</Markify>
```

### KaTeX CSS

Add this to your app layout if you use math:

```tsx
import "katex/dist/katex.min.css";
```

### highlight.js Theme

Swap CSS files for light/dark mode:

```tsx
// Dynamic theme switching
<link id="hljs-theme" rel="stylesheet" href="/hljs-dark.css" />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | Markdown content |
| `isStreaming` | `boolean` | `false` | Enable animated word-boundary reveal |
| `className` | `string` | — | Additional CSS classes |
| `codeBlockWorker` | `boolean` | `false` | Offload hljs highlighting to Web Worker |

## Theming

Uses shadcn CSS variables only:
`bg-background` `text-foreground` `border-border` `bg-muted` `text-muted-foreground` `bg-card` `bg-primary` `text-primary` `bg-secondary` `text-secondary-foreground` `bg-accent` `text-accent-foreground` `bg-popover` `text-popover-foreground` `bg-destructive` `text-destructive`

## License

Apache-2.0
