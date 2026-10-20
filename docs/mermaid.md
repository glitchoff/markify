# Mermaid diagrams

Markify renders ```` ```mermaid ```` fences as interactive diagrams — zoom, pan, fullscreen, and export — instead of a wall of syntax.

The default engine is **[Pele](https://pele.run)** (`obsidianmd/pele`): Obsidian's Mermaid-to-SVG renderer. It's synchronous, has zero runtime dependencies, and paints entirely from CSS variables, so diagrams follow your app's palette and switch themes without re-rendering. `mermaid.js` stays available as a fallback for syntax Pele's Mermaid 12.1.0 coverage doesn't handle yet.

## Install

```bash
npx markify@latest add mermaid
```

This copies `comps/mermaid.tsx` into your project and adds `pele` (plus `mermaid` if you use the fallback) to your dependencies.

## Configure

```ts
// components/markify/config.tsx
mermaid: {
  showHeader: true,     // copy / download / fullscreen toolbar. Default: true
  showBackground: true, // card border + background. Default: true
  fit: false,           // auto-fit diagram to container width. Default: false
  renderer: "pele",     // "pele" | "mermaid". Default: "pele"
  fallback: true,       // fall back to mermaid.js when Pele can't parse. Default: true
}
```

### Options

| Option | Default | What it does |
| --- | --- | --- |
| `showHeader` | `true` | Toolbar with copy, download, fit, and fullscreen. |
| `showBackground` | `true` | Rounded card border and background around the diagram. |
| `fit` | `false` | Scale the diagram down to fit the container on mount and resize. |
| `renderer` | `"pele"` | Which engine renders the SVG. |
| `fallback` | `true` | On a Pele parse error, retry with mermaid.js before showing an error. |

## Engines

### Pele (default)

- **Synchronous.** `render()` returns an SVG immediately — no async race with streaming tokens.
- **Zero dependencies.** No `d3`, no `dagre`, no `cytoscape`.
- **33 diagram types**, each in its own lazily-loaded chunk. Only what you render is downloaded.
- **CSS-variable theming.** Set `--pele-*` on any ancestor and every diagram repaints.

Markify's `tokens.css` maps Pele's variables onto the `--markify-*` tokens:

```css
--pele-bg: var(--markify-card);
--pele-fg: var(--markify-fg);
--pele-muted: var(--markify-muted-fg);
--pele-line: var(--markify-fg);
--pele-surface: var(--markify-muted);
--pele-surface-alt: var(--markify-secondary);
--pele-border: var(--markify-border);
--pele-accent: var(--markify-primary);
--pele-font: var(--markify-font-sans);
--pele-font-mono: var(--markify-font-mono);
--pele-radius: 4px;
```

Override any of them per-instance to restyle a single diagram:

```tsx
<Markify cssVars={{ "--pele-accent": "oklch(0.65 0.2 280)" }}>
  {content}
</Markify>
```

Charts (`xychart`, `pie`, `quadrantChart`, `radar`, `treemap`) use `--pele-series-1` through `--pele-series-8`.

### mermaid.js (fallback)

Set `renderer: "mermaid"` to use mermaid.js everywhere, or leave `fallback: true` (the default) to let it catch anything Pele rejects. It's dynamically imported, so it never lands in the base bundle unless you actually use it.

> **Version note:** Pele targets Mermaid **12.1.0** syntax. If your content relies on newer syntax, keep `fallback: true` until Pele catches up.

## Streaming

Streaming a fence means the source is incomplete on almost every token — `flowchart LR\n  A -->` doesn't parse. Markify handles this by keeping the **last SVG that rendered successfully** and swapping in a new one only when the next attempt succeeds:

```tsx
<Markify isStreaming={isStreaming}>{content}</Markify>
```

A half-written diagram shows the previous frame rather than an error flash. The error card only appears if the very first render fails.

## Toolbar

| Control | Action |
| --- | --- |
| Copy | Copies the Mermaid source to the clipboard. |
| Download → SVG | The rendered vector. |
| Download → PNG | Rasterised at 2× via canvas. |
| Download → MMD | The raw `.mmd` source file. |
| Fit | Re-fit the diagram to the container (shown when `fit` is on). |
| Fullscreen | Expand to fill the viewport. |

## Interaction

- **Zoom** — <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + wheel, anchored on the cursor.
- **Pan** — drag with the mouse, or drag with one finger on touch.
- **Pinch** — two-finger zoom on touch.
- **Reset** — double-click, or the reset button in the zoom panel.

Transform transitions are disabled under `prefers-reduced-motion`.

## Performance

Diagrams render only when they scroll into view (`IntersectionObserver`, 10% threshold). Combined with Pele's per-type chunks, a page with one flowchart downloads only the flowchart parser — not the other 32.

## Error handling

A parse failure shows the message, the line number when Pele provides one, a Retry button, and a collapsible **Show source** panel:

```
Failed to render diagram
Parse error on line 3: unexpected token "-->"
▸ Show source
```

## Custom rendering

Swap the whole component if you need to:

```tsx
<Markify
  components={{
    pre: (props) => <MyDiagram {...props} />,
  }}
>
  {content}
</Markify>
```

## Next

- [Theming](/docs/theming) — full token reference
- [Streaming](/docs/streaming) — how block-level streaming works
- [Pele docs](https://pele.run) — API, theming, and security
