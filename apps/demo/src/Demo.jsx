import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Markify } from '@glitchoff/markify';

const PAGE = `## See what Markify can render

Everything on this page, from this paragraph to the chess board at the bottom, is rendered by Markify. No component soup, no bespoke HTML, just Markdown.

> [!IMPORTANT]
> **Streaming-first**: static blocks are memoized, so only the active block re-renders as new tokens arrive.

---

## A quick taste of code

Syntax highlighting works out of the box, and language definitions load lazily only when you actually use them.

\`\`\`jsx
import { Markify } from "@glitchoff/markify";

export function Chat({ reply, generating }) {
  return (
    <Markify isStreaming={generating}>
      {reply}
    </Markify>
  );
}
\`\`\`

\`\`\`bash
pnpm add @glitchoff/markify
\`\`\`

---

## Diagrams, not just flowcharts

Mermaid renders directly from fenced blocks, with zoom, pan, fullscreen, and SVG/PNG export built in.

\`\`\`mermaid
flowchart LR
    A[User prompt] --> B[AI model]
    B --> C[Streaming markdown]
    C --> D[Markify]
    D --> E[Interactive UI]
\`\`\`

\`\`\`mermaid
pie title Where the weekend went
    "Sleeping" : 34
    "Outdoor time" : 22
    "Cooking & eating" : 16
    "Streaming" : 14
    "Errands" : 10
    "Scrolling" : 4
\`\`\`

\`\`\`mermaid
timeline
    title Road Trip: 3 Days, 2 Cities
    Day 1 : Drive to the coast : Sunset at the pier
    Day 2 : Hike the cliffs : Picnic lunch : Beach bonfire
    Day 3 : Brunch in town : Drive home
\`\`\`

---

## Math, inline and block

Inline math like $E = mc^2$ flows naturally inside a sentence, and standalone equations render beautifully.

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

---

## Callouts for every tone

Pick the right voice for the moment.

> [!NOTE]
> A friendly note to keep things calm.

> [!TIP]
> A small hint that saves the day.

> [!SUCCESS]
> Everything worked.

> [!CAUTION]
> This action cannot be undone.

> [!QUESTION]
> Why does this work?

> [!BUG]
> A known issue, tracked and visible.

---

## Tables that do more

Hover the table to copy it as Markdown, or export it as CSV, TSV, or MD.

| Capability | Markify | Plain Markdown |
| ---------- | ------- | -------------- |
| Streaming reveal | ✅ | ❌ |
| Mermaid + KaTeX | ✅ | ❌ |
| Interactive tables | ✅ | ❌ |
| Chess (PGN/FEN) | ✅ | ❌ |
| Lazy-loaded extras | ✅ | ❌ |

---

## Video embeds, opt-in

A YouTube URL becomes a player when you use image syntax; left as a link, it stays a link.

\`\`\`markdown
![Watch the video](https://www.youtube.com/watch?v=M5PbLfVGOQs)
\`\`\`

![Watch the video](https://www.youtube.com/watch?v=M5PbLfVGOQs)

---

## Chess from PGN

\`\`\`pgn
[Event "A Night at the Opera"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5
6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5
11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6
15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0
\`\`\`

---

## One renderer. Built for AI.


Give your AI interface a Markdown renderer that understands the output it is actually going to receive. Open source. MIT licensed. Built for React.

[Get started →](/docs/getting-started)

[Try the Playground →](/playground)
`;

export function Demo({ isDark }) {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-80 w-80 rounded-full bg-secondary/40 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-4xl px-6">
        {/* Landing hero header */}
        <div className="mb-6 flex flex-col items-center gap-6 pt-10 text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            Streaming Markdown for React
          </span>

          <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Opinionated Markdown, batteries included
          </h1>
          <p className="max-w-2xl text-balance text-base italic leading-relaxed text-muted-foreground sm:text-lg">
            A streaming-first Markdown renderer for React, with{' '}
            <strong className="font-semibold text-foreground">syntax highlighting</strong>,{' '}
            <strong className="font-semibold text-foreground">math</strong>,{' '}
            <strong className="font-semibold text-foreground">Mermaid diagrams</strong>,{' '}
            <strong className="font-semibold text-foreground">tables</strong>,{' '}
            <strong className="font-semibold text-foreground">callouts</strong>, and{' '}
            <strong className="font-semibold text-foreground">chess</strong> built in.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/playground"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Open playground
            </Link>
          </div>
        </div>

        {/* The landing page body, rendered by Markify */}
        <Markify hljsTheme={isDark ? 'dark' : 'light'} chessEnabled youtubeEnabled mermaidConfig={{ showBackground: false }}>{PAGE}</Markify>
      </div>
    </div>
  );
}