# Theming

Markify renders with your app's design tokens — no extra config needed. It works out of the box with **shadcn** (default), **daisyUI**, **Radix Themes**, and **Bootstrap**, and supports per-instance overrides.

## 1. Just pick your theme system (`themeType`)

```tsx
<Markify>…</Markify>                       // shadcn tokens (default)
<Markify themeType="shadcn">…</Markify>    // --background, --card, --muted, --border, --primary, …
<Markify themeType="daisyui">…</Markify>   // daisyUI v5 (--color-base-100, --color-primary, …)
<Markify themeType="radix">…</Markify>     // Radix Themes v3 (--color-background, --gray-*, --accent-*)
<Markify themeType="bootstrap">…</Markify> // Bootstrap 5 (--bs-body-bg, --bs-primary, …)
<Markify themeType="none">…</Markify>      // Markify's built-in neutral palette
```

> **next-themes?** You're already on `"shadcn"` — next-themes just toggles `.dark`/`.light` over shadcn-named tokens, which the default preset reads directly.

## 2. Override per instance (`theme` prop)

Customize any value inline — highest priority, no CSS:

```tsx
<Markify theme={{ card: "oklch(0.2 0.01 260)", border: "oklch(1 0 0 / 11%)", radius: "0.75rem" }}>
  {markdown}
</Markify>
```

Raw `--markify-*` vars also work via `cssVars`.

## 3. Import one CSS file

```tsx
// app root — main.tsx / App.tsx / layout.tsx
import "@glitchoff/markify/themes/core.css";
```

- `core.css` — **recommended.** Scoped styles + theme aliases, no global tokens. Your app provides them.
- `markify.css` — legacy; bundles default shadcn tokens. Only if your app has **no theme system**.

Markify's CSS is scoped under `.markify-root` and fully **unlayered** — import order doesn't matter and it can't break your app's cascade.

## 4. Dark mode & code highlighting

- **Dark mode:** your app's normal toggle (`.dark`, `[data-bs-theme="dark"]`, etc.). Markify follows automatically.
- **Code syntax** is separate from design tokens:
  ```tsx
  <Markify hljsTheme="dark" />                    // built-in Atom themes
  <Markify hljsThemeUrl="/rose-pine.css" />       // external theme CSS
  <Markify hljsCustomCss=".hljs { color: #fff }"/>// raw CSS
  ```

## 5. Token reference

Markify's components only read these scoped `--markify-*` properties. Each alias defaults to the preset's source token with a neutral fallback.

| Alias | Default | Used by |
| --- | --- | --- |
| `--markify-bg` / `-fg` | `--background` / `--foreground` | page backgrounds, text |
| `--markify-card` / `-card-fg` | `--card` / `--card-foreground` | code blocks, tables, callouts, chess & mermaid cards |
| `--markify-popover` / `-popover-fg` | `--popover` / `--popover-foreground` | menus, toolbars |
| `--markify-primary` / `-primary-fg` | `--primary` / `--primary-foreground` | buttons, links, active tabs |
| `--markify-secondary` / `-secondary-fg` | `--secondary` / `--secondary-foreground` | secondary buttons, code headers |
| `--markify-muted` / `-muted-fg` | `--muted` / `--muted-foreground` | inline code, labels, table body |
| `--markify-accent` / `-accent-fg` | `--accent` / `--accent-foreground` | hover fills, menu items |
| `--markify-destructive` / `-destructive-fg` | `--destructive` / `--destructive-foreground` | errors, failed states |
| `--markify-border` / `-input` / `-ring` | `--border` / `--input` / `--ring` | borders, dividers, focus |
| `--markify-radius` | `--radius` | rounded corners |
| `--markify-font-sans` / `-font-mono` | `--font-sans` / `--font-mono` | text / code fonts |

## 6. Standalone components & custom presets

`MermaidBlock`, `ChessGame`, and `FenBoard` accept the same `themeType`/`theme` props:

```tsx
<MermaidBlock code={code} themeType="daisyui" />
<ChessGame pgn={pgn} theme={{ card: "#2a2a3c" }} />
```

Add your own preset with a CSS block, then pass `themeType`:

```css
.markify-root[data-theme-type="material"] {
  --markify-bg: var(--md-sys-color-surface);
  --markify-fg: var(--md-sys-color-on-surface);
  --markify-primary: var(--md-sys-color-primary);
}
```

> Callout accent colors, the code-block background, and highlight themes are intentionally fixed (not token-driven). Override via `components`, `codeBlockClassName`, or `hljsCustomCss`.