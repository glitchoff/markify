# Theming & Dark Mode

Markify renders with the host app's design tokens through **markify-scoped aliases** (`--markify-*`). It never touches your `:root` tokens, so it works out of the box with shadcn, daisyUI, Radix Themes, Bootstrap — or any custom theme — and supports per-instance overrides via the `theme` prop.

## 1. Pick a CSS file

| Import | When to use |
| --- | --- |
| `@glitchoff/markify/themes/core.css` | **Recommended for everyone.** Scoped base styles + utility layer + theme aliases. No global design tokens — your app provides them. |
| `@glitchoff/markify/themes/markify.css` | Legacy. Also ships default shadcn tokens on `:root`/`.dark`. Only if your app has **no theme system at all**. |

```tsx
// app root — e.g. main.tsx, App.tsx, or layout.tsx
import "@glitchoff/markify/themes/core.css";
```

> [!WARNING]
> If you import `markify.css` (the legacy full file) into an app that already defines its own shadcn tokens, its bundled `:root`/`.dark`/`@media` token blocks can override your theme. Use `core.css` for themed apps.

## 2. Markify token reference

Markify's components only read these custom properties, all scoped under `.markify-root`:

| Alias | Default source | Used by |
| --- | --- | --- |
| `--markify-bg` | `--background` | Page-level backgrounds, transparent overlays |
| `--markify-fg` | `--foreground` | Body text, headings, icons |
| `--markify-card` | `--card` | Code blocks, tables, callouts, chess & mermaid cards |
| `--markify-card-fg` | `--card-foreground` | Text on cards |
| `--markify-popover` | `--popover` | Dropdown menus, toolbars, copy menus |
| `--markify-popover-fg` | `--popover-foreground` | Text in popovers |
| `--markify-primary` | `--primary` | Primary buttons, active tabs, links, copy state |
| `--markify-primary-fg` | `--primary-foreground` | Text on primary elements |
| `--markify-secondary` | `--secondary` | Secondary buttons, code header bars |
| `--markify-secondary-fg` | `--secondary-foreground` | Text on secondary elements |
| `--markify-muted` | `--muted` | Code inline backgrounds, subtle fills |
| `--markify-muted-fg` | `--muted-foreground` | Labels, hints, code headers, table body |
| `--markify-accent` | `--accent` | Hover fills, active menu items |
| `--markify-accent-fg` | `--accent-foreground` | Text on hover fills |
| `--markify-destructive` | `--destructive` | Error text, failed states |
| `--markify-destructive-fg` | `--destructive-foreground` | Text on destructive elements |
| `--markify-border` | `--border` | Card/table/code borders, dividers |
| `--markify-input` | `--input` | Input-like borders |
| `--markify-ring` | `--ring` | Focus rings |
| `--markify-radius` | `--radius` | Corner radius of rounded cards |
| `--markify-font-sans` | `--font-sans` | Base font of rendered content |
| `--markify-font-mono` | `--font-mono` | Code blocks |

Every alias has a neutral fallback, so missing tokens degrade gracefully instead of breaking.

## 3. Presets (`themeType`)

The aliases resolve their default source through a preset. Pass `themeType` to pick your app's token vocabulary:

```tsx
<Markify themeType="shadcn">      // default — shadcn tokens
<Markify themeType="daisyui">     // daisyUI v5 tokens (--color-base-100, --color-primary, …)
<Markify themeType="radix">       // Radix Themes v3 tokens (--color-background, --gray-*, --accent-*)
<Markify themeType="bootstrap">   // Bootstrap 5 vars (--bs-body-bg, --bs-primary, …)
<Markify themeType="none">        // no indirection — Markify's built-in neutral palette
```

| Preset | Resolves to |
| --- | --- |
| `"shadcn"` (default) | `--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, … |
| `"daisyui"` | `--color-base-100`, `--color-base-content`, `--color-primary`, `--color-primary-content`, `--color-error`, `--radius-box`, … |
| `"radix"` | `--color-background`, `--color-panel-solid`, `--gray-3/6/11/12`, `--accent-3/9/11`, `--accent-contrast`, `--red-9`, `--focus-8`, … |
| `"bootstrap"` | `--bs-body-bg`, `--bs-body-color`, `--bs-primary`, `--bs-secondary-bg`, `--bs-danger`, `--bs-border-color`, … |
| `"none"` | literal neutral palette (no `var()` indirection) |

> Apps using **next-themes** are already on the shadcn preset: next-themes only toggles `.dark`/`.light` classes over shadcn-named tokens, which the default `"shadcn"` mapping reads directly.

## 4. Per-instance overrides (`theme` prop)

Customize any value inline — highest priority, no CSS needed:

```tsx
<Markify
  theme={{
    card: "oklch(0.2 0.01 260)",
    border: "oklch(1 0 0 / 11%)",
    primary: "oklch(0.9 0.01 260)",
    radius: "0.75rem",
  }}
>
  {markdown}
</Markify>
```

For raw custom properties, use the escape hatch:

```tsx
<Markify cssVars={{ "--markify-gap": "1.5rem", "--markify-card": "#1e1e2e" }}>
  {markdown}
</Markify>
```

### Precedence (low → high)

1. Alias default in `core.css` — `var(<preset source>, <literal>)`
2. `[data-theme-type]` preset block
3. `theme` / `cssVars` prop (inline `style`)
4. `fontFamily` / `spacing` props

## 5. Standalone components

`MermaidBlock`, `ChessGame`, and `FenBoard` render outside a `<Markify>` wrapper, so they carry the same theming props and apply `markify-root` to their own root:

```tsx
<MermaidBlock code={code} themeType="daisyui" />
<ChessGame pgn={pgn} theme={{ card: "#2a2a3c" }} />
<FenBoard fen={fen} themeType="none" />
```

## 6. Dark mode

Dark mode is handled entirely by your app: toggle `.dark` (or `[data-bs-theme="dark"]`, `.radix-themes` dark variant, daisyUI `dark` theme) as usual. Markify's aliases follow automatically. No `@media` fallback blocks are shipped in `core.css`, so there is nothing to fight your theme provider.

## 7. Code block highlighting

Code syntax highlighting is a **separate axis** from design tokens:

```tsx
<Markify hljsTheme={resolvedTheme === "dark" ? "dark" : "light"}>      // built-in Atom themes
<Markify hljsThemeUrl={isDark ? "/rose-pine.css" : "/rose-pine-dawn.css"}>  // external theme
<Markify hljsCustomCss=".hljs { color: #fff; background: #111; }">     // raw CSS
```

## 8. Custom preset

Add your own token vocabulary in two steps:

1. Add a block in your CSS (imported after `core.css`):

```css
.markify-root[data-theme-type="material"] {
  --markify-bg: var(--md-sys-color-surface);
  --markify-fg: var(--md-sys-color-on-surface);
  --markify-primary: var(--md-sys-color-primary);
  /* …map any of the aliases above… */
}
```

2. Extend the type and pass it:

```ts
type MyPreset = "material";
<Markify themeType={"material" as any}>…</Markify>
```

## 9. Fixed, non-token values

The following are intentionally **not** token-driven: callout accent colors (blue/emerald/amber/red… borders and tints), the code-block background `#0d1117`, and the `rose-pine`/Atom highlight themes. Override them via the `components` prop, `codeBlockClassName`, or `hljsCustomCss` if needed.