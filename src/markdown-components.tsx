"use client";

import { createContext, memo, useContext, useState, useRef, useCallback, useMemo, isValidElement, lazy, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Copy, Check, Download, Play } from "lucide-react";
import { PencilSimple, Flame, Warning, Info, CheckCircle, Question, ListChecks, CheckSquare, XCircle, WarningDiamond, Bug, Flask, Quotes } from "@phosphor-icons/react";
import { cn } from "./utils";
import { getText, stripCalloutMarker } from "./callout";
import { remarkFixKaTeXUnicode } from "./fix-katex-unicode";
import { CodeBlock } from "./CodeBlock";
import type { Components } from "react-markdown";
import type { HljsTheme } from "./themes";
import type { MarkifyMermaidConfig } from "./MermaidBlock";

// Lazy-loaded so chess.js + react-chessboard are only fetched when a
// pgn/chess code block is actually rendered, keeping the core bundle lean.
const LazyChessBlock = lazy(() =>
  import("./chess/ChessBlock").then((m) => ({ default: m.ChessBlock })),
);

const LazyFenBoard = lazy(() =>
  import("./chess/FenBoard").then((m) => ({ default: m.FenBoard })),
);

const LazyMermaidBlock = lazy(() =>
  import("./MermaidBlock").then((m) => ({ default: m.MermaidBlock })),
);

function ChessFallback() {
  return (
    <div className="mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) flex items-center gap-2 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
      Loading chess viewer…
    </div>
  );
}

function MermaidFallback() {
  return (
    <div className="mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) flex items-center gap-2 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
      Loading mermaid diagram…
    </div>
  );
}

const katexOptions = {
  strict: false,
  throwOnError: false,
};

const baseRemarkPlugins: any[] = [remarkGfm, remarkMath, remarkFixKaTeXUnicode];
const baseRehypePlugins: any[] = [[rehypeKatex, katexOptions]];

export { baseRemarkPlugins, baseRehypePlugins };

export interface TableOptions {
  showCopyButton?: boolean;
  downloadFormats?: ("csv" | "tsv" | "md")[];
  scrollable?: boolean;
}

const defaultTableOptions: TableOptions = {
  showCopyButton: true,
  downloadFormats: [],
  scrollable: true,
};

const TableOptionsContext = createContext<TableOptions>(defaultTableOptions);

export function useTableOptions(): TableOptions {
  return useContext(TableOptionsContext);
}

export { TableOptionsContext };

// ── Table helpers ────────────────────────────────────────────────────

function getTableData(table: HTMLTableElement) {
  const thRows = table.querySelectorAll("th");
  const headers = Array.from(thRows).map((th) => (th as HTMLElement).innerText.trim());
  const dataRows = table.querySelectorAll("tbody tr");
  const rows = Array.from(dataRows).map((tr) =>
    Array.from(tr.querySelectorAll("td")).map((td) => (td as HTMLElement).innerText.trim()),
  );
  return { headers, rows };
}

function toCSV(headers: string[], rows: string[][]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

function toTSV(headers: string[], rows: string[][]): string {
  return [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
}

function toMD(headers: string[], rows: string[][]): string {
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  return [
    `| ${headers.join(" | ")} |`,
    sep,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");
}

const FORMATTERS: Record<string, { ext: string; mime: string; fmt: (h: string[], r: string[][]) => string }> = {
  csv: { ext: "csv", mime: "text/csv", fmt: toCSV },
  tsv: { ext: "tsv", mime: "text/tab-separated-values", fmt: toTSV },
  md: { ext: "md", mime: "text/markdown", fmt: toMD },
};

function downloadTable(table: HTMLTableElement, format: "csv" | "tsv" | "md") {
  const { headers, rows } = getTableData(table);
  const f = FORMATTERS[format];
  if (!f) return;
  const content = f.fmt(headers, rows);
  const blob = new Blob([content], { type: f.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `table.${f.ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Components ───────────────────────────────────────────────────────

function Heading({ level, children, ...props }: { level: 1 | 2 | 3 | 4 | 5 | 6; children?: React.ReactNode }) {
  const styles: Record<number, string> = {
    1: "text-[2rem] font-bold mt-[calc(var(--markify-gap-lg)_*_1.15)] mb-(--markify-gap)",
    2: "text-2xl font-semibold mt-[calc(var(--markify-gap-lg)_*_0.85)] mb-(--markify-gap)",
    3: "text-xl font-medium mt-[calc(var(--markify-gap-lg)_*_0.72)] mb-(--markify-gap)",
    4: "text-lg font-medium mt-[calc(var(--markify-gap-lg)_*_0.6)] mb-(--markify-gap)",
    5: "text-base font-medium mt-[calc(var(--markify-gap-lg)_*_0.5)] mb-(--markify-gap)",
    6: "text-sm font-medium mt-[calc(var(--markify-gap-lg)_*_0.45)] mb-(--markify-gap)",
  };
  const Tag = `h${level}` as React.ElementType;
  return (
    <Tag className={cn(styles[level], "text-foreground")} {...props}>
      {children}
    </Tag>
  );
}

function hasElements(node: React.ReactNode): boolean {
  if (isValidElement(node)) return true;
  if (Array.isArray(node)) {
    return node.some(hasElements);
  }
  return false;
}

function Paragraph({ children }: { children?: React.ReactNode }) {
  const content = children ? getText(children).trim() : "";
  if (!content && !hasElements(children)) return null;
  const onlyImage = hasElements(children) && !content;
  return <p className={cn("mb-(--markify-gap) last:mb-0 leading-relaxed text-base text-foreground/90 whitespace-pre-wrap", onlyImage && "text-center")}>{children}</p>;
}

function Link({ href, children, ...props }: { href?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors break-all"
      {...props}
    >
      {children}
    </a>
  );
}

function InlineCode({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export interface YouTubeVideo {
  id: string;
  start?: number;
}

export function parseYouTubeId(src: string): YouTubeVideo | null {
  if (!src) return null;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (!/^(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(host)) return null;

  const path = url.pathname;
  let id: string | null = null;
  if (host === "youtu.be") {
    id = path.replace(/^\//, "").split("/")[0];
  } else if (path.startsWith("/shorts/") || path.startsWith("/embed/") || path.startsWith("/live/")) {
    id = path.split("/")[2];
  } else if (path.startsWith("/watch")) {
    id = url.searchParams.get("v");
  }
  if (!id) return null;

  const raw = url.searchParams.get("start") ?? url.searchParams.get("t");
  let start: number | undefined;
  if (raw) {
    const seconds = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (!Number.isNaN(seconds) && seconds > 0) start = seconds;
  }
  return { id, start };
}

function YouTubeEmbed({ src, video, streaming }: { src: string; video: YouTubeVideo; streaming?: boolean }) {
  if (streaming) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Play className="size-3.5" />
        Watch on YouTube
      </a>
    );
  }
  const query = video.start ? `?start=${video.start}` : "";
  return (
    <span className="relative my-2 block aspect-video w-full overflow-hidden rounded-lg border border-border">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.id}${query}`}
        title="YouTube video player"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </span>
  );
}

function Image({ src, alt, youtubeEnabled, isStreaming, ...props }: { src?: string; alt?: string; youtubeEnabled?: boolean; isStreaming?: boolean }) {
  const video = youtubeEnabled && src ? parseYouTubeId(src) : null;
  if (video) {
    return <YouTubeEmbed src={src!} video={video} streaming={isStreaming} />;
  }
  return (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className="inline-block max-w-full h-auto rounded-lg shadow-md align-middle"
      {...props}
    />
  );
}

function Blockquote({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) {
  const { type, children: stripped } = stripCalloutMarker(children);

  if (type) {
    const styles = {
      NOTE: "border-l-blue-500 bg-blue-500/5",
      TIP: "border-l-emerald-500 bg-emerald-500/5",
      HINT: "border-l-emerald-500 bg-emerald-500/5",
      IMPORTANT: "border-l-violet-500 bg-violet-500/5",
      WARNING: "border-l-amber-500 bg-amber-500/5",
      CAUTION: "border-l-orange-500 bg-orange-500/5",
      ATTENTION: "border-l-amber-500 bg-amber-500/5",
      INFO: "border-l-sky-500 bg-sky-500/5",
      SUCCESS: "border-l-green-500 bg-green-500/5",
      QUESTION: "border-l-indigo-500 bg-indigo-500/5",
      ABSTRACT: "border-l-slate-500 bg-slate-500/5",
      TODO: "border-l-teal-500 bg-teal-500/5",
      FAILURE: "border-l-red-500 bg-red-500/5",
      DANGER: "border-l-rose-500 bg-rose-500/5",
      BUG: "border-l-red-500 bg-red-500/5",
      EXAMPLE: "border-l-purple-500 bg-purple-500/5",
      QUOTE: "border-l-slate-500 bg-slate-500/5",
    };
    const iconColors = {
      NOTE: "text-blue-500",
      TIP: "text-emerald-500",
      HINT: "text-emerald-500",
      IMPORTANT: "text-violet-500",
      WARNING: "text-amber-500",
      CAUTION: "text-orange-500",
      ATTENTION: "text-amber-500",
      INFO: "text-sky-500",
      SUCCESS: "text-green-500",
      QUESTION: "text-indigo-500",
      ABSTRACT: "text-slate-500",
      TODO: "text-teal-500",
      FAILURE: "text-red-500",
      DANGER: "text-rose-500",
      BUG: "text-red-500",
      EXAMPLE: "text-purple-500",
      QUOTE: "text-slate-500",
    };
    const titles = {
      NOTE: "Note",
      TIP: "Tip",
      HINT: "Hint",
      IMPORTANT: "Important",
      WARNING: "Warning",
      CAUTION: "Caution",
      ATTENTION: "Attention",
      INFO: "Info",
      SUCCESS: "Success",
      QUESTION: "Question",
      ABSTRACT: "Abstract",
      TODO: "Todo",
      FAILURE: "Failure",
      DANGER: "Danger",
      BUG: "Bug",
      EXAMPLE: "Example",
      QUOTE: "Quote",
    };
    const icons = {
      NOTE: PencilSimple,
      TIP: Flame,
      HINT: Flame,
      IMPORTANT: Flame,
      WARNING: Warning,
      CAUTION: Warning,
      ATTENTION: Warning,
      INFO: Info,
      SUCCESS: CheckCircle,
      QUESTION: Question,
      ABSTRACT: ListChecks,
      TODO: CheckSquare,
      FAILURE: XCircle,
      DANGER: WarningDiamond,
      BUG: Bug,
      EXAMPLE: Flask,
      QUOTE: Quotes,
    };
    const Icon = icons[type];
    return (
      <div className={cn("mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) rounded-lg border-l-4 p-4", styles[type])} {...props}>
        <strong className={cn("mb-1 flex items-center gap-2 font-bold", iconColors[type])}>
          <Icon size={16} weight="duotone" aria-hidden />
          {titles[type]}
        </strong>
        {stripped}
      </div>
    );
  }

  return (
    <blockquote
      className="mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) border-l-4 border-muted-foreground/30 pl-4 text-muted-foreground italic"
      {...props}
    >
      {children}
    </blockquote>
  );
}

function Table({ children, ...props }: { children: React.ReactNode }) {
  const opts = useTableOptions();
  const tableRef = useRef<HTMLTableElement>(null);
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!tableRef.current) return;
    const { headers, rows } = getTableData(tableRef.current);
    const md = toMD(headers, rows);
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleDownload = useCallback((format: "csv" | "tsv" | "md") => {
    if (!tableRef.current) return;
    downloadTable(tableRef.current, format);
  }, []);

  const hasDownloads = (opts.downloadFormats?.length ?? 0) > 0;

  return (
    <div
      className="group relative mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) overflow-hidden rounded-lg border border-border bg-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          "absolute right-1 top-1 z-10 flex items-center gap-1 transition-all",
          showActions ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        {opts.showCopyButton && (
          <button
            onClick={handleCopy}
            className={cn(
              "rounded-md border border-border bg-background/90 p-1.5 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground",
              copied && "border-primary/20 bg-primary/10 text-primary",
            )}
            type="button"
            title={copied ? "Copied" : "Copy as Markdown"}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        )}
        {opts.downloadFormats?.map((fmt) => (
          <button
            key={fmt}
            onClick={() => handleDownload(fmt)}
            className="rounded-md border border-border bg-background/90 p-1.5 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
            type="button"
            title={`Download as ${fmt.toUpperCase()}`}
          >
            <Download className="size-4" />
            <span className="ml-1 text-xs font-medium">{fmt.toUpperCase()}</span>
          </button>
        ))}
      </div>
      {opts.scrollable ? (
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full border-collapse text-sm" {...props}>
            {children}
          </table>
        </div>
      ) : (
        <table ref={tableRef} className="w-full border-collapse text-sm" {...props}>
          {children}
        </table>
      )}
    </div>
  );
}

function THead({ children, ...props }: { children: React.ReactNode }) {
  return (
    <thead
      className="border-b border-border bg-muted/50 text-foreground"
      {...props}
    >
      {children}
    </thead>
  );
}

function TBody({ children, ...props }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-border" {...props}>
      {children}
    </tbody>
  );
}

function TR({ children, ...props }: { children: React.ReactNode }) {
  return (
    <tr className="transition-colors hover:bg-muted/30" {...props}>
      {children}
    </tr>
  );
}

function TH({ children, ...props }: { children: React.ReactNode }) {
  return (
    <th
      className="border-r border-border px-4 py-2 text-left font-medium last:border-r-0"
      {...props}
    >
      {children}
    </th>
  );
}

function TD({ children, ...props }: { children: React.ReactNode }) {
  return (
    <td
      className="border-r border-border px-4 py-2 text-muted-foreground last:border-r-0"
      {...props}
    >
      {children}
    </td>
  );
}

function getCodeChildren(node: React.ReactNode): React.ReactNode {
  if (!node || typeof node !== "object") return node;
  const children = (node as any).props?.children;
  return children;
}

function extractLanguage(node: React.ReactNode, className?: string): string {
  const childClassName = (node as any)?.props?.className || "";
  const match = /language-(\w+)/.exec(childClassName || className || "");
  return match ? match[1] : "";
}

function List({ children, ordered, ...props }: { children?: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) ml-6",
        ordered ? "list-decimal" : "list-disc",
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

function ListItem({ children, ...props }: { children: React.ReactNode }) {
  return (
    <li className="mb-(--markify-gap-sm) leading-relaxed text-foreground/90 [&>ul]:my-1 [&>ol]:my-1" {...props}>
      {children}
    </li>
  );
}

function Hr() {
  return <hr className="mt-(--markify-gap) mb-(--markify-gap) border-border" />;
}

function PreWithWorker({ worker, hljsTheme, hljsCustomCss, hljsThemeUrl, hljsThemeBg, codeBlockClassName, codeFontFamily, mermaidConfig, chessEnabled = false, isStreaming = false, renderers, ...props }: { worker: boolean; hljsTheme?: HljsTheme; hljsCustomCss?: string; hljsThemeUrl?: string; hljsThemeBg?: boolean; codeBlockClassName?: string; codeFontFamily?: string; mermaidConfig?: MarkifyMermaidConfig; chessEnabled?: boolean; isStreaming?: boolean; renderers?: Renderers; children?: React.ReactNode; className?: string }) {
  const lang = extractLanguage(props.children, props.className);
  const rawCode = getCodeChildren(props.children);
  const codeText = typeof rawCode === "string" ? rawCode : getText(rawCode);

  if (lang === "mermaid") {
    if (renderers?.mermaid) return <>{renderers.mermaid({ code: codeText, isStreaming })}</>;
    const resolvedConfig = mermaidConfig?.theme
      ? mermaidConfig
      : { ...mermaidConfig, theme: hljsTheme === "dark" ? ("dark" as const) : ("default" as const) };
    return (
      <Suspense fallback={<MermaidFallback />}>
        <LazyMermaidBlock code={codeText} config={resolvedConfig} />
      </Suspense>
    );
  }

  if (chessEnabled && (lang === "pgn" || lang === "chess")) {
    if (renderers?.chess) return <>{renderers.chess({ code: codeText, isStreaming })}</>;
    return (
      <Suspense fallback={<ChessFallback />}>
        <LazyChessBlock code={codeText} isStreaming={isStreaming} />
      </Suspense>
    );
  }

  if (chessEnabled && lang === "fen") {
    if (renderers?.fen) return <>{renderers.fen({ code: codeText, isStreaming })}</>;
    return (
      <Suspense fallback={<ChessFallback />}>
        <LazyFenBoard fen={codeText} isStreaming={isStreaming} />
      </Suspense>
    );
  }

  if (renderers?.code) {
    return <>{renderers.code({ children: props.children, className: props.className, language: lang })}</>;
  }

  return (
    <CodeBlock className={props.className} language={lang} worker={worker} hljsTheme={hljsTheme} hljsCustomCss={hljsCustomCss} hljsThemeUrl={hljsThemeUrl} hljsThemeBg={hljsThemeBg} codeBlockClassName={codeBlockClassName} codeFontFamily={codeFontFamily}>
      {props.children}
    </CodeBlock>
  );
}

export interface BlockRendererArgs {
  code: string;
  isStreaming: boolean;
}

export interface CodeRendererProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

export interface Renderers {
  /** Override the mermaid block renderer. */
  mermaid?: (args: BlockRendererArgs) => React.ReactNode;
  /** Override the PGN / chess block renderer. */
  chess?: (args: BlockRendererArgs) => React.ReactNode;
  /** Override the FEN block renderer. */
  fen?: (args: BlockRendererArgs) => React.ReactNode;
  /** Override the default code block renderer for all other languages. */
  code?: (props: CodeRendererProps) => React.ReactNode;
}

export interface MarkdownComponentOptions {
  codeBlockWorker?: boolean;
  table?: TableOptions;
  hljsTheme?: HljsTheme;
  hljsCustomCss?: string;
  hljsThemeUrl?: string;
  hljsThemeBg?: boolean;
  codeBlockClassName?: string;
  codeFontFamily?: string;
  mermaidConfig?: MarkifyMermaidConfig;
  chessEnabled?: boolean;
  youtubeEnabled?: boolean;
  isStreaming?: boolean;
  renderers?: Renderers;
}

export function createMarkdownComponents(opts?: MarkdownComponentOptions): Components {
  const worker = opts?.codeBlockWorker ?? false;
  const hljsTheme = opts?.hljsTheme ?? "dark";
  const hljsCustomCss = opts?.hljsCustomCss;
  const hljsThemeUrl = opts?.hljsThemeUrl;
  const hljsThemeBg = opts?.hljsThemeBg ?? false;
  const codeBlockClassName = opts?.codeBlockClassName;
  const codeFontFamily = opts?.codeFontFamily;
  const mermaidConfig = opts?.mermaidConfig;
  const chessEnabled = opts?.chessEnabled ?? false;
  const youtubeEnabled = opts?.youtubeEnabled ?? false;
  const isStreaming = opts?.isStreaming ?? false;
  const renderers = opts?.renderers;
  const components: Components = {
    style: () => null as any,
    script: () => null as any,
    h1: memo(({ children, ...props }) => <Heading level={1} {...props}>{children}</Heading>),
    h2: memo(({ children, ...props }) => <Heading level={2} {...props}>{children}</Heading>),
    h3: memo(({ children, ...props }) => <Heading level={3} {...props}>{children}</Heading>),
    h4: memo(({ children, ...props }) => <Heading level={4} {...props}>{children}</Heading>),
    h5: memo(({ children, ...props }) => <Heading level={5} {...props}>{children}</Heading>),
    h6: memo(({ children, ...props }) => <Heading level={6} {...props}>{children}</Heading>),
    p: Paragraph,
    a: Link as any,
    code: InlineCode as any,
    img: (props) => <Image {...props} youtubeEnabled={youtubeEnabled} isStreaming={isStreaming} />,
    blockquote: Blockquote as any,
    table: Table as any,
    thead: THead as any,
    tbody: TBody as any,
    tr: TR as any,
    th: TH as any,
    td: TD as any,
    pre: (props) => <PreWithWorker worker={worker} hljsTheme={hljsTheme} hljsCustomCss={hljsCustomCss} hljsThemeUrl={hljsThemeUrl} hljsThemeBg={hljsThemeBg} codeBlockClassName={codeBlockClassName} codeFontFamily={codeFontFamily} mermaidConfig={mermaidConfig} chessEnabled={chessEnabled} isStreaming={isStreaming} renderers={renderers} {...props} />,
    ol: (props) => <List ordered {...props} />,
    ul: (props) => <List {...props} />,
    li: ListItem as any,
    hr: Hr as any,
  };
  return components;
}

export { Image as ImageComponent };
