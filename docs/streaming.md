# Streaming Guide

Markify is purpose-built for rendering **token-by-token streaming output** from LLMs, such as ChatGPT or Claude responses. It reveals markdown progressively while keeping complex blocks (tables, code, mermaid, math) intact as they stream in.

## 1. The `isStreaming` Prop

Set `isStreaming` to `true` while your content is still being received, then flip it to `false` once the stream finishes:

```tsx
import { useState } from "react";
import { Markify } from "@glitchoff/markify";

export function ChatMessage({ text, status }) {
  return (
    <Markify isStreaming={status === "streaming"}>
      {text}
    </Markify>
  );
}
```

> [!NOTE]
> While `isStreaming` is `true`, Markify uses a *reveal* animation (via `remend`) instead of rendering the raw partial markdown. This avoids broken tables, half-open code fences, and partially-rendered mermaid diagrams mid-stream.

## 2. Revealing Raw Partial Markdown

If you prefer to render the **raw** partial markdown as it arrives (without the reveal animation), render your own text node and rely on Markify only when the stream is complete:

```tsx
{isStreaming ? (
  <div className="whitespace-pre-wrap">{text}</div>
) : (
  <Markify>{text}</Markify>
)}
```

## 3. Using the `useStreamingReveal` Hook Directly

The reveal logic is also exposed as a standalone hook, so you can reuse it outside `<Markify>`:

```tsx
import { useStreamingReveal } from "@glitchoff/markify";

function StreamingText({ content, isStreaming }) {
  const revealed = useStreamingReveal(content, isStreaming);
  return <span>{revealed}</span>;
}
```

`useStreamingReveal(content, isStreaming)` returns `content` unchanged when not streaming, and the reveal-rendered value when streaming.

## 4. Performance Notes

- **Static blocks are memoized** — non-streaming blocks are wrapped in `React.memo` and keyed by content hash, so unchanged blocks are not re-rendered on every token.
- **Block splitting** — streaming content is split into logical blocks (paragraphs, code fences, math) so only the *last* active block re-renders per tick.
- **Web Worker highlighting (optional)** — pass `codeBlockWorker` to offload syntax highlighting to a Worker and keep the UI thread responsive during heavy streams:

```tsx
<Markify isStreaming codeBlockWorker>
  {streamingText}
</Markify>
```