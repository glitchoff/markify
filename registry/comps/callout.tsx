"use client";

import type { ReactNode } from "react";
import { PencilSimple, Flame, Warning, Info, CheckCircle, Question, ListChecks, CheckSquare, XCircle, WarningDiamond, Bug, Flask, Quotes } from "@phosphor-icons/react";
import { cn } from "./_lib";

/* ── Callout parsing (GitHub-style `> [!TYPE]`) ───────────────────────── */

export type CalloutType =
  | "NOTE" | "TIP" | "HINT" | "IMPORTANT" | "WARNING" | "CAUTION" | "ATTENTION"
  | "INFO" | "SUCCESS" | "QUESTION" | "ABSTRACT" | "TODO" | "FAILURE" | "DANGER"
  | "BUG" | "EXAMPLE" | "QUOTE";

export interface CalloutResult {
  type: CalloutType | null;
  content: string;
}

const CALLOUT_PREFIX =
  /^>?\s*\[!(NOTE|TIP|HINT|IMPORTANT|WARNING|CAUTION|ATTENTION|INFO|SUCCESS|QUESTION|ABSTRACT|TODO|FAILURE|DANGER|BUG|EXAMPLE|QUOTE)\]\s*/i;

export function parseCallout(text: string): CalloutResult {
  const trimmed = text.trim();
  const match = CALLOUT_PREFIX.exec(trimmed);
  if (match) {
    return {
      type: match[1].toUpperCase() as CalloutType,
      content: trimmed.slice(match[0].length).trim(),
    };
  }
  return { type: null, content: text };
}

/** Extract plain text from an arbitrary React node tree. */
export function getText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getText).join("");
  const props = (node as { props?: { children?: unknown } })?.props;
  if (props?.children !== undefined) return getText(props.children);
  const children = (node as { children?: unknown })?.children;
  if (children) return getText(children);
  return "";
}

/**
 * Removes a leading `> [!TYPE]` marker from a ReactNode tree while preserving
 * all rendered children. Returns the type name and the remaining nodes.
 */
export function stripCalloutMarker(node: unknown): { type: CalloutType | null; children: unknown } {
  if (typeof node === "string") {
    const match = CALLOUT_PREFIX.exec(node);
    if (match) {
      return { type: match[1].toUpperCase() as CalloutType, children: node.slice(match[0].length) || "" };
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
  const props = (node as { props?: { children?: unknown } })?.props;
  if (props?.children !== undefined) {
    const result = stripCalloutMarker(props.children);
    if (result.type) {
      return {
        type: result.type,
        children: { ...(node as object), props: { ...props, children: result.children } },
      };
    }
  }
  return { type: null, children: node };
}

/* ── Callout component ─────────────────────────────────────────────────── */

const CALLOUT_META: Record<CalloutType, { title: string; icon: typeof Info }> = {
  NOTE: { title: "Note", icon: PencilSimple },
  TIP: { title: "Tip", icon: Flame },
  HINT: { title: "Hint", icon: Flame },
  IMPORTANT: { title: "Important", icon: Flame },
  WARNING: { title: "Warning", icon: Warning },
  CAUTION: { title: "Caution", icon: Warning },
  ATTENTION: { title: "Attention", icon: Warning },
  INFO: { title: "Info", icon: Info },
  SUCCESS: { title: "Success", icon: CheckCircle },
  QUESTION: { title: "Question", icon: Question },
  ABSTRACT: { title: "Abstract", icon: ListChecks },
  TODO: { title: "Todo", icon: CheckSquare },
  FAILURE: { title: "Failure", icon: XCircle },
  DANGER: { title: "Danger", icon: WarningDiamond },
  BUG: { title: "Bug", icon: Bug },
  EXAMPLE: { title: "Example", icon: Flask },
  QUOTE: { title: "Quote", icon: Quotes },
};

export function Callout({
  type,
  children,
  className,
  ...props
}: { type: CalloutType; children?: ReactNode; className?: string; [key: string]: unknown }) {
  const meta = CALLOUT_META[type];
  const Icon = meta.icon;
  const accent = `var(--markify-callout-${type.toLowerCase()})`;
  return (
    <div
      data-callout={type.toLowerCase()}
      className={cn("markify-callout mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) rounded-lg border-l-4 p-4", className)}
      style={{
        borderLeftColor: accent,
        backgroundColor: `color-mix(in oklab, ${accent} 8%, transparent)`,
      }}
      {...props}
    >
      <strong
        className="mb-1 flex items-center gap-2 font-bold"
        style={{ color: accent }}
      >
        <Icon size={16} weight="duotone" aria-hidden />
        {meta.title}
      </strong>
      {children}
    </div>
  );
}
