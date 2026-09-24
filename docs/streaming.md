# Streaming Guide

Markify is built for AI-generated markdown that arrives token by token.

```tsx
<Markify isStreaming={generating}>{reply}</Markify>
```

## What happens while streaming

1. **Repair** — the partial markdown is repaired with `remend`: unclosed fences, bold/italic, links, and lists are temporarily closed so nothing flickers or renders broken mid-stream. Math delimiters are deliberately left untouched (repairing them mid-stream produces invalid LaTeX); remark-math renders them correctly the moment the closing delimiter arrives.
2. **Block splitting** — content is split into top-level blocks (fence-aware, so code blocks containing blank lines stay intact). Every completed block is **memoized**: only the active tail re-renders as tokens arrive. For long AI responses this keeps per-token work O(1) instead of O(document).
3. **Normalization** — single-line `$$…$$` display math is rewritten to the centered multi-line form.

When the stream ends (`isStreaming={false}`), everything renders statically and memoization keys stabilize.

## Data attributes

The root wrapper gets `data-streaming` while streaming — useful for styling in-flight states (e.g. a blinking cursor):

```css
.markify-root[data-streaming] { /* … */ }
```

## Streaming behaviors per feature

| Feature | While streaming |
|---|---|
| Code blocks | render normally (repair keeps fences closed) |
| Math | delimiters untouched; partial equations complete naturally |
| Mermaid | renders when the block completes |
| Chess (PGN/FEN) | "waiting" state until the full game arrives |
| YouTube embeds | "Watch on YouTube" link instead of iframe |
| Tweets | "View tweet on X" link until content completes |

## Tips

- Pass the same `children` string on every render — Markify handles the diffing; don't pre-truncate the markdown yourself.
- Keep the component mounted between tokens; it's designed for incremental updates, not remounts.
- For non-AI use, omit `isStreaming` entirely — static rendering skips the repair step.
