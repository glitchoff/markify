# Layout & Sizing

## Root container

`<Markify>` renders a single wrapper `<div class="markify-root">`. It accepts:

| Prop | Effect |
|------|--------|
| `className` | Merged onto the root `div` |
| `fontFamily` | Applied as `style.fontFamily` on the root |

There is no generic `{...rest}` spread — to style the container use `className`, or target `.markify-root` in your own CSS:

```tsx
<Markify className="my-8 max-w-none">{markdown}</Markify>
```

## Parent width

Markify renders wide tables, scrollable code blocks, and 16:9 embeds — wrap it in a container with a defined width constraint:

```tsx
<main className="w-full max-w-4xl mx-auto px-4 py-8">
  <Markify>{markdown}</Markify>
</main>
```

Common container patterns:

```tsx
{/* full-bleed chat pane, markdown constrained inside */}
<div className="h-screen overflow-y-auto">
  <div className="mx-auto max-w-3xl px-4">
    <Markify isStreaming>{tokens}</Markify>
  </div>
</div>

{/* unconstrained — let the app own the width entirely */}
<Markify className="max-w-none">{markdown}</Markify>
```

## Built-in sizing behavior

- Tables span the full card width and scroll horizontally when `table.scrollable` is on
- Code blocks scroll horizontally when unwrapped; wrap keeps everything inside the card
- Images are capped at container width (`max-width: 100%`, auto height) via the base layer
- Mermaid diagrams fit their container; enable `mermaid.fit` to auto-shrink large diagrams

## Sizing knobs

| Where | What |
|---|---|
| `spacing` prop / config | vertical rhythm between blocks (see [styling](/docs/styling)) |
| `cssVars` prop | any `--markify-*` variable, e.g. `--markify-radius`-linked tokens from your shadcn theme |
| `fontFamily` / `theme.fontSans` / `theme.fontMono` | typography |
| `chess.maxWidth` | max FEN board width in px (default 420) |
