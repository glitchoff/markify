import { useState, useEffect, useRef, useMemo } from 'react';
import { Markify } from 'markify';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const DEMO = `# Welcome to Markify

A high-performance markdown renderer designed for **streaming content** from AI models.

## Features

- **Streaming** — Smooth character-by-character reveal with adaptive speed
- **Syntax highlighting** — 20+ languages with copy buttons
- **Math support** — LaTeX equations via KaTeX: $E = mc^2$
- **Mermaid diagrams** — Flowcharts and sequence diagrams
- **Lazy images** — Load on scroll with fade-in
- **Customizable** — Override any component or add plugins
- **GFM** — Tables, task lists, strikethrough, autolinks

## Code Example

\`\`\`javascript
import { Markify } from 'markify';

function Chat({ message }) {
  return (
    <Markify isStreaming={message.status === 'streaming'}>
      {message.content}
    </Markify>
  );
}
\`\`\`

## Math

Inline math: $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$

Block math:

$$
f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n
$$

## Tables

| Feature | Markify | react-markdown | streamdown |
|---------|---------|----------------|------------|
| Streaming | ✅ | ❌ | ✅ |
| Syntax HL | ✅ | ❌ | ✅ |
| Math | ✅ | ✅ | ✅ |
| Mermaid | ✅ | ❌ | ✅ |
| Customizable | ✅ | ✅ | ✅ |
| Bundle size | ~15KB | ~40KB | ~25KB |

## Callouts

> [!TIP]
> Use GitHub-style callouts for notes, warnings, and tips!

> [!WARNING]
> Always validate user input before rendering markdown.

> [!NOTE]
> This is a note callout example.

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

## Task Lists

- [x] Streaming support
- [x] Syntax highlighting
- [x] Code copy button
- [ ] Live preview button
- [x] Math equations
- [x] Tables

## Links & Inline Code

Check out [Markify on GitHub](https://github.com/glitchoff/markify).

Use \`npm install markify\` to get started.

---

Built for AI-powered applications. Open source and free to use.
`;

export default function App() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const ref = useRef(DEMO);

  const plugins = useMemo(() => ({
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  }), []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < ref.current.length) {
        setContent(ref.current.slice(0, i + 1));
        i += Math.random() * 4 + 1;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <header style={{ borderBottom: '1px solid #27272a', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 32, background: '#22c55e', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>M</div>
            <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>Markify</span>
          </div>
          <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#a1a1aa' }}>
            <a href="#features" style={{ color: '#a1a1aa' }}>Features</a>
            <a href="#demo" style={{ color: '#a1a1aa' }}>Demo</a>
            <a href="https://github.com/glitchoff/markify" style={{ color: '#a1a1aa' }}>GitHub</a>
          </nav>
        </div>
      </header>

      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.1 }}>
            Markdown for<br /><span style={{ color: '#22c55e' }}>AI Streaming</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', marginBottom: '2rem' }}>
            High-performance markdown renderer for streaming AI content.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#demo" style={{ padding: '0.75rem 1.5rem', background: '#22c55e', color: '#000', fontWeight: 500, borderRadius: 8 }}>See Demo</a>
            <a href="https://github.com/glitchoff/markify" style={{ padding: '0.75rem 1.5rem', background: '#27272a', fontWeight: 500, borderRadius: 8 }}>GitHub</a>
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '4rem 2rem', borderTop: '1px solid #27272a' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>Everything you need</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { t: 'Streaming', d: 'Smooth character reveal with adaptive speed' },
              { t: 'Syntax Highlighting', d: '20+ languages with copy buttons' },
              { t: 'Math Support', d: 'LaTeX equations via KaTeX' },
              { t: 'Mermaid Diagrams', d: 'Flowcharts and sequence diagrams' },
              { t: 'Lazy Images', d: 'Load on scroll with fade-in' },
              { t: 'Customizable', d: 'Override components or add plugins' },
            ].map(f => (
              <div key={f.t} style={{ padding: '1.5rem', background: '#18181b', borderRadius: 12, border: '1px solid #27272a' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#22c55e' }}>{f.t}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.875rem', margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" style={{ padding: '4rem 2rem', borderTop: '1px solid #27272a' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>Live Demo</h2>
          <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '2rem' }}>Watch streaming in action</p>
          <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid #27272a', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#71717a' }}>markify demo</span>
            </div>
            <div style={{ padding: '1rem', minHeight: 500 }}>
              <Markify isStreaming={isStreaming}>
                {content}
                {isStreaming && showCursor && <span style={{ display: 'inline-block', width: 2, height: '1.25rem', background: '#22c55e', marginLeft: 2, verticalAlign: 'middle' }} />}
              </Markify>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', borderTop: '1px solid #27272a' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Get started</h2>
          <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #27272a', textAlign: 'left' }}>
            <pre style={{ margin: 0, padding: '1rem', overflow: 'auto', fontSize: '0.875rem' }}>
              <code style={{ color: '#a1a1aa' }}>npm install markify</code>
            </pre>
          </div>
        </div>
      </section>

      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid #27272a', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>
        <p>© 2026 Markify — <a href="https://github.com/glitchoff" style={{ color: '#22c55e' }}>glitchoff</a></p>
      </footer>
    </div>
  );
}
