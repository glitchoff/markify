# Tables

Markify renders GFM tables with hover actions for copying table content as Markdown and downloading as CSV, TSV, or Markdown.

## 1. Table Options Configuration (`table`)

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

| Option | Type | Default | Description |
|---|---|---|---|
| `showCopyButton` | `boolean` | `true` | Show the "copy as Markdown" button on hover. |
| `downloadFormats` | `("csv"\|"tsv"\|"md")[]` | `[]` | Which export buttons to show. |
| `scrollable` | `boolean` | `true` | Wrap wide tables in a horizontal scroll container. |

## 2. Example Table

| Feature | Supported | Export Formats |
|---|---|---|
| Markdown Parsing | ✅ | Markdown |
| Tables | ✅ | CSV / TSV / MD |
| Code Blocks | ✅ | Raw Code |
| Mermaid Diagrams | ✅ | SVG / PNG / MMD |