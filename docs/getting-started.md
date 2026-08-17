# Getting Started with Markify

`@glitchoff/markify` is a high-performance, streaming Markdown renderer for React applications built with Tailwind CSS.

## 1. Installation

Install Markify using your preferred package manager:

```bash
pnpm add @glitchoff/markify
# or
npm install @glitchoff/markify
# or
yarn add @glitchoff/markify
```

### Peer Dependencies
Markify requires React 18 or 19:
- `react`: `^18.0.0 || ^19.0.0`
- `react-dom`: `^18.0.0 || ^19.0.0`

---

## 2. Requirements & CSS Imports



> [!IMPORTANT]
> **Tailwind CSS Required:**  
> Markify components rely on Tailwind CSS utility classes. Ensure Tailwind CSS is installed and configured in your host project.


Import `markify.css` once at your application root (e.g. `main.tsx`, `App.tsx`, or `layout.tsx`):

```tsx
import "@glitchoff/markify/themes/markify.css";
```

---

## 3. Basic Usage

Render static or streaming Markdown content with the `<Markify>` component:

```tsx
import { Markify } from "@glitchoff/markify";

export function SimpleViewer() {
  const content = "# Hello World\n\nThis is **Markify** rendering markdown!";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Markify>{content}</Markify>
    </div>
  );
}
```

### Streaming Mode (AI Responses)
Enable token-arrival reveal animation during LLM streaming:

```tsx
<Markify isStreaming={isLoading}>
  {streamingTextContent}
</Markify>
```
