"use client";

import { createContext, memo, useContext, useState, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Copy, Check, Download } from "lucide-react";
import { cn } from "./utils";
import { parseCallout, getText } from "./callout";
import { remarkFixKaTeXUnicode } from "./fix-katex-unicode";
import { CodeBlock } from "./CodeBlock";
import { MermaidBlock } from "./MermaidBlock";
import type { Components } from "react-markdown";
import type { HljsTheme } from "./themes";

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
    1: "text-3xl font-bold mt-8 mb-3 pb-2 border-b border-border",
    2: "text-2xl font-semibold mt-7 mb-3 pb-1.5 border-b border-border",
    3: "text-xl font-medium mt-6 mb-3 pb-1 border-b border-border",
    4: "text-lg font-medium mt-5 mb-3 pb-1 border-b border-border",
    5: "text-base font-medium mt-4 mb-3 pb-1 border-b border-border",
    6: "text-sm font-medium mt-3 mb-3 pb-1 border-b border-border",
  };
  const Tag = `h${level}` as React.ElementType;
  return (
    <Tag className={cn(styles[level], "text-foreground")} {...props}>
      {children}
    </Tag>
  );
}

function Paragraph({ children }: { children?: React.ReactNode }) {
  const content = children ? getText(children).trim() : "";
  if (!content) return null;
  return <p className="mb-3 last:mb-0 leading-relaxed text-base text-foreground/90">{children}</p>;
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

function Image({ src, alt, ...props }: { src?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className="max-w-full h-auto rounded-lg shadow-md mx-auto mb-3"
      {...props}
    />
  );
}

function Blockquote({ children, ...props }: { children: React.ReactNode }) {
  const text = getText(children);
  const { type, content } = parseCallout(text);

  if (type) {
    const styles = {
      NOTE: "border-l-blue-500 bg-blue-500/5",
      WARNING: "border-l-amber-500 bg-amber-500/5",
      TIP: "border-l-emerald-500 bg-emerald-500/5",
    };
    const titles = {
      NOTE: "Note",
      WARNING: "Warning",
      TIP: "Tip",
    };
    return (
      <div className={cn("mb-3 rounded-lg border-l-4 p-4", styles[type])} {...props}>
        <strong className="mb-1 block font-semibold text-foreground">{titles[type]}</strong>
        <ReactMarkdown remarkPlugins={baseRemarkPlugins} rehypePlugins={baseRehypePlugins}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <blockquote
      className="mb-3 border-l-4 border-muted-foreground/30 pl-4 text-muted-foreground italic"
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
      className="group relative mb-3 overflow-hidden rounded-lg border border-border bg-card"
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
        "mb-3 ml-6",
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
    <li className="mb-1 leading-relaxed text-foreground/90 [&>ul]:my-1 [&>ol]:my-1" {...props}>
      {children}
    </li>
  );
}

function Hr() {
  return <hr className="mb-3 border-border" />;
}

function PreWithWorker({ worker, hljsTheme, hljsCustomCss, hljsThemeUrl, hljsThemeBg, codeBlockClassName, codeFontFamily, ...props }: { worker: boolean; hljsTheme?: HljsTheme; hljsCustomCss?: string; hljsThemeUrl?: string; hljsThemeBg?: boolean; codeBlockClassName?: string; codeFontFamily?: string; children?: React.ReactNode; className?: string }) {
  const lang = extractLanguage(props.children, props.className);

  if (lang === "mermaid") {
    const rawCode = getCodeChildren(props.children);
    const codeText = typeof rawCode === "string" ? rawCode : getText(rawCode);
    return <MermaidBlock code={codeText} />;
  }

  return (
    <CodeBlock className={props.className} language={lang} worker={worker} hljsTheme={hljsTheme} hljsCustomCss={hljsCustomCss} hljsThemeUrl={hljsThemeUrl} hljsThemeBg={hljsThemeBg} codeBlockClassName={codeBlockClassName} codeFontFamily={codeFontFamily}>
      {props.children}
    </CodeBlock>
  );
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
}

export function createMarkdownComponents(opts?: MarkdownComponentOptions): Components {
  const worker = opts?.codeBlockWorker ?? false;
  const hljsTheme = opts?.hljsTheme ?? "dark";
  const hljsCustomCss = opts?.hljsCustomCss;
  const hljsThemeUrl = opts?.hljsThemeUrl;
  const hljsThemeBg = opts?.hljsThemeBg ?? false;
  const codeBlockClassName = opts?.codeBlockClassName;
  const codeFontFamily = opts?.codeFontFamily;
  return {
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
    img: Image as any,
    blockquote: Blockquote as any,
    table: Table as any,
    thead: THead as any,
    tbody: TBody as any,
    tr: TR as any,
    th: TH as any,
    td: TD as any,
    pre: (props) => <PreWithWorker worker={worker} hljsTheme={hljsTheme} hljsCustomCss={hljsCustomCss} hljsThemeUrl={hljsThemeUrl} hljsThemeBg={hljsThemeBg} codeBlockClassName={codeBlockClassName} codeFontFamily={codeFontFamily} {...props} />,
    ol: (props) => <List ordered {...props} />,
    ul: (props) => <List {...props} />,
    li: ListItem as any,
    hr: Hr as any,
  };
}

export { Image as ImageComponent };
