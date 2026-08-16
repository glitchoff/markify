import { useState } from 'react';
import { Markify } from '@glitchoff/markify';

const DOCS_FILES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    file: 'getting-started.md',
    badge: 'Core',
    content: `# Getting Started with Markify

\`@glitchoff/markify\` is a high-performance, streaming Markdown renderer for React applications built with Tailwind CSS.

## 1. Installation

Install Markify using your preferred package manager:

\`\`\`bash
pnpm add @glitchoff/markify
# or
npm install @glitchoff/markify
# or
yarn add @glitchoff/markify
\`\`\`

### Peer Dependencies
Markify requires React 18 or 19:
- \`react\`: \`^18.0.0 || ^19.0.0\`
- \`react-dom\`: \`^18.0.0 || ^19.0.0\`

---

## 2. Requirements & CSS Imports

> [!IMPORTANT]
> **Tailwind CSS Required:**  
> Markify components rely on Tailwind CSS utility classes. Ensure Tailwind CSS is installed and configured in your host project.

Import \`markify.css\` once at your application root (e.g. \`main.tsx\`, \`App.tsx\`, or \`layout.tsx\`):

\`\`\`tsx
import "@glitchoff/markify/themes/markify.css";
\`\`\`

---

## 3. Basic Usage

Render static or streaming Markdown content with the \`<Markify>\` component:

\`\`\`tsx
import { Markify } from "@glitchoff/markify";

export function SimpleViewer() {
  const content = "# Hello World\\n\\nThis is **Markify** rendering markdown!";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Markify>{content}</Markify>
    </div>
  );
}
\`\`\`

### Streaming Mode (AI Responses)
Enable token-arrival reveal animation during LLM streaming:

\`\`\`tsx
<Markify isStreaming={isLoading}>
  {streamingTextContent}
</Markify>
\`\`\`
`,
  },
  {
    id: 'theming',
    title: 'Theming & Dark Mode',
    file: 'theming.md',
    badge: 'Styles',
    content: `# Theming & Dark Mode

Markify includes built-in theme support for Light, Dark, and System modes with automatic fallback.

## 1. Class-Based Theme Toggling

Markify relies on \`.dark\` and \`.light\` CSS classes on \`document.documentElement\` (\`<html>\` element).

> [!WARNING]
> **Ensure \`.light\` is present in Light Mode:**  
> Markify uses \`@media (prefers-color-scheme: dark) { :root:not(.light) { ... } }\` as a system dark fallback. When switching your app to Light Mode, your theme provider **MUST add \`.light\`** (or toggle \`.light\`, \`!isDark\`) to prevent OS dark mode from forcing dark text onto light backgrounds.

### Recommended Theme Provider Implementation

\`\`\`tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark";

    const activeTheme = isDark ? "dark" : "light";
    setResolvedTheme(activeTheme);

    // Toggle both classes cleanly
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.setAttribute("data-theme", activeTheme);
  }, [theme]);

  return children;
};
\`\`\`

---

## 2. Code Block Theme Sync (\`hljsTheme\`)

Synchronize code syntax highlighting with your application theme by passing the \`hljsTheme\` prop:

\`\`\`tsx
import { Markify } from "@glitchoff/markify";

export function MarkdownViewer({ markdown, isDark }) {
  return (
    <Markify hljsTheme={isDark ? "dark" : "light"}>
      {markdown}
    </Markify>
  );
}
\`\`\`
`,
  },
  {
    id: 'layout-and-sizing',
    title: 'Layout & Sizing',
    file: 'layout-and-sizing.md',
    badge: 'Layout',
    content: `# Layout & Container Width Recommendations

Markify renders complex Markdown elements—including wide data tables with export buttons, code blocks with horizontal scrollbars, and zoomable/pannable Mermaid diagrams.

## 1. Parent Width Recommendation

> [!IMPORTANT]
> **We recommend wrapping \`<Markify>\` in a container with a defined width constraint.**  
> Without a parent width limit (e.g. \`max-w-4xl\` or \`max-width: 1000px\`), wide tables and diagrams may stretch past the viewport.

### Tailwind CSS Layout Example

\`\`\`tsx
export function PageLayout({ children }) {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {children}
      </div>
    </main>
  );
}
\`\`\`

### Standard CSS Layout Example

\`\`\`css
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
\`\`\`
`,
  },
  {
    id: 'diagrams-and-math',
    title: 'Diagrams & Math',
    file: 'diagrams-and-math.md',
    badge: 'Features',
    content: `# Diagrams & Math Support

Markify provides out-of-the-box support for **Mermaid diagrams** and **KaTeX LaTeX math equations**.

## 1. Mermaid Diagrams

Markify renders interactive Mermaid flowcharts, sequence diagrams, and class diagrams with built-in zoom, pan, fullscreen, and SVG/PNG/MMD download controls.

### Usage

\`\`\`markdown
\`\`\`mermaid
graph TD
    A[User] -->|Input| B[Process]
    B -->|Valid| C[Markify]
    C -->|Render| D[Output]
\`\`\`
\`\`\`

### Custom Configuration (\`mermaidConfig\`)

Pass custom Mermaid settings directly via the \`mermaidConfig\` prop:

\`\`\`tsx
<Markify
  mermaidConfig={{
    theme: "dark",
    fontFamily: "Inter, sans-serif",
    flowchart: { curve: "basis" },
  }}
>
  {content}
</Markify>
\`\`\`

---

## 2. KaTeX Math Equations

Markify uses KaTeX via \`remark-math\` and \`rehype-katex\`.

### Import KaTeX CSS
Include KaTeX stylesheet in your application layout:

\`\`\`tsx
import "katex/dist/katex.min.css";
\`\`\`

### Inline Math
Write inline equations wrapped in single dollar signs \`$\`:

\`\`\`markdown
Einstein's formula: $E = mc^2$
\`\`\`

### Block Math
Write standalone math blocks wrapped in double dollar signs \`$$\`:

\`\`\`markdown
$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi) e^{2\\pi i \\xi x} d\\xi
$$
\`\`\`
`,
  },
  {
    id: 'tables-and-callouts',
    title: 'Tables & Callouts',
    file: 'tables-and-callouts.md',
    badge: 'UI',
    content: `# Tables & Callouts

Markify includes styled GitHub-style callout alerts and interactive tables with export capabilities.

## 1. Callout Alerts

Use blockquotes with \`> [!NOTE]\`, \`> [!WARNING]\`, or \`> [!TIP]\` tags:

> [!NOTE]
> This is a helpful note blockquote alert.

> [!TIP]
> Use callouts to highlight important tips in AI responses.

> [!WARNING]
> Always validate user input before rendering Markdown.

---

## 2. Interactive Tables

Markify renders GFM tables with hover actions for copying table content as Markdown and downloading as CSV, TSV, or Markdown.

\`\`\`tsx
<Markify
  table={{
    showCopyButton: true,
    downloadFormats: ["csv", "tsv", "md"],
    scrollable: true,
  }}
>
  {markdownTable}
</Markify>
\`\`\`

| Feature | Supported | Export Formats |
|---|---|---|
| Markdown Parsing | ✅ | Markdown |
| Tables | ✅ | CSV / TSV / MD |
| Code Blocks | ✅ | Raw Code |
| Mermaid Diagrams | ✅ | SVG / PNG / MMD |
`,
  },
];

export function Docs({ hljsTheme }) {
  const [selectedDocId, setSelectedDocId] = useState('getting-started');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedDoc = DOCS_FILES.find(d => d.id === selectedDocId) || DOCS_FILES[0];

  return (
    <div className="w-full max-w-[80vw] lg:max-w-6xl mx-auto px-2">
      {/* Mobile Navigation Header & Menu */}
      <div className="block md:hidden mb-6">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-card shadow-sm text-xs font-semibold text-foreground"
          type="button"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-muted-foreground">📄 docs/</span>
            <span className="truncate">{selectedDoc.file}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>{mobileMenuOpen ? '✕' : '☰'} Menu</span>
          </div>
        </button>

        {mobileMenuOpen && (
          <div className="mt-2 rounded-xl border border-border bg-card p-2 shadow-lg animate-in fade-in duration-150">
            <nav className="flex flex-col gap-1">
              {DOCS_FILES.map(doc => {
                const active = doc.id === selectedDocId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    type="button"
                  >
                    <span>{doc.title}</span>
                    <span className="text-[10px] opacity-75 font-mono">{doc.badge}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar navigation (Desktop) */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-2 flex items-center justify-between">
              <span>Docs Navigation</span>
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                docs/*.md
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {DOCS_FILES.map(doc => {
                const active = doc.id === selectedDocId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                      active
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono opacity-60 text-[11px]">📄</span>
                      <span className="truncate">{doc.title}</span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        active
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {doc.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Centered Main Documentation Content (80% width container) */}
        <div className="flex-1 min-w-0 w-full">
          <div className="mb-4 hidden md:flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
            <span className="font-mono">docs/{selectedDoc.file}</span>
            <span className="text-[11px]">Rendered with Markify</span>
          </div>
          <Markify hljsTheme={hljsTheme}>{selectedDoc.content}</Markify>
        </div>
      </div>
    </div>
  );
}
