# Callouts & Blockquotes

## Callouts

GitHub-style blockquote callouts in 17 tones. The marker is `> [!TYPE]` on its own line:

```markdown
> [!NOTE]
> A friendly note to keep things calm.
```

> [!NOTE]
> A friendly note to keep things calm.

> [!TIP]
> A small hint that saves the day.

> [!SUCCESS]
> Everything worked.

> [!IMPORTANT]
> Pay attention to this one.

> [!WARNING]
> Be careful here.

> [!CAUTION]
> This action cannot be undone.

> [!DANGER]
> This is dangerous.

> [!INFO]
> Some context you might want.

> [!QUESTION]
> Why does this work?

> [!TODO]
> Ship the thing.

> [!BUG]
> A known issue, tracked and visible.

> [!EXAMPLE]
> Like this one.

> [!ABSTRACT]
> The big picture in a box.

> [!FAILURE]
> Something didn't work.

> [!QUOTE]
> Words worth repeating.

All types: `NOTE`, `TIP`, `HINT`, `IMPORTANT`, `WARNING`, `CAUTION`, `ATTENTION`, `INFO`, `SUCCESS`, `QUESTION`, `ABSTRACT`, `TODO`, `FAILURE`, `DANGER`, `BUG`, `EXAMPLE`, `QUOTE`.

## Anatomy

Each callout renders an icon, a bold title, and the body — accent-colored per type via `--markify-callout-*` tokens (see [theming](/docs/theming)). The container is a `markify-callout` card with a 4px left border and a tinted background.

Callout bodies can contain full markdown — lists, code, math, even other callouts.

## Plain blockquotes

A blockquote without the marker renders as a simple styled quote:

> This is a plain blockquote — left border, muted text, italic.
