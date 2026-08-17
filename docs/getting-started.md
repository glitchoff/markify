# Getting Started with Markify

`@glitchoff/markify` is a high-performance, streaming Markdown renderer for React applications built with Tailwind CSS.

## 1. Installation

Install Markify using your preferred package manager:

```bash
pnpm add @glitchoff/markify
# or
npm install @glitchoff/markify
# or
yarn add @glitchoff/markify
```

### Peer Dependencies
Markify requires React 18 or 19:
- `react`: `^18.0.0 || ^19.0.0`
- `react-dom`: `^18.0.0 || ^19.0.0`

---

## 2. Requirements & CSS Imports



> [!IMPORTANT]
> **Tailwind CSS Required:**  
> Markify components rely on Tailwind CSS utility classes. Ensure Tailwind CSS is installed and configured in your host project.


Import Markify's CSS once at your application root (e.g. `main.tsx`, `App.tsx`, or `layout.tsx`):

```tsx
import "@glitchoff/markify/themes/core.css";
```

Pick the file that matches your app:

| File | When to use |
| --- | --- |
| `@glitchoff/markify/themes/core.css` | **Recommended.** Scoped base + utility layer + theme aliases. Your app provides its own design tokens (shadcn, daisyUI, Radix, Bootstrap, custom). |
| `@glitchoff/markify/themes/markify.css` | Only if your app has **no theme system** and you want Markify's bundled shadcn defaults. |

> [!NOTE]
> **Safe to import, order-independent.** Every rule Markify ships is scoped under `.markify-root` and emitted **unlayered** — it never declares a CSS `@layer` and never touches your `:root` tokens. Importing it before or after your Tailwind/`globals.css` cannot reorder your cascade or override your theme.

See [Theming](/docs/theming) for the full token reference and the `themeType` / `theme` props.

---

## 3. Standard Setup (copy-paste)

One standard way, minimal config — Tailwind v4 + shadcn tokens + `core.css`. This is exactly what the [demo app](/docs/getting-started) runs.

**1. Install Tailwind v4** (Vite example):

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default { plugins: [react(), tailwindcss()] };
```

**2. `globals.css`** — import Tailwind, Markify's `core.css`, map the tokens, define light/dark values:

```css
@import "tailwindcss";
@import "@glitchoff/markify/themes/core.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  /* …any shadcn palette… */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(1 0 0 / 10%);
  /* …any shadcn palette… */
}
```

**3. Import `globals.css` at your app root** and render:

```tsx
import { Markify } from "@glitchoff/markify";

<Markify isStreaming={generating}>{reply}</Markify>
```

That's it — no `themeType` needed for shadcn apps (it's the default), and Markify follows your `.dark` class automatically.

**Zero-config alternative:** if you'd rather not define tokens at all, import the legacy `@glitchoff/markify/themes/markify.css` instead of `core.css` — it bundles a neutral shadcn palette. You lose the warm/custom look but skip step 2's token block.

## 4. Basic Usage

Render static or streaming Markdown content with the `<Markify>` component:

```tsx
import { Markify } from "@glitchoff/markify";

export function SimpleViewer() {
  const content = "# Hello World\n\nThis is **Markify** rendering markdown!";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Markify>{content}</Markify>
    </div>
  );
}
```

### Streaming Mode (AI Responses)
Enable token-arrival reveal animation during LLM streaming:

```tsx
<Markify isStreaming={isLoading}>
  {streamingTextContent}
</Markify>
```
