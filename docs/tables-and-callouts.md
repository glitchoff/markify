# Tables & Callouts

Markify includes styled GitHub-style callout alerts and interactive tables with export capabilities.

## 1. Callout Alerts

Use blockquotes with `> [!NOTE]`, `> [!WARNING]`, or `> [!TIP]` tags:

> [!NOTE]
> This is a helpful note blockquote alert.

> [!TIP]
> Use callouts to highlight important tips in AI responses.

> [!WARNING]
> Always validate user input before rendering Markdown.

### Markdown Syntax
```markdown
> [!NOTE]
> This is a note alert.

> [!TIP]
> This is a tip alert.

> [!WARNING]
> This is a warning alert.
```

---

## 2. Interactive Tables

Markify renders GFM tables with hover actions for copying table content as Markdown and downloading as CSV, TSV, or Markdown.

### Table Options Configuration (`table`)

```tsx
<Markify
  table={{
    showCopyButton: true,
    downloadFormats: ["csv", "tsv", "md"],
    scrollable: true,
  }}
>
  {markdownTable}
</Markify>
```

### Example Table

| Feature | Supported | Export Formats |
|---|---|---|
| Markdown Parsing | ✅ | Markdown |
| Tables | ✅ | CSV / TSV / MD |
| Code Blocks | ✅ | Raw Code |
| Mermaid Diagrams | ✅ | SVG / PNG / MMD |
