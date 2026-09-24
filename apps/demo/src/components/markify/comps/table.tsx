"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Copy, Check, Download } from "lucide-react";
import { cn, downloadBlob } from "./_lib";

/* ── Table options ─────────────────────────────────────────────────────── */

export interface TableOptions {
  showCopyButton?: boolean;
  downloadFormats?: ("csv" | "tsv" | "md")[];
  scrollable?: boolean;
}

export const defaultTableOptions: TableOptions = {
  showCopyButton: true,
  downloadFormats: [],
  scrollable: true,
};

export const TableOptionsContext = createContext<TableOptions>(defaultTableOptions);

export function useTableOptions(): TableOptions {
  return useContext(TableOptionsContext);
}

/* ── Export helpers ────────────────────────────────────────────────────── */

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
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join("\n"))].join("\n");
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
  downloadBlob(new Blob([f.fmt(headers, rows)], { type: f.mime }), `table.${f.ext}`);
}

/* ── Components ────────────────────────────────────────────────────────── */

export function Table({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
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
  const showActionsBar = opts.showCopyButton || hasDownloads;

  const actionBtnClass = cn(
    "rounded-md border border-(--markify-border) bg-(--markify-bg-90) p-1.5 text-(--markify-muted-fg) shadow-sm backdrop-blur transition-colors hover:text-(--markify-fg)",
  );

  return (
    <div
      className={cn(
        "group relative mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) overflow-hidden rounded-lg border border-(--markify-border) bg-(--markify-card)",
        className,
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActionsBar && (
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
                actionBtnClass,
                copied && "border-(--markify-primary-20) bg-(--markify-primary-10) text-(--markify-primary)",
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
              className={actionBtnClass}
              type="button"
              title={`Download as ${fmt.toUpperCase()}`}
            >
              <Download className="size-4" />
              <span className="ml-1 text-xs font-medium">{fmt.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
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

export function THead({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <thead
      className={cn("border-b border-(--markify-border) bg-(--markify-muted-50) text-(--markify-fg)", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TBody({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <tbody className={cn("divide-y divide-(--markify-border)", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TR({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <tr className={cn("transition-colors hover:bg-(--markify-muted-30)", className)} {...props}>
      {children}
    </tr>
  );
}

export function TH({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <th
      className={cn("border-r border-(--markify-border) px-4 py-2 text-left font-medium last:border-r-0", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <td
      className={cn("border-r border-(--markify-border) px-4 py-2 text-(--markify-muted-fg) last:border-r-0", className)}
      {...props}
    >
      {children}
    </td>
  );
}
