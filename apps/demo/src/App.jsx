import { useState, useEffect } from 'react';
import { Markify } from '@glitchoff/markify';
import 'katex/dist/katex.min.css';

const PAGE = `# Markify — Markdown for AI Streaming

A high-performance markdown renderer designed for **streaming content** from AI models.

## Features

- **Streaming** — Smooth character-by-character reveal with adaptive speed
- **Syntax highlighting** — Built-in code blocks with copy, wrap, and collapse
- **Math support** — LaTeX equations via KaTeX: $E = mc^2$
- **Mermaid diagrams** — Flowcharts and sequence diagrams
- **Tables** — Copy-as-markdown and CSV/TSV/MD download
- **Callouts** — GitHub-style \[!NOTE\], \[!WARNING\], and \[!TIP\] alerts
- **GFM** — Task lists, strikethrough, autolinks, and more

## Usage

\`\`\`javascript
import { Markify } from '@glitchoff/markify';

function Chat({ message }) {
  return (
    <Markify isStreaming={message.status === 'streaming'}>
      {message.content}
    </Markify>
  );
}
\`\`\`

Install it:

\`\`\`bash
npm install @glitchoff/markify
\`\`\`

## Math

Inline math: $\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$

Block math:

$$
f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n
$$

## Feature Comparison

| Feature | Markify | react-markdown | streamdown |
|---------|---------|----------------|------------|
| Streaming | ✅ | ❌ | ✅ |
| Syntax HL | ✅ | ❌ | ✅ |
| Math | ✅ | ✅ | ✅ |
| Mermaid | ✅ | ❌ | ✅ |
| Tables | ✅ | ❌ | ✅ |
| Callouts | ✅ | ❌ | ❌ |

## Callouts

> [!TIP]
> Use callouts to highlight helpful tips in your AI responses.

> [!WARNING]
> Always validate user input before rendering markdown.

> [!NOTE]
> Built-in math and mermaid support means zero extra configuration.

## Mermaid Diagram

\`\`\`mermaid
graph TD
    A[User] -->|types| B[Input]
    B --> C{Valid?}
    C -->|yes| D[Process]
    C -->|no| E[Show Error]
    D --> F[AI Model]
    F --> G[Response]
    G --> H[Markify]
    H --> I[Rendered]
\`\`\`

## Task List

- [x] Streaming support
- [x] Syntax highlighting
- [x] Code copy button
- [x] Math equations
- [x] Mermaid diagrams
- [x] Tables with export
- [ ] World domination

## Links

Check out [Markify on GitHub](https://github.com/glitchoff/markify).

Use \`npm install @glitchoff/markify\` to get started.

---

Built for AI-powered applications. Open source and free to use.
`;

export default function App() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    let i = 0;
    setContent('');
    setIsStreaming(true);
    setShowCursor(true);

    const interval = setInterval(() => {
      if (i < PAGE.length) {
        setContent(PAGE.slice(0, i + 1));
        i += Math.random() * 4 + 1;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [replayKey]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => setShowCursor(c => !c), 500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const displayedContent = isStreaming && showCursor ? `${content}▌` : content;
  const replay = () => setReplayKey(k => k + 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
              M
            </div>
            <span className="text-lg font-semibold">Markify</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/glitchoff/markify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <button
              onClick={replay}
              className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              type="button"
            >
              Replay
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Markify isStreaming={isStreaming}>{displayedContent}</Markify>
      </main>
    </div>
  );
}
