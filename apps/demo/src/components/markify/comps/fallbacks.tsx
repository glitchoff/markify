"use client";

import type { ReactNode } from "react";
import { cn } from "./_lib";

/* Spinner ───────────────────────────────────────────────────────────── */

export function Spinner({ className, size = 4 }: { className?: string; size?: 3 | 4 }) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-(--markify-border) border-t-(--markify-fg)",
        size === 3 ? "h-3 w-3" : "h-4 w-4",
        className,
      )}
    />
  );
}

/* Loading cards (Suspense fallbacks) ────────────────────────────────── */

function LoadingCard({ children }: { children: ReactNode }) {
  return (
    <div className="markify-fallback mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) flex items-center gap-2 rounded-lg border border-(--markify-border) bg-(--markify-card) p-6 text-sm text-(--markify-muted-fg)">
      <Spinner />
      {children}
    </div>
  );
}

export function ChessFallback() {
  return <LoadingCard>Loading chess viewer…</LoadingCard>;
}

export function MermaidFallback() {
  return <LoadingCard>Loading mermaid diagram…</LoadingCard>;
}
