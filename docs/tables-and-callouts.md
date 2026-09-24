# Tables

Tables render in a card with hover actions.

| Capability | Markify | Plain Markdown |
| ---------- | ------- | -------------- |
| Copy as Markdown | ✅ | ❌ |
| CSV / TSV / MD export | ✅ | ❌ |
| Sticky styling, row hover | ✅ | ❌ |
| Horizontal scroll | ✅ | ❌ |

## Actions

Hovering the table reveals the action bar (top-right):

- **Copy** — the table serialized back into GitHub-flavored Markdown
- **Download** — as `CSV`, `TSV`, or `MD` per `table.downloadFormats`

## Configuration

```ts
markifyConfig.table = {
  showCopyButton: true,
  downloadFormats: ["csv", "tsv", "md"],  // or [] to disable downloads
  scrollable: true,                        // horizontal scroll for wide tables
};
```

## Structure

`thead` gets a muted header row; `tbody` rows divide cleanly and highlight on hover; cells pad generously with `last:border-r-0` so the card border stays crisp.
