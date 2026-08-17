# Markify (`@glitchoff/markify`) Usage & Integration Guide

A complete guide on the proper real-world setup for **Markify**, covering parent container width control, theme switcher integration, dark mode sync, and key caveats omitted from the official library README.

---

## 1. Parent Container Width Recommendation

> [!IMPORTANT]
> **We recommend wrapping `<Markify>` in a container with a defined width constraint.**  
> Markify renders complex Markdown elements, including wide tables with export controls, code blocks with horizontal scrolling, and zoomable/pannable Mermaid diagrams.  
> Without an explicit parent container width, these elements can overflow bounds, break page layouts, or stretch infinitely.

### Example: CSS Approach
```css
/* index.css */
.markify-container {
  width: 90vw;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

html.dark .markify-container {
  background-color: #0f172a;
  border-color: #1e293b;
}
```
```tsx
import { Markify } from "@glitchoff/markify";
import "@glitchoff/markify/themes/core.css";

export function ContentViewer({ content }: { content: string }) {
  return (
    <div className="markify-container">
      <Markify isStreaming>{content}</Markify>
    </div>
  );
}
```

### Example: Tailwind CSS Approach
```tsx
export function ContentViewer({ content }: { content: string }) {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <Markify isStreaming>{content}</Markify>
      </div>
    </main>
  );
}
```

---

## 2. Tailwind CSS & CSS Import

Markify requires **Tailwind CSS** installed in your project. Import Markify's CSS in your application root:

```tsx
import "@glitchoff/markify/themes/core.css";
```

`core.css` ships the scoped base styles, the pre-compiled utility layer, and the `--markify-*` theme aliases — **without** any global design tokens, so it never overrides your app's theme. Only import `@glitchoff/markify/themes/markify.css` (which bundles default shadcn tokens on `:root`/`.dark`) if your app has no theme system at all.

---

## 3. Theme Switcher & Dark Mode Integration

Markify reads your app's design tokens through the `--markify-*` aliases (see [docs/theming.md](docs/theming.md)). Dark mode is handled entirely by your app:

1. **Toggle your theme as usual** (`.dark` class, `[data-bs-theme="dark"]`, Radix dark variant, daisyUI dark theme, …). Markify follows automatically.
2. **Pick a preset** with `themeType` when your tokens aren't shadcn-named: `"shadcn"` (default), `"daisyui"`, `"radix"`, `"bootstrap"`, or `"none"`.
3. **Code block syntax sync**: pass `hljsTheme={isDark ? "dark" : "light"}` (or `hljsThemeUrl` for external themes) so code blocks follow the active theme.

```tsx
<Markify
  isStreaming
  themeType="shadcn"                       // matches next-themes / shadcn apps by default
  hljsTheme={resolvedTheme === "dark" ? "dark" : "light"}
>
  {markdown}
</Markify>
```

### Complete React Theme Context & Switcher Example

```tsx
// 1. Theme Context (src/context/ThemeContext.tsx)
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem("theme") as Theme) || "system"
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark";

    const activeTheme = isDark ? "dark" : "light";
    setResolvedTheme(activeTheme);

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.setAttribute("data-theme", activeTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext)!;
```

```tsx
// 2. Integration in Main App Component
import { Markify } from "@glitchoff/markify";
import { useTheme } from "./context/ThemeContext";

export function MarkdownViewer({ markdown }: { markdown: string }) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Markify
        isStreaming
        hljsTheme={resolvedTheme === "dark" ? "dark" : "light"}
      >
        {markdown}
      </Markify>
    </div>
  );
}
```

### Per-instance theme overrides

Customize any token for a single render — highest priority, no CSS:

```tsx
<Markify theme={{ card: "oklch(0.2 0.01 260)", border: "oklch(1 0 0 / 11%)" }}>
  {markdown}
</Markify>
```

---

## 4. KaTeX Math CSS

If your markdown includes inline or block math (`$E = mc^2$` or `$$ \int x dx $$`), remember to import KaTeX CSS in your root file (`App.tsx` or `main.tsx`):

```tsx
import "katex/dist/katex.min.css";
```

---

## 5. Mermaid Diagram Customization (`mermaidConfig`)

You can pass custom Mermaid settings directly via the `mermaidConfig` prop on `<Markify>` or `<MermaidBlock>`:

```tsx
<Markify
  mermaidConfig={{
    theme: "dark",
    fontFamily: "Inter, sans-serif",
    flowchart: { curve: "basis" },
  }}
>
  {content}
</Markify>
```

---

## 6. What Was Lacking in Official README (`README.md`)

| Gap / Missing Detail | Impact on Developer | Correct Approach / Solution |
| :--- | :--- | :--- |
| **No Parent Container Width Guidelines** | Code blocks, tables, and Mermaid diagrams overflow page width or break flex/grid layouts. | Explicitly instruct wrapping `<Markify>` in a container div with controlled width (`max-width: 1000px` / `max-w-4xl`). |
| **Incomplete Theme Switcher Pattern** | Docs mention `isDark ? "/rose-pine.css" : ...` for custom URLs, but omit basic `hljsTheme` prop sync with React theme state. | Use `hljsTheme={isDark ? "dark" : "light"}` connected to `.dark` class toggle on `document.documentElement`. |
| **KaTeX CSS Requirement Buried** | Math equations render broken unstyled text if developer misses section 4.1. | Clearly highlight `import "katex/dist/katex.min.css";` as a setup requirement when math rendering is enabled. |
| **Tailwind & Theme Import Requirement** | Confusion on theme setup. | Document that Tailwind CSS is required, recommend importing `@glitchoff/markify/themes/core.css` (scoped, no global tokens), and point to `themeType`/`theme` for token mapping. |
