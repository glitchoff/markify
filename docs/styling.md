# Styling & Layout

How Markify's root container forwards styles and how to control spacing between blocks.

## 1. Root Container

`<Markify>` renders a single wrapper `<div class="markify-root">` around your Markdown. It forwards exactly **two** things:

| Prop | Effect |
|------|--------|
| `className` | Merged onto the root `div` (alongside `markify-root text-foreground ...`) |
| `fontFamily` | Applied as `style.fontFamily` on the root |

There is no generic `{...rest}` spread — arbitrary HTML props and `style` are **not** forwarded. To style the container, use `className` (and Tailwind arbitrary variants) or target `.markify-root` in your own CSS.

```tsx
<Markify className="my-8 max-w-none [&_a]:text-blue-600">
  {markdown}
</Markify>
```

## 2. Spacing Between Blocks

The vertical gap between paragraphs, headings, code blocks, tables, callouts, lists, and embeds is driven by CSS variables on `.markify-root`:

| Variable | Controls | Default (`normal`) |
|----------|----------|--------------------|
| `--markify-gap` | Bottom margin between blocks | `2rem` |
| `--markify-gap-lg` | Top margin above headings | `3.25rem` |
| `--markify-gap-sm` | Bottom margin between list items | `0.5rem` |

### Named presets

Pass a `spacing` prop to switch the whole layout at once:

```tsx
<Markify spacing="compact">  {/* tight: 0.5rem / 0.75rem / 0.25rem */}
<Markify spacing="normal">   {/* default: 2rem / 3.25rem / 0.5rem */}
<Markify spacing="relaxed">  {/* airy: 2.5rem / 4rem / 0.625rem */}
```

### Granular overrides

`spacing` also accepts an object to tune individual parts without affecting the rest:

```tsx
<Markify spacing={{ block: "2.5rem", headingTop: "3.5rem" }}>
  {markdown}
</Markify>
```

| Key | Meaning |
|-----|---------|
| `block` | Gap between blocks / paragraphs |
| `headingTop` | Gap above headings |
| `listItem` | Gap between list items |

Each key accepts any CSS length (`"1rem"`, `"18px"`, `"1.5em"`). Keys you omit fall back to the `normal` preset.

### Without the `spacing` prop

You can also override the variables directly in your own CSS — useful for a global default:

```css
.markify-root {
  --markify-gap: 2rem;
  --markify-gap-lg: 3.25rem;
}
```

## 3. Parent Width

Markify renders wide tables, scrollable code blocks, and 16:9 embeds, so wrap it in a container with a defined width constraint:

```tsx
<main className="w-full max-w-4xl mx-auto px-4 py-8">
  <Markify>{markdown}</Markify>
</main>
```

## 4. Theme vs Styling

- **Theming** covers colors and light/dark mode (`theming.md`).
- **Styling** (this page) covers layout, container props, and spacing.
