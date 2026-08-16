# @glitchoff/markify

A shadcn-themed streaming markdown renderer for React.

```tsx
import { Markify } from "@glitchoff/markify";

<Markify isStreaming={isLoading}>{markdownContent}</Markify>
```

## Features

- **Streaming** — token-arrival rendering via `remend`, no RAF
- **Syntax highlighting** — highlight.js with optional Web Worker, bundled Atom One themes
- **Collapsible code blocks** — auto-collapse >5 lines, language color dot, ChevronDown/Wrap/Copy icons
- **Math/LaTeX** — KaTeX via `remark-math` + `rehype-katex` (add CSS separately)
- **Mermaid diagrams** — zoom/pan, download (SVG/PNG/MMD), fullscreen
- **Tables** — shadcn-styled with copy-as-markdown + download CSV/TSV/MD
- **Callouts** — `> [!NOTE/WARNING/TIP]` blockquotes
- **Theming** — 100% shadcn CSS variable tokens + Atom One hljs themes

## Installation

```bash
pnpm add @glitchoff/markify
```

Peer dependencies: `react ^18 || ^19`, `react-dom ^18 || ^19`

## Styling Requirements

Markify requires **Tailwind CSS** installed and configured in your application.

Import `markify.css` in your root file:

```tsx
import "@glitchoff/markify/themes/markify.css";
import { Markify } from "@glitchoff/markify";
```

The theme includes light tokens by default, dark tokens under `.dark`, and a `prefers-color-scheme: dark` fallback.

> [!NOTE]
> **Important for Light/Dark mode toggles:**  
> When switching to Light Mode, your theme provider should add `.light` to `document.documentElement` (`<html class="light">`) or remove `.dark`. The CSS fallback uses `:root:not(.light)` for system dark mode support, so explicitly adding `.light` prevents system dark mode from forcing dark text variables onto light backgrounds.

## Parent Container Width

> [!IMPORTANT]
>We recommend wrapping <Markify> in a container with a defined width constraint.
> Markify renders complex Markdown elements (wide data tables, scrollable code blocks, zoomable Mermaid diagrams). Without a parent width limit (e.g. `max-w-4xl` or `max-width: 1000px`), tables and diagrams may overflow the viewport.

```tsx
// Tailwind CSS Example
<main className="w-full max-w-4xl mx-auto px-4 py-8">
  <Markify isStreaming={isLoading}>{markdownContent}</Markify>
</main>
```

For full setup guidelines including dark mode theme switching, see [USAGE.md](./USAGE.md).

## Usage

```tsx
// Static
<Markify># Hello **world**</Markify>

// Streaming
<Markify isStreaming={true}>{streamingContent}</Markify>

// With Web Worker for code highlighting
<Markify codeBlockWorker={true}>{contentWithCodeBlocks}</Markify>
```

### KaTeX CSS

Add to your app layout if you use math:

```tsx
import "katex/dist/katex.min.css";
```

### highlight.js Theme

Built-in Atom One themes are auto-injected. Control which one:

```tsx
// Atom One Dark (default)
<Markify hljsTheme="dark">...</Markify>

// Atom One Light
<Markify hljsTheme="light">...</Markify>
```

The theme also controls code block header background (dark/light).

For a custom hljs theme, pass raw CSS:

```tsx
<Markify hljsCustomCss=".hljs { color: #fff; background: #000; }">...</Markify>
```

Or load an external CSS file via URL:

```tsx
<Markify hljsThemeUrl="/path/to/rose-pine.css">...</Markify>
```

When `hljsThemeUrl` is provided, it injects a `<link>` element and skips the built-in Atom One injection.

### Theme switching with React theme state / next-themes

```tsx
// Using built-in Atom One light & dark themes
<Markify hljsTheme={isDark ? "dark" : "light"}>
  {content}
</Markify>

// Or using custom external hljs CSS themes
<Markify hljsThemeUrl={isDark ? "/rose-pine.css" : "/rose-pine-dawn.css"}>
  {content}
</Markify>
```

### Font customization

```tsx
// Content font
<Markify fontFamily="Georgia, serif">...</Markify>

// Code block font (overrides monospace default)
<Markify codeFontFamily='"JetBrains Mono", monospace'>...</Markify>
```

### Tables

```tsx
<Markify
  table={{
    showCopyButton: true,
    downloadFormats: ["csv", "tsv", "md"],
    scrollable: true,
  }}
>
  | Name | Age |
  |------|-----|
  | Alice | 30 |
</Markify>
```

### Mermaid Custom Configuration

Pass custom Mermaid settings directly via the `mermaidConfig` prop:

```tsx
<Markify
  mermaidConfig={{
    theme: "dark",
    fontFamily: "Inter, sans-serif",
    flowchart: { curve: "basis" },
  }}
>
  {contentWithMermaid}
</Markify>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | Markdown content |
| `isStreaming` | `boolean` | `false` | Enable animated token-arrival reveal |
| `className` | `string` | — | Additional CSS classes |
| `codeBlockWorker` | `boolean` | `false` | Offload hljs highlighting to Web Worker |
| `hljsTheme` | `"dark" \| "light"` | `"dark"` | Atom One theme for code blocks |
| `hljsCustomCss` | `string` | — | Custom inline hljs CSS (overrides `hljsTheme`) |
| `hljsThemeUrl` | `string` | — | External CSS file URL for hljs (skips built-in injection) |
| `codeBlockClassName` | `string` | — | Additional CSS classes for the code block wrapper |
| `fontFamily` | `string` | — | Content font-family |
| `codeFontFamily` | `string` | — | Code block font-family |
| `mermaidConfig` | `MermaidConfig` | — | Custom configuration for Mermaid diagrams |
| `table` | `TableOptions` | — | Table display config |

## Exports

```tsx
import {
  Markify,           // Main component
  MarkifyProps,      // Markify prop types
  useStreamingReveal, // Streaming hook
  MermaidBlock,      // Standalone mermaid renderer
  TableOptionsContext, // Context for table options
  useTableOptions,   // Hook for table options
  injectHljsTheme,   // Manually inject hljs theme CSS
  cn,                // clsx + tailwind-merge utility
} from "@glitchoff/markify";

// Theme CSS files for direct import
import "@glitchoff/markify/themes/atom-dark.css";
import "@glitchoff/markify/themes/atom-light.css";

// Theme JS strings (for custom injection)
import { ATOM_DARK_CSS, ATOM_LIGHT_CSS, getThemeCss } from "@glitchoff/markify";
```

## License

MIT

