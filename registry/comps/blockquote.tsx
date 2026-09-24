"use client";

import type { ReactNode } from "react";
import { Callout, stripCalloutMarker } from "./callout";
import { cn } from "./_lib";

/**
 * Blockquote — renders a GitHub-style callout when the content starts with a
 * `> [!TYPE]` marker, otherwise a plain styled blockquote.
 */
export function Blockquote({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  const { type, children: stripped } = stripCalloutMarker(children) as { type: any; children: ReactNode };

  if (type) {
    return (
      <Callout type={type} className={className} {...props}>
        {stripped}
      </Callout>
    );
  }

  return (
    <blockquote
      className={cn(
        "mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) border-l-4 border-(--markify-muted-fg-30) pl-4 text-(--markify-muted-fg) italic",
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}
