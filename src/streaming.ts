import remend from "remend";

/**
 * remark-math only treats `$$...$$` as a *block* (display) equation when the
 * delimiters sit on their own lines: `$$\n...\n$$`. The common single-line
 * form `$$a + b$$` is parsed as inline math, which KaTeX renders inline and
 * never centered. Rewrite those into the multi-line form so models' output
 * centers properly. Skips fenced code blocks and leaves `$...$` untouched.
 */
export function normalizeDisplayMath(content: string): string {
  if (!content.includes("$$")) return content;
  const lines = content.split("\n");
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fence && !fence[1].includes("`") && !fence[1].includes("~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(\s*)\$\$(.*?)\$\$(\s*)$/.exec(line);
    if (m && m[2] && !m[2].includes("$$")) {
      lines[i] = `${m[1]}$$\n${m[2]}\n$$${m[3]}`;
    }
  }
  return lines.join("\n");
}

export function useStreamingReveal(
  content: string,
  isStreaming: boolean,
): string {
  if (!content) return "";
  const normalized = normalizeDisplayMath(content);
  // remend's katex/inlineKatex repair appends $$/$ to partial equations mid-
  // stream, producing invalid LaTeX that KaTeX renders as red errors. Leave
  // math delimiters untouched — remark-math renders them correctly the moment
  // the closing delimiter arrives.
  return isStreaming ? remend(normalized, { katex: false, inlineKatex: false }) : normalized;
}