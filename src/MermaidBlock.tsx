"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import mermaid from "mermaid";
import type { MermaidConfig } from "mermaid";
import { Copy, Check, Download, Maximize, Minimize, ZoomIn, ZoomOut, RotateCcw, Expand } from "lucide-react";
import { cn } from "./utils";

/** Extended Mermaid config with Markify UI options. */
export interface MarkifyMermaidConfig extends MermaidConfig {
  /** Show the toolbar header with copy/download/fullscreen buttons. Default: true */
  showHeader?: boolean;
  /** Show the card border and background. Default: true */
  showBackground?: boolean;
  /** Auto-fit diagram to container width. Default: false */
  fit?: boolean;
}

export interface MermaidBlockProps {
  code: string;
  className?: string;
  config?: MarkifyMermaidConfig;
}

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "monospace",
  suppressErrorRendering: true,
};

function MermaidBlockInner({ code, className, config }: MermaidBlockProps) {
  const showHeader = config?.showHeader ?? true;
  const showBackground = config?.showBackground ?? true;
  const fit = config?.fit ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const lastValidSvgRef = useRef("");
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
      if (!lastValidSvgRef.current) {
        setState("loading");
      }
      try {
        mermaid.initialize(config ? { ...DEFAULT_CONFIG, ...config } : DEFAULT_CONFIG);
        const id = `mermaid-${Math.abs(
          code.split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0),
        )}-${Date.now()}`;

        const { svg: result } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(result);
          lastValidSvgRef.current = result;
          setState("success");
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          const errMsg = err instanceof Error ? err.message : "Failed to render diagram";
          setError(errMsg);
          if (lastValidSvgRef.current) {
            setSvg(lastValidSvgRef.current);
            setState("success");
          } else {
            setState("error");
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, visible, config]);

  const handleRetry = useCallback(() => {
    setState("idle");
    setError("");
    setVisible(true);
  }, []);

  // ── Zoom/Pan state ───────────────────────────────────────────────
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const isPanningRef = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const bodyRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const baseScale = fit ? fitScale : 1;
  const effectiveScale = scale * baseScale;

  // ── Fullscreen ───────────────────────────────────────────────────
  const [fullscreen, setFullscreen] = useState(false);

  // ── Fit-to-container ─────────────────────────────────────────────
  const computeFit = useCallback(() => {
    if (!fit || !svgWrapperRef.current || !bodyRef.current) return;

    const wrapper = svgWrapperRef.current;
    const container = bodyRef.current;
    const svgEl = wrapper.querySelector("svg");
    if (!svgEl) return;

    const svgWidth = svgEl.getBoundingClientRect().width;
    const svgHeight = svgEl.getBoundingClientRect().height;
    const containerWidth = container.clientWidth - 32;
    const containerHeight = container.clientHeight - 32;

    if (svgWidth === 0) return;

    const widthRatio = containerWidth / svgWidth;
    const heightRatio = containerHeight / svgHeight;
    const ratio = Math.min(widthRatio, heightRatio, 1);

    setFitScale(ratio > 0 ? ratio : 1);
    setPosition({ x: 0, y: 0 });
    setScale(1);
  }, [fit]);

  // Re-compute fit when svg changes, container resizes, or fullscreen toggles
  useEffect(() => {
    if (!fit || !svg) return;
    computeFit();

    const ro = new ResizeObserver(() => computeFit());
    if (bodyRef.current) ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, [fit, svg, computeFit, fullscreen]);

  // ── Wheel zoom (zoom toward cursor) ─────────────────────────────
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Only zoom on wheel when the user explicitly holds Ctrl/Cmd.
      // Otherwise let the event scroll the page normally.
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left - rect.width / 2;
      const cursorY = e.clientY - rect.top - rect.height / 2;

      setScale((s) => {
        const newScale = Math.max(0.3, Math.min(5, s - e.deltaY * 0.002));
        const ratio = newScale / s;

        setPosition((p) => ({
          x: cursorX - (cursorX - p.x) * ratio,
          y: cursorY - (cursorY - p.y) * ratio,
        }));

        return newScale;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Mouse panning ────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isPanningRef.current = true;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = position;
  }, [position]);

  // ── Touch panning + pinch zoom ───────────────────────────────────
  const touchState = useRef<{ mode: "none" | "pan" | "pinch"; dist: number; centerX: number; centerY: number }>({ mode: "none", dist: 0, centerX: 0, centerY: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchState.current = {
        mode: "pan",
        dist: 0,
        centerX: e.touches[0].clientX,
        centerY: e.touches[0].clientY,
      };
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      posStart.current = position;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.current = {
        mode: "pinch",
        dist: Math.hypot(dx, dy),
        centerX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        centerY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchState.current.mode === "pan" && e.touches.length === 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panStart.current.x;
      const dy = e.touches[0].clientY - panStart.current.y;
      setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
    } else if (touchState.current.mode === "pinch" && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchState.current.dist;
      setScale((s) => Math.max(0.3, Math.min(5, s * ratio)));
      touchState.current.dist = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchState.current.mode = "none";
  }, []);

  // ── Window-level mouse move/up ──────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      e.preventDefault();
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
    };
    const onUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── Zoom helpers ────────────────────────────────────────────────
  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(5, s + 0.15));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(0.3, s - 0.15));
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

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) overflow-hidden flex flex-col",
        showBackground && "rounded-lg border border-border bg-card",
        fullscreen && "fixed inset-0 z-50 m-0 rounded-none h-screen w-screen",
        className,
      )}
    >
      {/* Header */}
      {showHeader && (
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

            {fit && (
              <ActionButton onClick={computeFit} title="Fit to container">
                <Expand className="size-3.5" />
              </ActionButton>
            )}

            <ActionButton onClick={() => setFullscreen((f) => !f)} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {fullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
            </ActionButton>
          </div>
        </div>
      )}

      {/* Body */}
      <div
        ref={bodyRef}
        className={cn(
          "flex items-center justify-center overflow-hidden p-4 flex-1 select-none",
          (state === "success" || svg) && "min-h-[120px]",
          fullscreen && "h-full w-full",
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
      >
        {state === "loading" && !svg && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
            Rendering diagram...
          </div>
        )}

        {state === "error" && !svg && (
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

        {svg && (
          <div
            ref={svgWrapperRef}
            className="mermaid-svg transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${effectiveScale})`,
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}

        {state === "idle" && !svg && (
          <div className="h-24" />
        )}
      </div>

      {/* Zoom controls panel: always visible when svg exists */}
      {svg && (
        <div className={cn(
          "absolute z-10 flex flex-col gap-1 rounded-md border border-border bg-background/80 p-1 supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:backdrop-blur-sm shadow-sm",
          "bottom-4 left-4"
        )}>
          <button
            className="flex cursor-pointer items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={scale >= 5}
            onClick={zoomIn}
            title="Zoom in"
            type="button"
          >
            <ZoomIn size={15} />
          </button>
          <button
            className="flex cursor-pointer items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={scale <= 0.3}
            onClick={zoomOut}
            title="Zoom out"
            type="button"
          >
            <ZoomOut size={15} />
          </button>
          <button
            className="flex cursor-pointer items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={resetZoom}
            title="Reset zoom and pan"
            type="button"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      )}

      {/* Zoom indicator */}
      {state === "success" && scale !== 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1">
          <button
            onClick={resetZoom}
            className="cursor-pointer rounded bg-background/80 px-2 py-0.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
            type="button"
          >
            Reset zoom
          </button>
          <span className="rounded bg-background/80 px-1.5 py-0.5 text-xs text-muted-foreground backdrop-blur">
            {Math.round(effectiveScale * 100)}%
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
