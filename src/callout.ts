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

const CALLOUT_PREFIX = /^>?\s*\[!(NOTE|WARNING|TIP)\]\s*/i;

/**
 * Removes a leading `> [!TYPE]` marker from a ReactNode tree while preserving
 * all rendered children (elements like images are kept intact, unlike getText).
 * Returns the type name and the remaining nodes.
 */
export function stripCalloutMarker(node: any): { type: "NOTE" | "WARNING" | "TIP" | null; children: any } {
  if (typeof node === "string") {
    const match = CALLOUT_PREFIX.exec(node);
    if (match) {
      return { type: match[1].toUpperCase() as any, children: node.slice(match[0].length) || "" };
    }
    return { type: null, children: node };
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const result = stripCalloutMarker(node[i]);
      if (result.type) {
        const children = [...node];
        children[i] = result.children;
        return { type: result.type, children };
      }
    }
    return { type: null, children: node };
  }
  if (node?.props?.children) {
    const result = stripCalloutMarker(node.props.children);
    if (result.type) {
      return {
        type: result.type,
        children: { ...node, props: { ...node.props, children: result.children } },
      };
    }
  }
  return { type: null, children: node };
}
