"use client";

import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import hljs from "highlight.js";
import { Copy, Check, WrapText, ChevronDown } from "lucide-react";
import { cn, injectHljsTheme } from "./utils";
import type { HljsTheme } from "./themes";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
  worker?: boolean;
  hljsTheme?: HljsTheme;
  hljsCustomCss?: string;
  hljsThemeBg?: boolean;
  isDark?: boolean;
  codeBlockClassName?: string;
}

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
  mermaid: { label: "Mermaid", color: "#ff3670" },
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
  children: React.ReactNode;
}) {
  const idleClass = "text-muted-foreground/60 hover:text-foreground/80 hover:bg-muted-foreground/10";
  const defaultActive = "bg-primary/10 text-primary";
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium",
        "transition-all duration-150 select-none whitespace-nowrap",
        active ? (activeClass ?? defaultActive) : idleClass,
      ].join(" ")}
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
  isDark,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  showCollapse: boolean;
  isDark: boolean;
}) {
  const headerBg = "bg-muted border-b border-border";
  const labelCls = "text-muted-foreground";
  const chevronCls = "text-muted-foreground/60";
  const chevronHover = "hover:bg-accent";
  return (
    <div className={`flex items-center justify-between px-3 py-2 ${headerBg}`}>
      <div className="flex items-center gap-2">
        {showCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`flex items-center justify-center w-5 h-5 rounded ${chevronHover} transition-colors`}
            title={isCollapsed ? "Expand" : "Collapse"}
            type="button"
          >
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`${chevronCls} transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
            />
          </button>
        )}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
        />
        <span className={`${labelCls} text-[11px] font-medium tracking-wide`}>{label}</span>
      </div>
      <div className="flex items-center gap-0.5">{children}</div>
    </div>
  );
}

function CodeBlockInner({ children, className, language: langProp, worker, hljsTheme = "dark", hljsCustomCss, hljsThemeBg = false, isDark: isDarkProp, codeBlockClassName }: CodeBlockProps) {
  const codeText = useMemo(() => getCodeText(children), [children]);
  const [copied, setCopied] = useState(false);
  const [wrapped, setWrapped] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const COLLAPSE_THRESHOLD = 5;
  const COLLAPSED_LINES = 5;

  const isDark = isDarkProp ?? (hljsTheme === "dark");

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

  // ── Highlighting (sync or worker) ──────────────────────────────────
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingIdRef = useRef(0);

  const syncHtml = useMemo(() => {
    if (worker) return null;
    if (!displayCode) return "";
    try {
      if (language && language !== "plaintext" && language !== "text" && language !== "mermaid") {
        return hljs.highlight(displayCode, { language, ignoreIllegals: true }).value;
      }
      return hljs.highlightAuto(displayCode).value;
    } catch {
      return displayCode;
    }
  }, [displayCode, language, worker]);

  useEffect(() => {
    if (!worker || !displayCode) return;

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

    workerInstance.postMessage({ code: displayCode, language, id });

    return () => {
      pendingIdRef.current = -1;
    };
  }, [displayCode, language, worker]);

  useEffect(() => { injectHljsTheme(hljsTheme, hljsCustomCss); }, [hljsTheme, hljsCustomCss]);

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

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const isMermaid = language === "mermaid";

  const codeBg = "text-foreground/90";
  const wrapperBorder = "border-border";
  const expandCls = "border border-border text-muted-foreground hover:text-foreground hover:bg-accent shadow-sm";
  const wrapperCls = `rounded-md overflow-hidden border shadow-lg mb-3 ${wrapperBorder} ${codeBlockClassName ?? ""}`

  const preClass = [
    `m-0 p-4 font-mono text-[0.8rem] leading-[1.7] ${codeBg}`,
    wrapped ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent",
  ].join(" ");

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
        activeClass="bg-emerald-500/20 text-emerald-400"
      >
        {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
      </Btn>
    </>
  );

  if (isMermaid) {
    return (
      <div className={wrapperCls}>  <Header
          label={langMeta.label}
          color={langMeta.color}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          showCollapse={shouldCollapse}
          isDark={isDark}
        >
          {headerActions}
        </Header>
        <pre className={`mermaid ${preClass}`}>
          <code className={`language-${language}`}>{displayCode}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={wrapperCls}>
      <Header
        label={langMeta.label}
        color={langMeta.color}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        showCollapse={shouldCollapse}
        isDark={isDark}
      >
        {headerActions}
      </Header>
      <div className="relative">
        <pre className={preClass}>
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
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-full text-[11px] transition-all shadow-lg ${expandCls}`}
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
