import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Markify } from 'markify';
import {
  Play,
  Pause,
  RotateCcw,
  Moon,
  Sun,
  Zap,
  Code2,
  Table2,
  GitBranch,
  Sigma,
  Sparkles,
  Gauge,
  RefreshCw,
} from 'lucide-react';

const STREAMING_DOC = `# Markify in action

Meet **Markify** — a high-performance markdown renderer built for *streaming* AI content. Watch it render live below.

## Why it's fast

> [!TIP]
> Only the final block streams. Completed blocks render statically, so heavy content stays smooth.

| Feature | Markify | react-markdown | streamdown |
| --- | --- | --- | --- |
| Streaming reveal | ✅ | ❌ | ✅ |
| Syntax highlighting | ✅ | ✅ | ✅ |
| KaTeX math | ✅ | ✅ | ✅ |
| Mermaid diagrams | ✅ | ❌ | ✅ |
| Table copy / download | ✅ | ❌ | ❌ |
| Web Worker highlighting | ✅ | ❌ | ❌ |
| Bundle size | ~15KB | ~40KB | ~25KB |

## Streaming math

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

Inline math like $E = mc^2$ works while streaming too.

## A live diagram

\`\`\`mermaid
flowchart LR
    U[User] -->|prompt| AI[AI Model]
    AI -->|markdown| MK[Markify]
    MK -->|streams| UI[UI]
    UI --> U
\`\`\`

## Code that shines

\`\`\`javascript
import { Markify } from 'markify';

export function Chat({ message }) {
  return (
    <Markify isStreaming={message.status === 'streaming'}>
      {message.content}
    </Markify>
  );
}
\`\`\`

## Notes

> [!NOTE]
> Every code block ships with copy and wrap controls.

> [!WARNING]
> Always sanitize untrusted AI output before rendering.

Done — that's Markify from tip to tail. 🎉
`;

const STATIC_DOC = `# All features, at a glance

## Syntax highlighting

\`\`\`python
def stream_response(prompt):
    for token in model.generate(prompt):
        yield token
\`\`\`

## Tables you can take with you

| Format | Ext | MIME |
| --- | --- | --- |
| CSV | .csv | text/csv |
| TSV | .tsv | text/tab-separated-values |
| Markdown | .md | text/markdown |

## Diagrams

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant M as Markify
    U->>M: stream markdown
    M-->>U: rendered blocks
\`\`\`

> [!TIP]
> Hover a table to copy it as markdown or download as CSV/TSV/MD.
`;

// In-house component overrides — Markify merges these on top of its defaults,
// so you can restyle any element without losing built-in behavior.
const customComponents = {
  a: memo(({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-emerald-400"
      {...props}
    >
      {children}
    </a>
  )),
  blockquote: memo(({ children, ...props }) => (
    <blockquote className="my-4 rounded-r-lg border-l-4 border-primary/60 bg-primary/5 px-4 py-3 text-muted-foreground" {...props}>
      {children}
    </blockquote>
  )),
};

export default function App() {
  const [mode, setMode] = useState('stream');
  const [theme, setTheme] = useState('dark');
  const [worker, setWorker] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [content, setContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const docRef = useRef(STREAMING_DOC);
  const rafRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i < docRef.current.length) {
        setContent(docRef.current.slice(0, i + 1));
        i += Math.random() * 4 + 1;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsStreaming(false);
      }
    };
    if (isStreaming && rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isStreaming]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 500);
    return () => clearInterval(interval);
  }, []);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setContent('');
    setIsStreaming(true);
  }, []);

  const changeMode = useCallback((m) => {
    setMode(m);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    docRef.current = m === 'stream' ? STREAMING_DOC : STATIC_DOC;
    setContent(m === 'stream' ? '' : STATIC_DOC);
    setIsStreaming(m === 'stream');
  }, []);

  const markdown = mode === 'stream' ? content : STATIC_DOC;
  const showCursorBlock = isStreaming && showCursor;

  const navItems = [
    { id: 'features', label: 'Features' },
    { id: 'demo', label: 'Demo' },
    { id: 'get-started', label: 'Install' },
  ];

  const features = [
    { icon: Zap, t: 'Streaming', d: 'Adaptive reveal that catches up fast', color: '#22c55e' },
    { icon: Code2, t: 'Highlighting', d: '20+ languages, copy & wrap', color: '#f59e0b' },
    { icon: Sigma, t: 'KaTeX math', d: 'Inline and block equations', color: '#3b82f6' },
    { icon: GitBranch, t: 'Mermaid', d: 'Zoom, pan, fullscreen, download', color: '#ec4899' },
    { icon: Table2, t: 'Tables', d: 'Copy or download as CSV/TSV/MD', color: '#8b5cf6' },
    { icon: Gauge, t: 'Worker offload', d: 'Highlight off the main thread', color: '#06b6d4' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">M</div>
            <span className="text-lg font-semibold">Markify</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            {navItems.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="transition-colors hover:text-foreground">{n.label}</a>
            ))}
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-24 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> Built for AI streaming
          </span>
          <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
            Markdown for <span className="text-primary">AI Streaming</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A fast, feature-packed markdown renderer for React — smooth streaming, syntax
            highlighting, KaTeX math, Mermaid diagrams, and exportable tables.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#demo" className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90">Live demo</a>
            <a href="#get-started" className="rounded-lg border border-border bg-card px-5 py-2.5 font-medium transition-colors hover:bg-muted">Install</a>
            <code className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">npm i markify</code>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold">Everything you need</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.t} className="rounded-xl border border-border bg-background p-6 transition-colors hover:border-muted-foreground/30">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: `${f.color}1a`, color: f.color }}>
                  <f.icon className="size-5" />
                </div>
                <h3 className="mb-1 font-semibold">{f.t}</h3>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold">Live demo</h2>
          <p className="mt-2 text-center text-muted-foreground">Stream it, highlight it, export it.</p>

          {/* Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="flex overflow-hidden rounded-lg border border-border">
              {(['stream', 'static']).map((m) => (
                <button
                  key={m}
                  onClick={() => changeMode(m)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                >
                  {m === 'stream' ? 'Streaming' : 'Static'}
                </button>
              ))}
            </div>

            <div className="flex overflow-hidden rounded-lg border border-border">
              <button onClick={() => setWorker((w) => !w)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-card text-muted-foreground hover:text-foreground">
                <RefreshCw className={`size-4 transition-opacity ${worker ? 'text-primary' : 'opacity-40'}`} />
                Worker
              </button>
            </div>

            {mode === 'stream' && (
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button onClick={() => setIsStreaming((s) => !s)} className="flex items-center gap-2 bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  {isStreaming ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {isStreaming ? 'Pause' : 'Resume'}
                </button>
                <button onClick={restart} className="flex items-center gap-2 border-l border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  <RotateCcw className="size-4" /> Restart
                </button>
              </div>
            )}
          </div>

          {/* Markdown window */}
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">markify demo</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">{worker ? 'worker' : 'main'}</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="mx-auto max-w-3xl">
                <Markify
                  isStreaming={isStreaming}
                  hljsTheme={theme}
                  hljsThemeBg
                  codeBlockWorker={worker}
                  table={{ downloadFormats: ['csv', 'tsv', 'md'] }}
                  components={customComponents}
                  className="size-full text-[17px] leading-[1.9] font-normal [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  fontFamily='-apple-system-body, ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
                >
                  {markdown}
                </Markify>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get started */}
      <section id="get-started" className="border-t border-border bg-card/40 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold">Get started</h2>
          <p className="mt-2 text-muted-foreground">One dependency, drop it in.</p>
          <div className="mt-6 overflow-hidden rounded-lg border border-border bg-background text-left">
            <pre className="overflow-x-auto p-4 text-sm text-foreground"><code>{`import { Markify } from 'markify';

<Markify isStreaming>
  {\`# Hello, world\`}
</Markify>`}</code></pre>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Markify — <a href="https://github.com/glitchoff/markify" className="text-primary hover:underline">github.com/glitchoff/markify</a></p>
      </footer>
    </div>
  );
}