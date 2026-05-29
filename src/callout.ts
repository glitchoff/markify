export interface CalloutResult {
  type: "NOTE" | "WARNING" | "TIP" | null;
  content: string;
}

export function parseCallout(text: string): CalloutResult {
  const trimmed = text.trim();
  const noteMatch = trimmed.match(/^>?\s*\[!NOTE\]/i);
  if (noteMatch) {
    return {
      type: "NOTE",
      content: trimmed.slice(noteMatch[0].length).trim(),
    };
  }
  const warningMatch = trimmed.match(/^>?\s*\[!WARNING\]/i);
  if (warningMatch) {
    return {
      type: "WARNING",
      content: trimmed.slice(warningMatch[0].length).trim(),
    };
  }
  const tipMatch = trimmed.match(/^>?\s*\[!TIP\]/i);
  if (tipMatch) {
    return {
      type: "TIP",
      content: trimmed.slice(tipMatch[0].length).trim(),
    };
  }
  return { type: null, content: text };
}

export function getText(node: any): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getText).join("");
  if (node?.props?.children) return getText(node.props.children);
  if (node?.children) return getText(node.children);
  return "";
}
