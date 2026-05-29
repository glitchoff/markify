"use client";

import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import hljs from "highlight.js";
import { cn } from "./utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
  worker?: boolean;
}

function getCodeText(children: React.ReactNode): string {
  if (typeof children === "string") return children.replace(/\n$/, "");
  if (Array.isArray(children)) {
    return children.map((c) => (typeof c === "string" ? c : getCodeText(c?.props?.children))).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return getCodeText((children as any).props.children);
  }
  return "";
}

function CodeBlockInner({ children, className, language: langProp, worker }: CodeBlockProps) {
  const codeText = useMemo(() => getCodeText(children), [children]);
  const [copied, setCopied] = useState(false);
  const [wrapped, setWrapped] = useState(true);

  // ── Highlighting (sync or worker) ──────────────────────────────────
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingIdRef = useRef(0);

  const language = useMemo(() => {
    if (langProp) return langProp;
    const match = /language-(\w+)/.exec(className || "");
    return match ? match[1] : "";
  }, [langProp, className]);

  // Sync highlighting
  const syncHtml = useMemo(() => {
    if (worker) return null;
    if (!codeText) return "";
    try {
      if (language && language !== "plaintext" && language !== "text") {
        return hljs.highlight(codeText, { language, ignoreIllegals: true }).value;
      }
      return hljs.highlightAuto(codeText).value;
    } catch {
      return codeText;
    }
  }, [codeText, language, worker]);

  // Worker highlighting
  useEffect(() => {
    if (!worker || !codeText) return;

    const id = ++pendingIdRef.current;
    let workerInstance = workerRef.current;

    if (!workerInstance) {
      try {
        workerInstance = new Worker(new URL("./highlight.worker.js", import.meta.url));
        workerRef.current = workerInstance;
        workerInstance.onmessage = (e: MessageEvent<{ html: string; id: number }>) => {
          if (e.data.id === pendingIdRef.current) {
            setHighlightedHtml(e.data.html);
          }
        };
        workerInstance.onerror = () => {
          setHighlightedHtml(null);
        };
      } catch {
        setHighlightedHtml(null);
        return;
      }
    }

    workerInstance.postMessage({ code: codeText, language, id });

    return () => {
      pendingIdRef.current = -1;
    };
  }, [codeText, language, worker]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const displayHtml = worker ? (highlightedHtml ?? codeText) : (syncHtml ?? codeText);
  const isLoading = worker && !highlightedHtml && codeText.length > 0;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = codeText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codeText]);

  const isMermaid = language === "mermaid";

  if (isMermaid) {
    return (
      <div className="relative my-4 w-full">
        <div
          className={cn(
            "rounded-lg border border-border bg-card p-4 font-mono text-sm",
            wrapped ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto",
            className,
          )}
        >
          <code>{codeText}</code>
        </div>
        <div className="absolute right-2 top-2 flex gap-1">
          <ActionButton onClick={() => setWrapped((p) => !p)}>
            {wrapped ? "Unwrap" : "Wrap"}
          </ActionButton>
          <ActionButton copied={copied} onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative my-4 w-full">
      <div className="flex items-center justify-between rounded-t-lg border border-border bg-muted px-4 py-1.5">
        <span className="font-mono text-xs text-muted-foreground lowercase">
          {language || "code"}
        </span>
        <div className="flex gap-1">
          <ActionButton onClick={() => setWrapped((p) => !p)}>
            {wrapped ? "Unwrap" : "Wrap"}
          </ActionButton>
          <ActionButton copied={copied} onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </ActionButton>
        </div>
      </div>
      <pre
        className={cn(
          "overflow-x-auto rounded-b-lg border border-t-0 border-border bg-card p-4 text-sm",
          wrapped && "whitespace-pre-wrap break-words",
          className,
        )}
      >
        <code
          className={cn("font-mono text-sm", language && `language-${language}`)}
          {...(isLoading ? {} : { dangerouslySetInnerHTML: { __html: displayHtml } })}
        >
          {isLoading ? codeText : undefined}
        </code>
      </pre>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  copied,
}: {
  children: React.ReactNode;
  onClick: () => void;
  copied?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors",
        copied
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

export const CodeBlock = memo(CodeBlockInner);
