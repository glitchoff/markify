# Layout & Container Width Recommendations

Markify renders complex Markdown elements—including wide data tables with export buttons, code blocks with horizontal scrollbars, and zoomable/pannable Mermaid diagrams.

## 1. Parent Width Recommendation

> [!IMPORTANT]
> **We recommend wrapping `<Markify>` in a container with a defined width constraint.**  
> Without a parent width limit (e.g. `max-w-4xl` or `max-width: 1000px`), wide tables and diagrams may stretch past the viewport.

### Tailwind CSS Layout Example

```tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        {children}
      </div>
    </main>
  );
}
```

### Standard CSS Layout Example

```css
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

---

## 2. Responsive Behavior

Markify handles responsive scaling automatically:
- **Code Blocks**: Auto-collapse long code snippets (>5 lines) with expand/collapse buttons.
- **Tables**: Horizontal scroll wrapper prevents layout breakage on small mobile viewports.
- **Mermaid Diagrams**: Fullscreen toggle, zoom in/out, and click-and-drag panning.
