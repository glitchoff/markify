# Customization

Everything Markify renders lives in your repo. Three levels of customization, from lightest to heaviest:

## 1. Settings — `config.tsx`

The single seam for behavior. Edit `components/markify/config.tsx`:

```ts
export const markifyConfig = {
  theme: {},            // shadcn token overrides
  cssVars: {},          // raw custom properties
  spacing: "normal",    // vertical rhythm
  fontFamily: undefined,

  codeBlock: { worker: false, hljsTheme: "dark", hljsLanguages: "default" },
  table: { showCopyButton: true, downloadFormats: [], scrollable: true },
  mermaid: { showHeader: true, showBackground: true, fit: false },
  chess: { enabled: false, maxWidth: 420, showNotation: true },
  embeds: { youtube: true, twitter: true },
};
```

Every setting can also be overridden per-instance as a `<Markify>` prop (`spacing`, `theme`, `cssVars`, `fontFamily`, `components`).

## 2. The component map

In `config.tsx`, `buildComponents` maps markdown elements to components. Swap any mapping for your own — a file in `comps/`, your own component, or a third-party one:

```tsx
// config.tsx, inside buildComponents
return {
  // …default mappings…
  blockquote: (props: any) => <MyCallout {...props} />,
  img: (props: any) => <MyImageHandler {...props} />,
  …overrides,
};
```

The `<Markify components={{ … }}>` prop does the same per-instance, merged over the built-in map.

## 3. Edit the components

The `comps/` files are plain React + Tailwind — change markup, classes, behavior, anything. They're yours.

### Re-copy a component

Restore a component to its registry default after local edits:

```bash
npx @glitchoff/markify add code-block
```

Run `markify add` with no arguments to list everything available.

### Remove a component

Delete its file and remove its mapping from `buildComponents` in `config.tsx`. Each comp is self-contained (imports only its npm deps and the sibling `_lib.ts` / `_katex-unicode.ts` helpers), so removal is clean.

## Tokens

`tokens.css` defines the `--markify-*` aliases and fallbacks. Add your own variables there or override them via `cssVars` in config — see [theming](/docs/theming).

## Tips

- Commit the scaffold before re-running `init` — it overwrites the whole folder, so a diff review is your safety net.
- Keep heavy components (mermaid, chess) lazy: they already are — `config.tsx` loads them with `React.lazy` only when their markdown appears.
