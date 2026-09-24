// Web worker for off-thread syntax highlighting. Loaded by code-block.tsx
// when `codeBlock.worker` is enabled in markify config.
import hljs from "highlight.js/lib/core";
import { ensureLanguage } from "./code-block";

self.onmessage = async (e: MessageEvent<{ code: string; language: string; id: number }>) => {
  const { code, language, id } = e.data;
  try {
    const ok = await ensureLanguage(language);
    let html: string;
    if (ok && hljs.getLanguage(language)) {
      html = hljs.highlight(code, { language, ignoreIllegals: true }).value;
    } else {
      html = hljs.highlightAuto(code).value;
    }
    (self as unknown as Worker).postMessage({ html, id });
  } catch {
    (self as unknown as Worker).postMessage({ html: code, id });
  }
};
