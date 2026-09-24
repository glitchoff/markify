# Callouts & Blockquotes

## Callouts

GitHub / Obsidian-style alerts. The marker is `> [!TYPE]` on its own line inside a blockquote (case-insensitive):

```markdown
> [!NOTE]
> A friendly note to keep things calm.
```

> [!NOTE]
> A friendly note to keep things calm.

### All types

```markdown
> [!TIP]
> A small hint that saves the day.
```

> [!TIP]
> A small hint that saves the day.

```markdown
> [!SUCCESS]
> Everything worked.
```

> [!SUCCESS]
> Everything worked.

```markdown
> [!IMPORTANT]
> Pay attention to this one.
```

> [!IMPORTANT]
> Pay attention to this one.

```markdown
> [!WARNING]
> Be careful here.
```

> [!WARNING]
> Be careful here.

```markdown
> [!CAUTION]
> This action cannot be undone.
```

> [!CAUTION]
> This action cannot be undone.

```markdown
> [!DANGER]
> This is dangerous.
```

> [!DANGER]
> This is dangerous.

```markdown
> [!INFO]
> Some context you might want.
```

> [!INFO]
> Some context you might want.

```markdown
> [!QUESTION]
> Why does this work?
```

> [!QUESTION]
> Why does this work?

```markdown
> [!TODO]
> Ship the thing.
```

> [!TODO]
> Ship the thing.

```markdown
> [!BUG]
> A known issue, tracked and visible.
```

> [!BUG]
> A known issue, tracked and visible.

```markdown
> [!EXAMPLE]
> Like this one.
```

> [!EXAMPLE]
> Like this one.

```markdown
> [!ABSTRACT]
> The big picture in a box.
```

> [!ABSTRACT]
> The big picture in a box.

```markdown
> [!FAILURE]
> Something didn't work.
```

> [!FAILURE]
> Something didn't work.

```markdown
> [!QUOTE]
> Words worth repeating.
```

> [!QUOTE]
> Words worth repeating.

All types: `NOTE`, `TIP`, `HINT`, `IMPORTANT`, `WARNING`, `CAUTION`, `ATTENTION`, `INFO`, `SUCCESS`, `QUESTION`, `ABSTRACT`, `TODO`, `FAILURE`, `DANGER`, `BUG`, `EXAMPLE`, `QUOTE`.

### Aliases

Obsidian aliases keep their own title and accent color, only the icon is shared:

| Alias | Behaves like |
|---|---|
| `HINT` | `TIP` |
| `ATTENTION` | `WARNING` |

## Anatomy

Each callout renders an icon, a bold title, and the body — accent-colored per type via `--markify-callout-*` tokens (see [theming](/docs/theming)). The container is a `markify-callout` card with a 4px left border and a tinted background.

### Nested content

Callout bodies can contain full markdown — lists, code, math, even images:

```markdown
> [!TIP]
> **Images are just Markdown**
>
> They can live inside callouts just like any other content.
>
> ![oreki houtarou](https://media1.tenor.com/m/1WSgGgRUjEMAAAAC/oreki-houtarou-hyouka.gif)
```

> [!TIP]
> **Images are just Markdown**
>
> They can live inside callouts just like any other content.
>
> ![oreki houtarou](https://media1.tenor.com/m/1WSgGgRUjEMAAAAC/oreki-houtarou-hyouka.gif)

Code inside callouts works the same way:

```markdown
> [!EXAMPLE]
> fenced code inside a callout:
>
> ```ts
> const ok = true;
> ```
```

> [!EXAMPLE]
> fenced code inside a callout:
>
> ```ts
> const ok = true;
> ```

## Plain blockquotes

A blockquote without the `[!TYPE]` marker renders as a simple styled quote:

```markdown
> A plain blockquote — left border, muted text, italic.
```

> This is a plain blockquote — left border, muted text, italic.
