import { clsx, type ClassValue } from "clsx";

/** Conditional class composition (clsx only — no tailwind-merge). */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Stable string hash (base36) — used for element keys / render ids. */
export function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string, mime = "text/plain"): void {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

/** Clipboard write with a legacy `execCommand` fallback. Returns success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/** Extract plain text from an arbitrary React node tree. */
export function getText(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  const props = (node as { props?: { children?: unknown } })?.props;
  if (props?.children !== undefined) return getText(props.children);
  const children = (node as { children?: unknown })?.children;
  if (children) return getText(children);
  return "";
}
