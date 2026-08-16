import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Markify } from '@glitchoff/markify';

const PAGE = `## Why Markify?

Everything below this headline is rendered by Markify — including this sentence.

## Features

- **Streaming-first** — Progressive reveal animation that keeps complex blocks intact while tokens stream in from your LLM.
- **Zero-config** — Built-in syntax highlighting, math (KaTeX), and interactive Mermaid diagrams out of the box.
- **Fast by design** — Static blocks are memoized and only the active streaming block re-renders per tick.
- **Themes built in** — Light, dark, and system modes with a single CSS import.
- **GFM complete** — Task lists, strikethrough, autolinks, tables with CSV/TSV/MD export, and more.

## Get started in seconds

\`\`\`bash
npm install @glitchoff/markify
\`\`\`

Then render streaming content in your chat UI:

\`\`\`jsx
import { Markify } from "@glitchoff/markify";

function Chat({ message }) {
  return (
    <Markify isStreaming={message.status === "streaming"}>
      {message.content}
    </Markify>
  );
}
\`\`\`

> [!TIP]
> Try the **Playground** tab to write and render markdown live, or browse the docs to go deeper.

## Feature deep-dive

> [!NOTE]
> **Interactive tables** — hover a rendered table to copy it as Markdown or download as CSV, TSV, or Markdown.

> [!WARNING]
> **Mermaid diagrams** — zoom, pan, fullscreen, and export your flowcharts to SVG, PNG, or MMD.

> [!TIP]
> **Math everywhere** — inline equations like $E = mc^2$ and full block equations render via KaTeX, e.g.

$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n
$$

## Rendered from markdown

\`\`\`mermaid
graph TD
    A[User] -->|streams tokens| B[Markify]
    B --> C[Render incrementally]
    C --> D[Tables]
    C --> E[Code Blocks]
    C --> F[Math]
    C --> G[Mermaid]
    D & E & F & G --> H[Beautiful output]
\`\`\`

## Feature comparison

| Capability | Markify | react-markdown | streamdown |
|------------|---------|----------------|------------|
| Streaming | ✅ | ❌ | ✅ |
| Syntax highlighting | ✅ | ❌ | ✅ |
| Math (KaTeX) | ✅ | ✅ | ✅ |
| Mermaid diagrams | ✅ | ❌ | ✅ |
| Interactive tables | ✅ | ❌ | ✅ |
| GitHub callouts | ✅ | ❌ | ❌ |

Built for AI-powered applications. Open source, free, and MIT licensed.
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
        <Markify hljsTheme={isDark ? 'dark' : 'light'}>{PAGE}</Markify>
      </div>
    </div>
  );
}