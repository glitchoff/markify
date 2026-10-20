"use client";

import {
	useState,
	useRef,
	useEffect,
	useCallback,
	memo,
	type ReactNode,
} from "react";
import {
	Copy,
	Check,
	Download,
	Maximize,
	Minimize,
	ZoomIn,
	ZoomOut,
	RotateCcw,
	Expand,
} from "lucide-react";
import { createPortal } from "react-dom";
import { cn, copyToClipboard, downloadText, downloadBlob } from "./_lib";

/* ═══════════════════════════════════════════════════════════════════════
 * Renderer
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Pele (obsidianmd/pele) is the default: synchronous, zero-dependency, and
 * themed entirely through CSS variables — so diagrams follow the host app's
 * palette without a re-render. mermaid.js stays available as an opt-in
 * fallback for syntax Pele's Mermaid 12.1.0 coverage doesn't handle yet.
 *
 * Both engines are dynamically imported so neither lands in the base bundle:
 * the 33 Pele diagram chunks are fetched on demand, and mermaid.js is only
 * downloaded when `renderer: "mermaid"` is actually configured.
 */

export type MermaidRenderer = "pele" | "mermaid";

/** Extended config with markify UI options. */
export interface MarkifyMermaidConfig {
	/** Show the toolbar header with copy/download/fullscreen buttons. Default: true */
	showHeader?: boolean;
	/** Show the card border and background. Default: true */
	showBackground?: boolean;
	/** Auto-fit diagram to container width. Default: false */
	fit?: boolean;
	/** Diagram engine. Default: "pele" */
	renderer?: MermaidRenderer;
	/** Fall back to mermaid.js when Pele can't parse the diagram. Default: true */
	fallback?: boolean;
}

export interface MermaidBlockProps {
	code: string;
	className?: string;
	config?: MarkifyMermaidConfig;
	/** True while the source is still streaming in. */
	isStreaming?: boolean;
}

type EngineState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "success"; svg: string; engine: MermaidRenderer }
	| { status: "error"; message: string };

/* ── engines ───────────────────────────────────────────────────────────── */

/**
 * Renders with Pele. Rejects with a PeleError (carrying `code`, `line`,
 * `column`) when the source is unparseable — which is expected on every
 * token while streaming, so callers keep the last good SVG instead.
 */
async function renderWithPele(source: string): Promise<string> {
	const pele = await import("pele/lazy");
	const { svg } = await pele.renderAsync(source);
	return svg;
}

/** Renders with mermaid.js. Only loaded when explicitly configured. */
async function renderWithMermaid(source: string, dark: boolean): Promise<string> {
	const mermaid = (await import("mermaid")).default;
	mermaid.initialize({
		startOnLoad: false,
		theme: dark ? "dark" : "default",
		securityLevel: "loose",
		fontFamily: "monospace",
		suppressErrorRendering: true,
	});
	const { svg } = await mermaid.render(`mermaid-${nextRenderId()}`, source);
	return svg;
}

let renderCounter = 0;
function nextRenderId(): string {
	renderCounter += 1;
	return `m${renderCounter}`;
}

/**
 * Pele errors carry structured fields (`code`, `line`, `column`, `snippet`)
 * and a message that already embeds the line number. Strip the duplicated
 * header so the card can lay the line/column out itself.
 */
function errorMessage(err: unknown): string {
	if (err instanceof Error) {
		const { line, column } = err as { line?: number; column?: number };
		const body = err.message.replace(/^Parse error on line \d+:\s*/, "").trim();
		const where =
			line && line > 0
				? `Line ${line}${column && column > 0 ? `, column ${column}` : ""}: `
				: "";
		return `${where}${body || err.message}`;
	}
	return "Failed to render diagram";
}

/* ═══════════════════════════════════════════════════════════════════════
 * Component
 * ═══════════════════════════════════════════════════════════════════════ */

function MermaidBlockInner({
	code,
	className,
	config,
	isStreaming = false,
}: MermaidBlockProps) {
	const showHeader = config?.showHeader ?? true;
	const showBackground = config?.showBackground ?? true;
	const fit = config?.fit ?? false;
	const renderer = config?.renderer ?? "pele";
	const allowFallback = config?.fallback ?? true;

	const containerRef = useRef<HTMLDivElement>(null);
	/* Last SVG that rendered successfully — shown while the next attempt fails. */
	const lastValidSvgRef = useRef("");
	const [state, setState] = useState<EngineState>({ status: "idle" });
	const [visible, setVisible] = useState(false);

	/* Lazy visibility — don't pay for diagrams scrolled out of view. */
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

	/* Render. Pele is synchronous, so this settles within the same tick. */
	useEffect(() => {
		if (!visible || !code) return;

		let cancelled = false;

		(async () => {
			if (!lastValidSvgRef.current) setState({ status: "loading" });

			const attempt = async (engine: MermaidRenderer): Promise<string> =>
				engine === "pele"
					? renderWithPele(code)
					: renderWithMermaid(code, isDark());

			try {
				let svg: string;
				let used: MermaidRenderer = renderer;
				try {
					svg = await attempt(renderer);
				} catch (err) {
					/* Pele couldn't parse it — try mermaid.js if allowed. */
					if (renderer !== "pele" || !allowFallback) throw err;
					used = "mermaid";
					svg = await attempt("mermaid");
				}

				if (cancelled) return;
				lastValidSvgRef.current = svg;
				setState({ status: "success", svg, engine: used });
			} catch (err) {
				if (cancelled) return;
				/* Keep the last good diagram rather than flashing an error. */
				if (lastValidSvgRef.current) {
					setState({
						status: "success",
						svg: lastValidSvgRef.current,
						engine: renderer,
					});
				} else {
					setState({ status: "error", message: errorMessage(err) });
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [code, visible, renderer, allowFallback]);

	const svg = state.status === "success" ? state.svg : "";

	const handleRetry = useCallback(() => {
		setState({ status: "idle" });
		lastValidSvgRef.current = "";
		setVisible(true);
	}, []);

	/* Zoom / pan */
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const [fitScale, setFitScale] = useState(1);
	const isPanningRef = useRef(false);
	const panStart = useRef({ x: 0, y: 0 });
	const posStart = useRef({ x: 0, y: 0 });
	const bodyRef = useRef<HTMLDivElement>(null);
	const svgWrapperRef = useRef<HTMLDivElement>(null);

	/*
	 * In the fullscreen dialog the diagram gets a 20% lift over its natural
	 * size — inside a large empty modal the source size reads as too small.
	 * Inline it stays 1:1 so message height doesn't jump.
	 */
	const baseScale = fit ? fitScale : fullscreen ? 1.2 : 1;
	const effectiveScale = scale * baseScale;

	/* Fullscreen */
	const [fullscreen, setFullscreen] = useState(false);

	/* Overlay behaviour: lock page scroll and close on Escape while open. */
	useEffect(() => {
		if (!fullscreen) return;
		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setFullscreen(false);
		};
		window.addEventListener("keydown", onKey);

		return () => {
			document.body.style.overflow = overflow;
			window.removeEventListener("keydown", onKey);
		};
	}, [fullscreen]);

	/* Fit to container */
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

		const ratio = Math.min(
			containerWidth / svgWidth,
			containerHeight / svgHeight,
			1,
		);

		setFitScale(ratio > 0 ? ratio : 1);
		setPosition({ x: 0, y: 0 });
		setScale(1);
	}, [fit]);

	useEffect(() => {
		if (!fit || !svg) return;
		computeFit();

		const ro = new ResizeObserver(() => computeFit());
		if (bodyRef.current) ro.observe(bodyRef.current);
		return () => ro.disconnect();
	}, [fit, svg, computeFit, fullscreen]);

	/* Wheel zoom, anchored on the cursor */
	useEffect(() => {
		const el = bodyRef.current;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			if (!e.ctrlKey && !e.metaKey) return;

			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const cursorX = e.clientX - rect.left - rect.width / 2;
			const cursorY = e.clientY - rect.top - rect.height / 2;

			setScale((s) => {
				const next = Math.max(0.3, Math.min(5, s - e.deltaY * 0.002));
				const ratio = next / s;

				setPosition((p) => ({
					x: cursorX - (cursorX - p.x) * ratio,
					y: cursorY - (cursorY - p.y) * ratio,
				}));

				return next;
			});
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, []);

	/* Mouse panning */
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.button !== 0) return;
			e.preventDefault();
			isPanningRef.current = true;
			setIsPanning(true);
			panStart.current = { x: e.clientX, y: e.clientY };
			posStart.current = position;
		},
		[position],
	);

	/* Touch panning + pinch zoom */
	const touchState = useRef<{
		mode: "none" | "pan" | "pinch";
		dist: number;
	}>({ mode: "none", dist: 0 });

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (e.touches.length === 1) {
				touchState.current = { mode: "pan", dist: 0 };
				panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
				posStart.current = position;
			} else if (e.touches.length === 2) {
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				touchState.current = { mode: "pinch", dist: Math.hypot(dx, dy) };
			}
		},
		[position],
	);

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

	/* Window-level mouse move/up */
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

	/* Zoom helpers */
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

	/* Download */
	const handleDownloadSVG = useCallback(() => {
		downloadText(svg, "diagram.svg", "image/svg+xml");
	}, [svg]);

	const handleDownloadMMD = useCallback(() => {
		downloadText(code, "diagram.mmd");
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

	/* Copy */
	const [copied, setCopied] = useState(false);
	const handleCopy = useCallback(async () => {
		if (await copyToClipboard(code)) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}, [code]);

	const shell = (
		<div
			ref={containerRef}
			className={cn(
				"markify-mermaid relative mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) overflow-hidden flex flex-col",
				showBackground &&
					"rounded-lg border border-(--markify-border) bg-(--markify-card)",
				fullscreen &&
					"h-[85dvh] w-[min(92vw,80rem)] rounded-xl shadow-2xl",
				className,
			)}
			data-engine={state.status === "success" ? state.engine : undefined}
			data-streaming={isStreaming || undefined}
			data-fullscreen={fullscreen || undefined}
		>
			{/* Header */}
			{showHeader && (
				<div className="flex items-center justify-between border-b border-(--markify-border) bg-(--markify-muted) px-4 py-1.5">
					<span className="font-mono text-xs text-(--markify-muted-fg)">
						mermaid
					</span>
					<div className="flex gap-1">
						<ActionButton
							onClick={handleCopy}
							copied={copied}
							title={copied ? "Copied" : "Copy"}
						>
							{copied ? (
								<Check className="size-3.5" />
							) : (
								<Copy className="size-3.5" />
							)}
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

						<ActionButton
							onClick={() => setFullscreen((f) => !f)}
							title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
						>
							{fullscreen ? (
								<Minimize className="size-3.5" />
							) : (
								<Maximize className="size-3.5" />
							)}
						</ActionButton>
					</div>
				</div>
			)}

			{/* Body */}
			<div
				ref={bodyRef}
				className={cn(
					"flex items-center justify-center overflow-hidden p-4 flex-1 select-none",
					(svg || state.status === "success") && "min-h-[120px]",
					fullscreen && "h-full w-full",
				)}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onDoubleClick={resetZoom}
				style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
			>
				{state.status === "loading" && !svg && (
					<div className="flex items-center gap-2 text-sm text-(--markify-muted-fg)">
						<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-(--markify-border) border-t-(--markify-fg)" />
						Rendering diagram…
					</div>
				)}

				{state.status === "error" && !svg && (
					<div className="flex flex-col items-center gap-2 p-4 text-center">
						<p className="text-sm text-(--markify-destructive)">
							Failed to render diagram
						</p>
						<p className="max-w-md text-xs text-(--markify-muted-fg)">
							{state.message}
						</p>
						<button
							onClick={handleRetry}
							className="cursor-pointer rounded bg-(--markify-primary) px-3 py-1 text-xs text-(--markify-primary-fg) transition-colors hover:bg-(--markify-primary-90)"
							type="button"
						>
							Retry
						</button>
						<details className="mt-2 w-full">
							<summary className="cursor-pointer text-xs text-(--markify-muted-fg) hover:text-(--markify-fg)">
								Show source
							</summary>
							<pre className="mt-2 overflow-x-auto rounded bg-(--markify-muted) p-2 text-left text-xs">
								<code>{code}</code>
							</pre>
						</details>
					</div>
				)}

				{svg && (
					<div
						ref={svgWrapperRef}
						className="markify-diagram transition-transform duration-75 ease-out motion-reduce:transition-none"
						style={{
							transform: `translate(${position.x}px, ${position.y}px) scale(${effectiveScale})`,
						}}
						dangerouslySetInnerHTML={{ __html: svg }}
					/>
				)}

				{state.status === "idle" && !svg && <div className="h-24" />}
			</div>

			{/* Zoom controls */}
			{svg && (
				<div
					className={cn(
						"absolute z-10 flex flex-col gap-1 rounded-md border border-(--markify-border) bg-(--markify-bg-80) p-1 supports-[backdrop-filter]:backdrop-blur-sm shadow-sm",
						"bottom-4 left-4",
					)}
				>
					<IconButton onClick={zoomIn} disabled={scale >= 5} title="Zoom in">
						<ZoomIn size={15} />
					</IconButton>
					<IconButton onClick={zoomOut} disabled={scale <= 0.3} title="Zoom out">
						<ZoomOut size={15} />
					</IconButton>
					<IconButton onClick={resetZoom} title="Reset zoom and pan">
						<RotateCcw size={15} />
					</IconButton>
				</div>
			)}

			{/* Zoom indicator */}
			{svg && scale !== 1 && (
				<div className="absolute bottom-4 right-4 flex items-center gap-1">
					<button
						onClick={resetZoom}
						className="cursor-pointer rounded bg-(--markify-bg-80) px-2 py-0.5 text-xs text-(--markify-muted-fg) backdrop-blur hover:text-(--markify-fg)"
						type="button"
					>
						Reset zoom
					</button>
					<span className="rounded bg-(--markify-bg-80) px-1.5 py-0.5 text-xs text-(--markify-muted-fg) backdrop-blur">
						{Math.round(effectiveScale * 100)}%
					</span>
				</div>
			)}
		</div>
	);

	/*
	 * Fullscreen escapes to <body>. A `position: fixed` box is trapped inside
	 * any ancestor that establishes a containing block — a transform, filter,
	 * backdrop-filter, or `contain` — and chat UIs are full of those (animated
	 * message shells, blurred toolbars). Portalling sidesteps the whole class
	 * of bug instead of fighting it with z-index.
	 */
	if (fullscreen && typeof document !== "undefined") {
		return createPortal(
			<div
				className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				onClick={() => setFullscreen(false)}
				role="dialog"
				aria-modal="true"
				aria-label="Diagram"
			>
				<div onClick={(e) => e.stopPropagation()} className="contents">
					{shell}
				</div>
			</div>,
			document.body,
		);
	}
	return shell;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Small parts
 * ═══════════════════════════════════════════════════════════════════════ */

function isDark(): boolean {
	if (typeof document === "undefined") return false;
	return (
		document.documentElement.classList.contains("dark") ||
		document.documentElement.dataset.theme === "dark"
	);
}

function IconButton({
	children,
	onClick,
	title,
	disabled,
}: {
	children: ReactNode;
	onClick: () => void;
	title?: string;
	disabled?: boolean;
}) {
	return (
		<button
			className="flex cursor-pointer items-center justify-center rounded p-1 text-(--markify-muted-fg) transition-colors hover:bg-(--markify-muted) hover:text-(--markify-fg) disabled:cursor-not-allowed disabled:opacity-50"
			disabled={disabled}
			onClick={onClick}
			title={title}
			type="button"
		>
			{children}
		</button>
	);
}

function ActionButton({
	children,
	onClick,
	copied,
	title,
}: {
	children: ReactNode;
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
					? "bg-(--markify-primary-10) text-(--markify-primary)"
					: "text-(--markify-muted-fg) hover:bg-(--markify-muted-fg-10) hover:text-(--markify-fg)",
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
					<div className="absolute right-0 top-full z-20 mt-1 min-w-[100px] overflow-hidden rounded-md border border-(--markify-border) bg-(--markify-popover) shadow-lg">
						<DropdownItem
							onClick={() => {
								onSVG();
								setOpen(false);
							}}
						>
							SVG
						</DropdownItem>
						<DropdownItem
							onClick={() => {
								onPNG();
								setOpen(false);
							}}
						>
							PNG
						</DropdownItem>
						<DropdownItem
							onClick={() => {
								onMMD();
								setOpen(false);
							}}
						>
							MMD
						</DropdownItem>
					</div>
				</>
			)}
		</div>
	);
}

function DropdownItem({
	onClick,
	children,
}: {
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			onClick={onClick}
			className="flex w-full cursor-pointer px-3 py-2 text-left text-xs text-(--markify-popover-fg) transition-colors hover:bg-(--markify-accent)"
			type="button"
		>
			{children}
		</button>
	);
}

export const MermaidBlock = memo(MermaidBlockInner);
