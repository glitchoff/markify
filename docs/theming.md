# Theming & Dark Mode

Markify is **shadcn-compatible by default**. The components consume standard shadcn design tokens (`--background`, `--foreground`, `--muted`, `--border`, `--primary`, `--card`, `--popover`, `--radius`, …). If your app already has a shadcn theme — including dark mode via `.dark` — Markify picks it up automatically. Zero configuration.

## How it works

`tokens.css` (imported once by `config.tsx`) defines `--markify-*` aliases on `.markify-root`:

```css
.markify-root {
  --markify-bg: var(--background, oklch(1 0 0));
  --markify-fg: var(--foreground, oklch(0.145 0 0));
  --markify-muted: var(--muted, oklch(0.97 0 0));
  /* … */
}
```

Three cases, all covered:

| Your app | Result |
|---|---|
| **shadcn app** (tokens on `:root` / `.dark`) | aliases resolve to your tokens — light, dark, radius, fonts all inherited |
| **plain Tailwind app** | neutral fallbacks kick in; everything renders out of the box |
| **`.dark`-class app without shadcn tokens** | `tokens.css` ships a dark fallback block that activates under `.dark .markify-root` |

## Overriding

### Globally — `markifyConfig`

```ts
export const markifyConfig = {
  theme: { primary: "oklch(0.64 0.19 150)" },
  cssVars: { "--markify-gap": "1.5rem" },
};
```

### Per instance — props

```tsx
<Markify
  theme={{ primary: "oklch(0.64 0.19 150)", muted: "oklch(0.95 0 0)" }}
  cssVars={{ "--markify-gap": "1.5rem" }}
>
  {markdown}
</Markify>
```

- `theme` uses **shadcn token names** — one vocabulary, no alias layer to learn
- `cssVars` is the escape hatch for any raw custom property (spacing vars, callout accents, anything)

Overrides apply as inline custom properties on the markify root, so they cascade to every component inside — including light/dark if you swap values.

## Supported theme keys

`background`, `foreground`, `card`, `cardForeground`, `popover`, `popoverForeground`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `muted`, `mutedForeground`, `accent`, `accentForeground`, `destructive`, `destructiveForeground`, `border`, `input`, `ring`, `fontSans`, `fontMono`.

## Accent colors

A few colors have no shadcn equivalent and ship as plain custom properties in `tokens.css`:

| Variable | Used for |
|---|---|
| `--markify-callout-*` | the 17 callout accents: `note`, `tip`, `hint`, `important`, `warning`, `caution`, `attention`, `info`, `success`, `question`, `abstract`, `todo`, `failure`, `danger`, `bug`, `example`, `quote` |
| `--markify-success` / `--markify-success-20` | copied confirmation states |
| `--markify-danger` / `--markify-danger-10` | reset badges, destructive accents |

Override any of them via `cssVars` or by editing `tokens.css` directly — it's your file.
