"use client";

import { useState, useRef, useEffect, useMemo, useCallback, memo, type ReactNode } from "react";
import hljs from "highlight.js/lib/core";
import type { LanguageFn } from "highlight.js";
import { Copy, Check, WrapText, ChevronDown } from "lucide-react";
import { cn, copyToClipboard } from "./_lib";

/* ── hljs theme (Atom) — injected once as a <style> tag ────────────────── */

const ATOM_DARK_CSS = `
.hljs { color: #abb2bf; background: #282c34; }
.hljs-comment, .hljs-quote { color: #5c6370; font-style: italic; }
.hljs-doctag, .hljs-keyword, .hljs-formula { color: #c678dd; }
.hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst { color: #e06c75; }
.hljs-literal { color: #56b6c2; }
.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta .hljs-string { color: #98c379; }
.hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-type, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-number { color: #d19a66; }
.hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title { color: #61aeee; }
.hljs-built_in, .hljs-title.class_, .hljs-class .hljs-title { color: #e6c07b; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
.hljs-link { text-decoration: underline; }
`;

const ATOM_LIGHT_CSS = `
.hljs { color: #383a42; background: #fafafa; }
.hljs-comment, .hljs-quote { color: #a0a1a7; font-style: italic; }
.hljs-doctag, .hljs-keyword, .hljs-formula { color: #a626a4; }
.hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst { color: #e45649; }
.hljs-literal { color: #0184bb; }
.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta .hljs-string { color: #50a14f; }
.hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-type, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-number { color: #986801; }
.hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title { color: #4078f2; }
.hljs-built_in, .hljs-title.class_, .hljs-class .hljs-title { color: #c18401; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
.hljs-link { text-decoration: underline; }
`;

export type HljsTheme = "dark" | "light";

function getThemeCss(theme: HljsTheme): string {
  return theme === "dark" ? ATOM_DARK_CSS : ATOM_LIGHT_CSS;
}

export function injectHljsTheme(theme?: HljsTheme, customCss?: string) {
  if (typeof document === "undefined") return;
  const id = "markify-hljs-theme";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = customCss || getThemeCss(theme ?? "dark");
  document.head.appendChild(style);
}

/* ── Lazy language loading ─────────────────────────────────────────────── */

type LanguageLoader = () => Promise<{ default: LanguageFn }>;

const LANGUAGE_MAP: Record<string, { loader: LanguageLoader; aliases?: string[] }> = {
  xml: { loader: () => import("highlight.js/lib/languages/xml"), aliases: ["html"] },
  css: { loader: () => import("highlight.js/lib/languages/css"), aliases: ["less"] },
  scss: { loader: () => import("highlight.js/lib/languages/scss") },
  javascript: { loader: () => import("highlight.js/lib/languages/javascript"), aliases: ["js", "jsx"] },
  typescript: { loader: () => import("highlight.js/lib/languages/typescript"), aliases: ["ts", "tsx"] },
  python: { loader: () => import("highlight.js/lib/languages/python"), aliases: ["py"] },
  bash: { loader: () => import("highlight.js/lib/languages/bash"), aliases: ["sh", "zsh"] },
  json: { loader: () => import("highlight.js/lib/languages/json") },
  sql: { loader: () => import("highlight.js/lib/languages/sql") },
  rust: { loader: () => import("highlight.js/lib/languages/rust"), aliases: ["rs"] },
  go: { loader: () => import("highlight.js/lib/languages/go") },
  csharp: { loader: () => import("highlight.js/lib/languages/csharp"), aliases: ["cs"] },
  cpp: { loader: () => import("highlight.js/lib/languages/cpp"), aliases: ["c", "h"] },
  java: { loader: () => import("highlight.js/lib/languages/java") },
  php: { loader: () => import("highlight.js/lib/languages/php") },
  ruby: { loader: () => import("highlight.js/lib/languages/ruby"), aliases: ["rb"] },
  yaml: { loader: () => import("highlight.js/lib/languages/yaml"), aliases: ["yml"] },
  markdown: { loader: () => import("highlight.js/lib/languages/markdown"), aliases: ["md"] },
  diff: { loader: () => import("highlight.js/lib/languages/diff") },
  dart: { loader: () => import("highlight.js/lib/languages/dart") },
  kotlin: { loader: () => import("highlight.js/lib/languages/kotlin"), aliases: ["kt"] },
  swift: { loader: () => import("highlight.js/lib/languages/swift") },
  lua: { loader: () => import("highlight.js/lib/languages/lua") },
  r: { loader: () => import("highlight.js/lib/languages/r") },
  matlab: { loader: () => import("highlight.js/lib/languages/matlab") },
  perl: { loader: () => import("highlight.js/lib/languages/perl") },
  haskell: { loader: () => import("highlight.js/lib/languages/haskell"), aliases: ["hs"] },
  elixir: { loader: () => import("highlight.js/lib/languages/elixir") },
  erlang: { loader: () => import("highlight.js/lib/languages/erlang") },
  clojure: { loader: () => import("highlight.js/lib/languages/clojure") },
  scala: { loader: () => import("highlight.js/lib/languages/scala") },
  groovy: { loader: () => import("highlight.js/lib/languages/groovy") },
  objectivec: { loader: () => import("highlight.js/lib/languages/objectivec") },
  nix: { loader: () => import("highlight.js/lib/languages/nix") },
  dockerfile: { loader: () => import("highlight.js/lib/languages/dockerfile"), aliases: ["docker"] },
  makefile: { loader: () => import("highlight.js/lib/languages/makefile") },
  ini: { loader: () => import("highlight.js/lib/languages/ini") },
  http: { loader: () => import("highlight.js/lib/languages/http") },
  graphql: { loader: () => import("highlight.js/lib/languages/graphql") },
  latex: { loader: () => import("highlight.js/lib/languages/latex"), aliases: ["tex"] },
  powershell: { loader: () => import("highlight.js/lib/languages/powershell"), aliases: ["ps1"] },
  nginx: { loader: () => import("highlight.js/lib/languages/nginx") },
  properties: { loader: () => import("highlight.js/lib/languages/properties") },
  protobuf: { loader: () => import("highlight.js/lib/languages/protobuf") },
};

const loadingLanguages = new Set<string>();
const registeredLanguages = new Set<string>();

const aliasToCanonical: Record<string, string> = {};
for (const [canonical, config] of Object.entries(LANGUAGE_MAP)) {
  aliasToCanonical[canonical] = canonical;
  if (config.aliases) {
    for (const alias of config.aliases) {
      aliasToCanonical[alias] = canonical;
    }
  }
}

export function getCanonicalName(lang: string): string | null {
  return aliasToCanonical[lang.toLowerCase()] ?? null;
}

export async function ensureLanguage(lang: string): Promise<boolean> {
  const canonical = getCanonicalName(lang);
  if (!canonical) return false;
  if (registeredLanguages.has(canonical)) return true;
  if (loadingLanguages.has(canonical)) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (registeredLanguages.has(canonical)) resolve();
        else setTimeout(check, 10);
      };
      check();
    });
    return true;
  }

  const config = LANGUAGE_MAP[canonical];
  if (!config) return false;

  loadingLanguages.add(canonical);
  try {
    const module = await config.loader();
    hljs.registerLanguage(canonical, module.default);
    registeredLanguages.add(canonical);
    return true;
  } catch {
    return false;
  } finally {
    loadingLanguages.delete(canonical);
  }
}

export const ALL_LANGUAGES = Object.keys(LANGUAGE_MAP);

export const DEFAULT_LANGUAGES = [
  "xml", "css", "javascript", "typescript", "python",
  "bash", "json", "sql", "rust", "go",
  "csharp", "cpp", "java", "php", "ruby",
  "yaml", "markdown", "diff", "dart", "kotlin",
];

export function preloadLanguages(langs: string[]): void {
  for (const lang of langs) {
    ensureLanguage(lang);
  }
}

/* ── Language badge metadata ───────────────────────────────────────────── */

const LANG_META: Record<string, { label: string; color: string }> = {
  js: { label: "JavaScript", color: "#f7df1e" },
  javascript: { label: "JavaScript", color: "#f7df1e" },
  jsx: { label: "JSX", color: "#61dafb" },
  tsx: { label: "TSX", color: "#61dafb" },
  ts: { label: "TypeScript", color: "#3178c6" },
  typescript: { label: "TypeScript", color: "#3178c6" },
  py: { label: "Python", color: "#3572a5" },
  python: { label: "Python", color: "#3572a5" },
  rust: { label: "Rust", color: "#dea584" },
  go: { label: "Go", color: "#00acd7" },
  java: { label: "Java", color: "#b07219" },
  cpp: { label: "C++", color: "#f34b7d" },
  c: { label: "C", color: "#aaaaaa" },
  cs: { label: "C#", color: "#239120" },
  rb: { label: "Ruby", color: "#cc342d" },
  ruby: { label: "Ruby", color: "#cc342d" },
  php: { label: "PHP", color: "#777bb4" },
  swift: { label: "Swift", color: "#fa7343" },
  kotlin: { label: "Kotlin", color: "#7f52ff" },
  sh: { label: "Shell", color: "#89e051" },
  bash: { label: "Bash", color: "#89e051" },
  zsh: { label: "Zsh", color: "#89e051" },
  html: { label: "HTML", color: "#e34c26" },
  css: { label: "CSS", color: "#8a4baf" },
  scss: { label: "SCSS", color: "#c6538c" },
  json: { label: "JSON", color: "#cbcb41" },
  yaml: { label: "YAML", color: "#cb171e" },
  yml: { label: "YAML", color: "#cb171e" },
  toml: { label: "TOML", color: "#9c4221" },
  md: { label: "Markdown", color: "#083fa1" },
  sql: { label: "SQL", color: "#e38c00" },
  graphql: { label: "GraphQL", color: "#e10098" },
  latex: { label: "LaTeX", color: "#008080" },
  tex: { label: "LaTeX", color: "#008080" },
  plaintext: { label: "Plain Text", color: "#6b7280" },
  text: { label: "Plain Text", color: "#6b7280" },
};

function getLangMeta(lang?: string) {
  return (
    LANG_META[lang?.toLowerCase() ?? ""] ?? {
      label: lang?.toUpperCase() ?? "Code",
      color: "#6b7280",
    }
  );
}

/* ── Helpers shared with the markdown pre router ───────────────────────── */

export function getCodeText(children: ReactNode): string {
  if (typeof children === "string") return children.replace(/\n$/, "");
  if (Array.isArray(children)) {
    return children.map((c) => (typeof c === "string" ? c : getCodeText((c as any)?.props?.children))).join("");
  }
  if (children && typeof children === "object" && "props" in (children as object)) {
    return getCodeText((children as any).props.children);
  }
  return "";
}

export function extractLanguage(node: unknown, className?: string): string {
  const childClassName = (node as any)?.props?.className || "";
  const match = /language-(\w+)/.exec(childClassName || className || "");
  return match ? match[1] : "";
}

/* ── Sub components ────────────────────────────────────────────────────── */

function Btn({
  onClick,
  title,
  active,
  activeClass,
  children,
}: {
  onClick: () => void;
  title?: string;
  active?: boolean;
  activeClass?: string;
  children: ReactNode;
}) {
  const idleClass = "text-(--markify-muted-fg-60) hover:text-(--markify-fg-80) hover:bg-(--markify-muted-fg-10)";
  const defaultActive = "bg-(--markify-primary-10) text-(--markify-primary)";
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium",
        "transition-all duration-150 select-none whitespace-nowrap",
        active ? (activeClass ?? defaultActive) : idleClass,
      )}
      type="button"
    >
      {children}
    </button>
  );
}

function Header({
  label,
  color,
  children,
  isCollapsed,
  onToggleCollapse,
  showCollapse,
}: {
  label: string;
  color: string;
  children: ReactNode;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  showCollapse: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-(--markify-muted) border-b border-(--markify-border)">
      <div className="flex items-center gap-2">
        {showCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-5 h-5 rounded hover:bg-(--markify-accent) transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
            type="button"
          >
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={cn(
                "text-(--markify-muted-fg-60) transition-transform duration-200",
                isCollapsed ? "-rotate-90" : "",
              )}
            />
          </button>
        )}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
        />
        <span className="text-(--markify-muted-fg) text-[11px] font-medium tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-0.5">{children}</div>
    </div>
  );
}

/* ── CodeBlock ─────────────────────────────────────────────────────────── */

export interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  language?: string;
  worker?: boolean;
  hljsTheme?: HljsTheme;
  hljsCustomCss?: string;
  hljsThemeUrl?: string;
  /** Tint the code background with the hljs theme's own background color. */
  hljsThemeBg?: boolean;
  codeFontFamily?: string;
}

function CodeBlockInner({
  children,
  className,
  language: langProp,
  worker,
  hljsTheme = "dark",
  hljsCustomCss,
  hljsThemeUrl,
  hljsThemeBg = false,
  codeFontFamily,
}: CodeBlockProps) {
  const codeText = useMemo(() => getCodeText(children), [children]);
  const [copied, setCopied] = useState(false);
  const [wrapped, setWrapped] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const COLLAPSE_THRESHOLD = 5;
  const COLLAPSED_LINES = 5;

  const language = useMemo(() => {
    if (langProp) return langProp;
    const match = /language-(\w+)/.exec(className || "");
    return match ? match[1] : "";
  }, [langProp, className]);

  const langMeta = useMemo(() => getLangMeta(language), [language]);

  const lineCount = useMemo(() => codeText.split("\n").length, [codeText]);
  const shouldCollapse = lineCount > COLLAPSE_THRESHOLD;

  const displayCode = useMemo(() => {
    if (!isCollapsed || !shouldCollapse) return codeText;
    return codeText.split("\n").slice(0, COLLAPSED_LINES).join("\n");
  }, [codeText, isCollapsed, shouldCollapse]);

  const hiddenLines = shouldCollapse && isCollapsed ? lineCount - COLLAPSED_LINES : 0;

  /* Highlighting (sync or worker) */
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [syncHtml, setSyncHtml] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingIdRef = useRef(0);

  useEffect(() => {
    if (worker) return;
    if (!displayCode) {
      setSyncHtml("");
      return;
    }

    const plainLangs = ["plaintext", "text", "mermaid", "chess", "pgn", "fen"];
    const isPlain = !language || plainLangs.includes(language);

    if (isPlain) {
      setSyncHtml(displayCode);
      return;
    }

    let cancelled = false;
    ensureLanguage(language).then((ok) => {
      if (cancelled) return;
      try {
        if (ok && hljs.getLanguage(language)) {
          setSyncHtml(hljs.highlight(displayCode, { language, ignoreIllegals: true }).value);
        } else {
          setSyncHtml(hljs.highlightAuto(displayCode).value);
        }
      } catch {
        setSyncHtml(displayCode);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [displayCode, language, worker]);

  useEffect(() => {
    if (!worker || !displayCode) return;

    const id = ++pendingIdRef.current;
    let workerInstance = workerRef.current;

    if (!workerInstance) {
      try {
        workerInstance = new Worker(new URL("./code-block.worker.ts", import.meta.url));
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

    workerInstance.postMessage({ code: displayCode, language, id });

    return () => {
      pendingIdRef.current = -1;
    };
  }, [displayCode, language, worker]);

  useEffect(() => {
    if (hljsThemeUrl) {
      let link = document.getElementById("markify-hljs-link") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = "markify-hljs-link";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = hljsThemeUrl;
    } else {
      injectHljsTheme(hljsTheme, hljsCustomCss);
    }
  }, [hljsThemeUrl, hljsTheme, hljsCustomCss]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const displayHtml = worker ? (highlightedHtml ?? displayCode) : (syncHtml ?? displayCode);
  const isLoading = worker && !highlightedHtml && displayCode.length > 0;

  const handleCopy = useCallback(async () => {
    if (await copyToClipboard(codeText)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codeText]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const preClass = cn(
    "m-0 p-4 font-mono text-[0.8rem] leading-[1.7] text-(--markify-fg-90)",
    wrapped
      ? "whitespace-pre-wrap break-words"
      : "whitespace-pre overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--markify-border) [&::-webkit-scrollbar-track]:bg-transparent",
  );

  const preStyle: React.CSSProperties = codeFontFamily ? { fontFamily: codeFontFamily } : {};

  const headerActions = (
    <>
      {!isCollapsed && (
        <Btn onClick={() => setWrapped((p) => !p)} title={wrapped ? "Unwrap lines" : "Wrap long lines"} active={wrapped}>
          <WrapText size={13} strokeWidth={2} />
        </Btn>
      )}
      <Btn
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy code"}
        active={copied}
        activeClass="bg-(--markify-success-20) text-(--markify-success)"
      >
        {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
      </Btn>
    </>
  );

  return (
    <div
      className={cn(
        "markify-code rounded-md overflow-hidden border border-(--markify-border) shadow-lg mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap)",
        className,
      )}
      style={hljsThemeBg ? { background: hljsTheme === "dark" ? "#282c34" : "#fafafa" } : undefined}
    >
      <Header
        label={langMeta.label}
        color={langMeta.color}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        showCollapse={shouldCollapse}
      >
        {headerActions}
      </Header>
      <div className="relative">
        <pre className={preClass} style={preStyle}>
          <code
            className={`language-${language}`}
            {...(isLoading ? {} : { dangerouslySetInnerHTML: { __html: displayHtml } })}
          >
            {isLoading ? displayCode : undefined}
          </code>
        </pre>
        {hiddenLines > 0 && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-full text-[11px] transition-all shadow-lg",
              "border border-(--markify-border) text-(--markify-muted-fg) hover:text-(--markify-fg) hover:bg-(--markify-accent) shadow-sm",
            )}
            type="button"
          >
            {hiddenLines} more lines
          </button>
        )}
      </div>
    </div>
  );
}

export const CodeBlock = memo(CodeBlockInner);
