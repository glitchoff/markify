"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import mermaid from "mermaid";
import { Copy, Check, Download, Maximize, Minimize } from "lucide-react";
import { cn } from "./utils";

interface MermaidBlockProps {
  code: string;
  className?: string;
}

const DEFAULT_CONFIG: any = {
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "monospace",
};

let initialized = false;

function getInstance() {
  if (!initialized) {
    mermaid.initialize(DEFAULT_CONFIG);
    initialized = true;
  }
  return mermaid;
}

function MermaidBlockInner({ code, className }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  // ── Lazy visibility ──────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Render ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible || !code) return;

    let cancelled = false;

    (async () => {
      setState("loading");
      try {
        const instance = getInstance();
        const id = `mermaid-${Math.abs(
          code.split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0),
        )}-${Date.now()}`;

        const { svg: result } = await instance.render(id, code);
        if (!cancelled) {
          setSvg(result);
          setState("success");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, visible]);

  const handleRetry = useCallback(() => {
    setState("idle");
    setError("");
    setVisible(true);
  }, []);

  // ── Zoom/Pan ─────────────────────────────────────────────────────
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.max(0.3, Math.min(5, s - e.deltaY * 0.002)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // ── Download ─────────────────────────────────────────────────────
  const handleDownloadSVG = useCallback(() => {
    downloadFile(svg, "diagram.svg", "image/svg+xml");
  }, [svg]);

  const handleDownloadMMD = useCallback(() => {
    downloadFile(code, "diagram.mmd", "text/plain");
  }, [code]);

  const handleDownloadPNG = useCallback(async () => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
          if (b) downloadBlob(b, "diagram.png");
        });
      };
      img.src = url;
    } catch {
      // silently fail
    }
  }, [svg]);

  // ── Copy ─────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }, [code]);

  // ── Fullscreen ───────────────────────────────────────────────────
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mb-3 overflow-hidden rounded-lg border border-border bg-card",
        fullscreen && "fixed inset-0 z-50 m-0",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">mermaid</span>
        <div className="flex gap-1">
          <ActionButton onClick={handleCopy} copied={copied} title={copied ? "Copied" : "Copy"}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </ActionButton>

          <DownloadDropdown
            onSVG={handleDownloadSVG}
            onPNG={handleDownloadPNG}
            onMMD={handleDownloadMMD}
          />

          <ActionButton onClick={() => setFullscreen((f) => !f)} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
          </ActionButton>
        </div>
      </div>

      {/* Body */}
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden p-4",
          state === "success" && "min-h-[120px]",
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isPanning.current ? "grabbing" : "grab" }}
      >
        {state === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
            Rendering diagram...
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <p className="text-sm text-destructive">Failed to render diagram</p>
            <p className="max-w-md text-xs text-muted-foreground">{error}</p>
            <button
              onClick={handleRetry}
              className="cursor-pointer rounded bg-primary px-3 py-1 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
              type="button"
            >
              Retry
            </button>
            <details className="mt-2 w-full">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Show source
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-left text-xs">
                <code>{code}</code>
              </pre>
            </details>
          </div>
        )}

        {state === "success" && (
          <div
            className="mermaid-svg transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}

        {state === "idle" && (
          <div className="h-24" />
        )}
      </div>

      {/* Zoom indicator */}
      {state === "success" && scale !== 1 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <button
            onClick={resetZoom}
            className="cursor-pointer rounded bg-background/80 px-2 py-0.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
            type="button"
          >
            Reset zoom
          </button>
          <span className="rounded bg-background/80 px-1.5 py-0.5 text-xs text-muted-foreground backdrop-blur">
            {Math.round(scale * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  copied,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  copied?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
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

function DownloadDropdown({
  onSVG,
  onPNG,
  onMMD,
}: {
  onSVG: () => void;
  onPNG: () => void;
  onMMD: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <ActionButton onClick={() => setOpen((o) => !o)} title="Download">
        <Download className="size-3.5" />
      </ActionButton>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[100px] overflow-hidden rounded-md border border-border bg-popover shadow-lg">
            <DropdownItem onClick={() => { onSVG(); setOpen(false); }}>
              SVG
            </DropdownItem>
            <DropdownItem onClick={() => { onPNG(); setOpen(false); }}>
              PNG
            </DropdownItem>
            <DropdownItem onClick={() => { onMMD(); setOpen(false); }}>
              MMD
            </DropdownItem>
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer px-3 py-2 text-left text-xs text-popover-foreground transition-colors hover:bg-accent"
      type="button"
    >
      {children}
    </button>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const MermaidBlock = memo(MermaidBlockInner);
