import { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { Markify } from '@glitchoff/markify';

const SAMPLE = `# Play with Markify

Edit the markdown on the left and watch it render live on the right.

## Formatting

- **Bold**, *italic*, and \`inline code\`
- Math: $E = mc^2$

> [!TIP]
> Hit **Start streaming** to watch it reveal progressively, just like an AI response.

\`\`\`tsx
import { Markify } from "@glitchoff/markify";
\`\`\`

\`\`\`mermaid
graph LR
    A[Edit] --> B[Markify]
    B --> C[Output]
\`\`\`

\`\`\`pgn
[Event "Italian Game"]
[White "White"]
[Black "Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 Be7 5. O-O O-O
6. Re1 d6 7. c3 Na5 8. Bb5 c6 9. Ba4 Nc4 10. b3 Nb6
\`\`\`

| Feature | Works |
|---|---|
| Tables | ✅ |
| Callouts | ✅ |
| Math | ✅ |

## Video embeds

![lofi girl live stream](https://www.youtube.com/watch?v=X4VbdwhkE10)
`;

export function Playground({ isDark }) {
  const [source, setSource] = useState(SAMPLE);
  const [streaming, setStreaming] = useState(false);
  const [display, setDisplay] = useState(SAMPLE);
  const [runId, setRunId] = useState(0);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!streaming) return;
    let i = 0;
    setDisplay('');
    const id = setInterval(() => {
      i += Math.random() * 4 + 1;
      if (i >= source.length) {
        setDisplay(source);
        clearInterval(id);
        setStreaming(false);
      } else {
        setDisplay(source.slice(0, i));
      }
    }, 16);
    return () => clearInterval(id);
  }, [streaming, runId, source]);

  const startStream = () => {
    setStreaming(true);
    setRunId(r => r + 1);
  };
  const stopStream = () => {
    setStreaming(false);
    setDisplay(source);
  };
  const onEditorChange = e => {
    const next = e.target.value;
    setSource(next);
    setDisplay(streaming ? next : next);
    if (streaming) setRunId(r => r + 1);
  };

  const handleEditorKeyDown = e => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = editorRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const end = el.selectionEnd;

    let next;
    let nextStart = s;
    let nextEnd = end;

    if (e.shiftKey) {
      const lineStart = source.lastIndexOf('\n', s - 1) + 1;
      const lineEnd = source.indexOf('\n', end) === -1 ? source.length : source.indexOf('\n', end);
      const block = source.slice(lineStart, lineEnd);
      const dedented = block.replace(/^ {1,2}/gm, '');
      next = source.slice(0, lineStart) + dedented + source.slice(lineEnd);
      nextStart = Math.max(lineStart, s - (block.length - dedented.length));
      nextEnd = Math.max(lineStart, end - (block.length - dedented.length));
    } else {
      next = source.slice(0, s) + '  ' + source.slice(end);
      nextStart = s + 2;
      nextEnd = s + 2;
    }

    setSource(next);
    setDisplay(next);
    if (streaming) setRunId(r => r + 1);

    requestAnimationFrame(() => {
      el.selectionStart = nextStart;
      el.selectionEnd = nextEnd;
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4">
      {/* Header + toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
          <p className="text-sm text-muted-foreground">
            Write markdown on the left, see it rendered by Markify on the right.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {streaming ? (
            <button
              onClick={stopStream}
              title="Stop"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
              type="button"
            >
              <Square className="size-4" />
            </button>
          ) : (
            <button
              onClick={startStream}
              title="Start streaming"
              className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              type="button"
            >
              <Play className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
        {/* Editor */}
        <div className="flex min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">input.md</span>
            <span className="text-[10px] text-muted-foreground">{source.length} chars</span>
          </div>
          <textarea
            ref={editorRef}
            value={source}
            onChange={onEditorChange}
            onKeyDown={handleEditorKeyDown}
            spellCheck={false}
            className="h-full min-h-[26rem] w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
            placeholder="Type markdown here…"
          />
        </div>

        {/* Preview */}
        <div className="flex min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">preview</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span
                className={`h-1.5 w-1.5 rounded-full ${streaming ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`}
              />
              {streaming ? 'streaming…' : 'static'}
            </span>
          </div>
          <div className="min-h-[26rem] overflow-auto p-4">
            <Markify isStreaming={streaming} hljsTheme={isDark ? 'dark' : 'light'} chessEnabled youtubeEnabled>
              {display}
            </Markify>
          </div>
        </div>
      </div>
    </div>
  );
}