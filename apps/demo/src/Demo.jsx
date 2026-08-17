import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Markify } from '@glitchoff/markify';

const PAGE = `## See what Markify can render

Everything on this page is rendered by Markify — including the code, diagrams, tables, math, and chess below.

---

## Built for AI streaming

**Markdown that renders while the model is still thinking.**

Markify is designed around streaming content. Completed blocks stay stable while the active block updates as new tokens arrive.

\`\`\`jsx
import { Markify } from "@glitchoff/markify";

<Markify isStreaming={true}>
  {streamingContent}
</Markify>
\`\`\`

> [!NOTE]
> **Streaming-first** — static blocks are memoized; only the active block re-renders per token.

---

## Everything you need, out of the box

**One renderer for the rich content AI applications actually produce.**

> [!WARNING]
> **Zero-config** — syntax highlighting, math (KaTeX), and Mermaid diagrams work out of the box.

> [!TIP]
> **GFM complete** — tables with CSV/TSV/MD export, callouts, and Chess (PGN/FEN) blocks are supported too.

---

## From Markdown to rich UI

**A single Markdown stream can become much more than formatted text.**

\`\`\`mermaid
flowchart LR
    A[Markdown] --> B[Markify]
    B --> C[Code blocks]
    B --> D[Mermaid]
    B --> E[Math]
    B --> F[Tables]
    B --> G[Chess]

    C & D & E & F & G --> H[Rendered output]
\`\`\`

---

## Beautiful diagrams, built in

**Mermaid diagrams render directly from your Markdown.**

\`\`\`mermaid
flowchart TD
    A[User prompt] --> B[AI model]
    B --> C[Streaming response]
    C --> D[Markify]
    D --> E[Interactive UI]
\`\`\`

Zoom, pan, fullscreen, and export your diagrams without leaving the page.

---

## Lightweight where it matters

**Heavy features are lazy-loaded so the core stays focused.**

\`\`\`mermaid
pie showData
    title Bundle composition
    "Core" : 45
    "Mermaid (lazy)" : 30
    "hljs (lazy)" : 15
    "Chess (lazy)" : 10
\`\`\`

The goal isn't to ship everything everywhere — it's to load rich functionality when you actually need it.

---

## Chess, rendered from PGN

**Because AI applications don't only generate prose.**

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

PGN and FEN blocks turn chess notation into an interactive board.

---

## Math without leaving Markdown

**From inline equations to full mathematical expressions.**

Inline math: $E = mc^2$

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Powered by KaTeX and rendered directly inside your Markdown stream.

---

## Tables that do more

**Tables become interactive instead of being the end of the road.**

| Feature | Markify | react-markdown | streamdown |
|---------|---------|----------------|-----------|
| Streaming | ✅ | ❌ | ✅ |
| Syntax highlighting | ✅ | ❌ | ✅ |
| Mermaid diagrams | ✅ | ❌ | ✅ |
| Interactive tables | ✅ | ❌ | ✅ |
| Chess (PGN/FEN) | ✅ | ❌ | ❌ |
| Lazy loading | ✅ | ❌ | ❌ |

Hover a table to copy it as Markdown or export it as CSV, TSV, or Markdown.

---

## One renderer. Built for AI.

**Give your AI interface a Markdown renderer that understands the output it's actually going to receive.**

\`\`\`bash
npm install @glitchoff/markify
\`\`\`

Open source. MIT licensed. Built for React.

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
        <div className="mb-6 flex flex-col items-center gap-5 pt-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Markdown for{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Streaming
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A high-performance Markdown renderer for React that reveals AI output
            token-by-token — with syntax highlighting, math, and Mermaid diagrams built in.
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
        <Markify hljsTheme={isDark ? 'dark' : 'light'} chessEnabled mermaidConfig={{ showBackground: false }}>{PAGE}</Markify>
      </div>
    </div>
  );
}