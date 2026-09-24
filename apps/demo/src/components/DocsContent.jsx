"use client";

import { useState } from "react";
import { Menu, X, Copy, Check, ChevronDown, ExternalLink } from "lucide-react";
import { Markify } from "./markify/config";
import { DOC_GROUPS } from "../docs-config";
import { withBase } from "../base";

/**
 * Docs content island — the sidebar and pagination are server-rendered in
 * layouts/Docs.astro; only interactive bits live here: the mobile nav, the
 * copy/AI-share menu, and the markdown itself.
 */
export function DocsContent({ docId, file, content }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [docMenuOpen, setDocMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile navigation header */}
      <div className="fixed inset-x-0 top-16 z-30 px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm"
          type="button"
        >
          <span className="truncate font-mono text-muted-foreground">docs/{file}</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span>Menu</span>
          </span>
        </button>
        {mobileMenuOpen && (
          <div className="mt-2 rounded-xl border border-border bg-card p-2 shadow-lg duration-150">
            <nav className="flex flex-col gap-4">
              {DOC_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((doc) => (
                      <a
                        key={doc.id}
                        href={withBase(`/docs/${doc.id}`)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors text-left ${
                          doc.id === docId
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${doc.id === docId ? "bg-current" : "bg-transparent"}`} />
                        <span className="flex-1 truncate">{doc.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Copy / AI-share menu */}
      <div className="md:hidden" />
      <div className="relative md:hidden" />

      <div className="flex items-center justify-end relative -mt-8 mb-2 md:hidden">
        <button
          onClick={() => setDocMenuOpen((o) => !o)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          {copiedDoc ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copiedDoc ? "Copied!" : "Copy"}
          <ChevronDown className="size-3" />
        </button>
        {docMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDocMenuOpen(false)} />
            <div className="absolute right-4 top-0 z-50 w-48 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content).then(() => {
                    setCopiedDoc(true);
                    setTimeout(() => setCopiedDoc(false), 2000);
                  });
                  setDocMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                type="button"
              >
                <Copy className="size-3.5" />
                Copy markdown
              </button>
              <div className="border-t border-border" />
              <a
                href={`https://chatgpt.com/?${new URLSearchParams({ hints: "search", prompt: content })}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDocMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Open in ChatGPT
              </a>
              <a
                href={`https://claude.ai/new?${new URLSearchParams({ q: content })}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDocMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Open in Claude
              </a>
            </div>
          </>
        )}
      </div>

      <Markify>{content}</Markify>
    </>
  );
}

export default DocsContent;
