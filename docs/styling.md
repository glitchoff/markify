# Styling & Spacing

## Spacing between blocks

Vertical rhythm is driven by custom properties on `.markify-root`:

| Variable | Controls | Default (`normal`) |
|----------|----------|--------------------|
| `--markify-gap` | Bottom margin between blocks | `2rem` |
| `--markify-gap-lg` | Top margin above headings | `3.25rem` |
| `--markify-gap-sm` | Bottom margin between list items | `0.5rem` |

### Named presets

```tsx
<Markify spacing="compact">  {/* 0.5rem / 0.75rem / 0.25rem */}
<Markify spacing="normal">   {/* 2rem / 3.25rem / 0.5rem — default */}
<Markify spacing="relaxed">  {/* 2.5rem / 4rem / 0.625rem */}
```

### Granular overrides

`spacing` also accepts an object to tune individual parts without affecting the rest:

```tsx
<Markify spacing={{ block: "2.5rem", headingTop: "3.5rem" }}>{markdown}</Markify>
```

| Key | Meaning |
|-----|---------|
| `block` | Gap between blocks / paragraphs |
| `headingTop` | Gap above headings |
| `listItem` | Gap between list items |

Each key accepts any CSS length (`"1rem"`, `"18px"`, `"1.5em"`). Keys you omit fall back to the `normal` preset. Set defaults globally via `markifyConfig.spacing`.

### Without the `spacing` prop

Override the variables directly in your own CSS — useful for a global default:

```css
.markify-root {
  --markify-gap: 2rem;
  --markify-gap-lg: 3.25rem;
}
```

## Built-in base styles

`tokens.css` ships a small scoped base layer (so Markify is correct even with no global resets), all inside `@layer base` — any utility overrides it:

- `*` → `border-color: var(--markify-border)`
- `p` → authored whitespace preserved (`pre-wrap`) + word breaking
- `button` → inherits font and color
- `table` → full width, collapsed borders; `img` → max-width 100%, auto height

## Theme vs styling

- **Theming** covers colors and dark mode (`theming.md`).
- **Styling** (this page) covers spacing, layout, and container props (`layout-and-sizing.md`).
