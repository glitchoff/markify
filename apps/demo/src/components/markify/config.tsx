"use client";

/**
 * @glitchoff/markify — config.ts
 *
 * The single seam for everything Markify: settings, theming, the component
 * map, and the exported <Markify> component your app imports.
 *
 *   import { Markify } from "@/components/markify/config";
 *
 * Customize by editing this file or any file in ./comps — everything is
 * yours. Settings here act as defaults; every prop can also be overridden
 * per-instance on <Markify>.
 */

import React, { memo, useMemo, useEffect, lazy, Suspense, type CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remend from "remend";
import { remarkFixKaTeXUnicode } from "./comps/_katex-unicode";

import "./tokens.css";
import "katex/dist/katex.min.css";

import { cn } from "./comps/_lib";
import { withBase } from "../../base";
import { CodeBlock, extractLanguage, getCodeText, preloadLanguages, DEFAULT_LANGUAGES, ALL_LANGUAGES, type HljsTheme } from "./comps/code-block";
import { H1, H2, H3, H4, H5, H6, Paragraph, Link, InlineCode, OrderedList, UnorderedList, ListItem, Hr } from "./comps/typography";
import { Blockquote } from "./comps/blockquote";
import { Table, THead, TBody, TR, TH, TD, TableOptionsContext, type TableOptions } from "./comps/table";
import { Image, type YouTubeVideo } from "./comps/embeds";
import { ChessFallback, MermaidFallback } from "./comps/fallbacks";
import type { MarkifyMermaidConfig } from "./comps/mermaid";
import type { ChessGameProps, FenBoardProps } from "./comps/chess";

/* Mermaid + chess are lazy-loaded so their heavy deps only load when used. */
const LazyMermaidBlock = lazy(() =>
  import("./comps/mermaid").then((m) => ({ default: m.MermaidBlock })),
);
const LazyChessGame = lazy(() =>
  import("./comps/chess").then((m) => ({ default: m.ChessGame })),
);
const LazyFenBoard = lazy(() =>
  import("./comps/chess").then((m) => ({ default: m.FenBoard })),
);

/* ═══════════════════════════════════════════════════════════════════════
 * Settings
 * ═══════════════════════════════════════════════════════════════════════ */

export interface MarkifySpacing {
  /** Bottom margin between blocks. Any CSS length (e.g. "0.75rem", "16px"). */
  block?: string;
  /** Top margin above headings. */
  headingTop?: string;
  /** Bottom margin between list items. */
  listItem?: string;
}

export type MarkifySpacingPreset = "compact" | "normal" | "relaxed";

const SPACING_BASE: Record<MarkifySpacingPreset, Required<MarkifySpacing>> = {
  compact: { block: "0.5rem", headingTop: "0.75rem", listItem: "0.25rem" },
  normal: { block: "2rem", headingTop: "3.25rem", listItem: "0.5rem" },
  relaxed: { block: "2.5rem", headingTop: "4rem", listItem: "0.625rem" },
};

export interface CodeBlockSettings {
  /** Highlight in a web worker. Default: false */
  worker?: boolean;
  /** highlight.js theme for the code ("dark" | "light"). Default: "dark" */
  hljsTheme?: HljsTheme;
  /** Custom hljs CSS injected instead of the built-in Atom theme. */
  hljsCustomCss?: string;
  /** Load the hljs theme from a URL instead of the built-in CSS. */
  hljsThemeUrl?: string;
  /** Tint the code background with the hljs theme's background. Default: false */
  hljsThemeBg?: boolean;
  /** Font family for code blocks. */
  codeFontFamily?: string;
  /** Languages to preload on mount: an array, "all", or "default". */
  hljsLanguages?: string[] | "all" | "default";
}

export interface EmbedSettings {
  /** Enable `![youtube:<url|id>]()` embeds. Default: true */
  youtube?: boolean;
  /** Enable `![twitter:<url|id>]()` embeds. Default: true */
  twitter?: boolean;
}

export interface ChessSettings {
  /** Enable ```pgn / ```fen blocks. Default: false */
  enabled?: boolean;
  /** Max board width in px. Default: 420 */
  maxWidth?: number;
  /** Show coordinate notation on the board. Default: true */
  showNotation?: boolean;
}

/** Per-instance theme overrides. Keys are shadcn token names. */
export interface MarkifyTheme {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  fontSans?: string;
  fontMono?: string;
}

const THEME_VAR_MAP: Record<keyof MarkifyTheme, string> = {
  background: "--markify-bg",
  foreground: "--markify-fg",
  card: "--markify-card",
  cardForeground: "--markify-card-fg",
  popover: "--markify-popover",
  popoverForeground: "--markify-popover-fg",
  primary: "--markify-primary",
  primaryForeground: "--markify-primary-fg",
  secondary: "--markify-secondary",
  secondaryForeground: "--markify-secondary-fg",
  muted: "--markify-muted",
  mutedForeground: "--markify-muted-fg",
  accent: "--markify-accent",
  accentForeground: "--markify-accent-fg",
  destructive: "--markify-destructive",
  destructiveForeground: "--markify-destructive-fg",
  border: "--markify-border",
  input: "--markify-input",
  ring: "--markify-ring",
  fontSans: "--markify-font-sans",
  fontMono: "--markify-font-mono",
};

/** Converts a partial theme object into inline `--markify-*` CSS vars. */
export function toMarkifyVars(theme?: Partial<MarkifyTheme>): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!theme) return vars;
  for (const key of Object.keys(theme) as (keyof MarkifyTheme)[]) {
    const value = theme[key];
    if (value === undefined) continue;
    vars[THEME_VAR_MAP[key]] = value;
  }
  return vars;
}

/* ═══════════════════════════════════════════════════════════════════════
 * markifyConfig — edit this object to configure Markify globally
 * ═══════════════════════════════════════════════════════════════════════ */

export const markifyConfig = {
  /** Global token overrides (shadcn token names). */
  theme: {} as Partial<MarkifyTheme>,
  /** Raw custom property overrides, e.g. { "--markify-gap": "1.5rem" }. */
  cssVars: {} as Record<string, string>,
  /** Vertical rhythm: "compact" | "normal" | "relaxed" | granular object. */
  spacing: "normal" as MarkifySpacingPreset | MarkifySpacing,
  /** Font family for the whole renderer (falls back to the app's font). */
  fontFamily: undefined as string | undefined,

  codeBlock: {
    worker: false,
    hljsTheme: "dark",
    hljsLanguages: "default",
  } as CodeBlockSettings,

  table: {
    showCopyButton: true,
    downloadFormats: [],
    scrollable: true,
  } as TableOptions,

  mermaid: {
    showHeader: true,
    showBackground: true,
    fit: false,
  } as MarkifyMermaidConfig,

  chess: {
    enabled: true,
    maxWidth: 420,
    showNotation: true,
  } as ChessSettings,

  embeds: {
    youtube: true,
    twitter: true,
  } as EmbedSettings,
};

export type MarkifyConfig = typeof markifyConfig;

/* ═══════════════════════════════════════════════════════════════════════
 * Streaming helpers
 * ═══════════════════════════════════════════════════════════════════════ */

/**
 * remark-math only treats `$$...$$` as a *block* (display) equation when the
 * delimiters sit on their own lines. Rewrite the single-line form into the
 * multi-line form so display math centers properly. Skips fenced code.
 */
export function normalizeDisplayMath(content: string): string {
  if (!content.includes("$$")) return content;
  const lines = content.split("\n");
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fence && !fence[1].includes("`") && !fence[1].includes("~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(\s*)\$\$(.*?)\$\$(\s*)$/.exec(line);
    if (m && m[2] && !m[2].includes("$$")) {
      lines[i] = `${m[1]}$$\n${m[2]}\n$$${m[3]}`;
    }
  }
  return lines.join("\n");
}

export function useStreamingReveal(content: string, isStreaming: boolean): string {
  if (!content) return "";
  const normalized = normalizeDisplayMath(content);
  /* remend repairs truncated markdown mid-stream; math is left untouched. */
  return isStreaming ? remend(normalized, { katex: false, inlineKatex: false }) : normalized;
}

/** Splits content into top-level blocks for stable per-block rendering. */
export function parseBlocks(content: string): string[] {
  const blocks: string[] = [];
  let current = "";
  let fenceMarker: string | null = null;

  for (const line of content.split("\n")) {
    const fence = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fence && !fence[1].includes("`") && !fence[1].includes("~")) {
      const marker = fence[2];
      if (fenceMarker === null) {
        fenceMarker = marker;
      } else if (marker[0] === fenceMarker[0] && marker.length >= fenceMarker.length) {
        fenceMarker = null;
      }
      current += (current ? "\n" : "") + line;
      continue;
    }
    if (fenceMarker === null && line === "" && current) {
      blocks.push(current);
      current = "";
      continue;
    }
    current += (current ? "\n" : "") + line;
  }
  if (current) blocks.push(current);
  return blocks;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Component map
 * ═══════════════════════════════════════════════════════════════════════ */

function resolveSpacing(spacing: MarkifySpacingPreset | MarkifySpacing | undefined) {
  const base = !spacing ? SPACING_BASE.normal : typeof spacing === "string" ? SPACING_BASE[spacing] : SPACING_BASE.normal;
  const overrides = spacing && typeof spacing === "object" ? spacing : {};
  return {
    "--markify-gap": overrides.block ?? base.block,
    "--markify-gap-lg": overrides.headingTop ?? base.headingTop,
    "--markify-gap-sm": overrides.listItem ?? base.listItem,
  } as CSSProperties;
}

function buildComponents(
  settings: MarkifyConfig,
  isStreaming: boolean,
  overrides?: Partial<Components>,
): Components {
  const code = settings.codeBlock;
  const embeds = settings.embeds;
  const chess = settings.chess;
  const mermaid = settings.mermaid;

  /* `pre` router: mermaid / chess / regular code blocks. */
  const pre = (props: any) => {
    const lang = extractLanguage(props.children, props.className);
    const codeText = getCodeText(props.children);

    if (lang === "mermaid") {
      const resolvedConfig = mermaid.theme
        ? mermaid
        : ({ ...mermaid, theme: code.hljsTheme === "dark" ? ("dark" as const) : ("default" as const) });
      return (
        <Suspense fallback={<MermaidFallback />}>
          <LazyMermaidBlock code={codeText} config={resolvedConfig} />
        </Suspense>
      );
    }

    if (chess.enabled && (lang === "pgn" || lang === "chess")) {
      return (
        <Suspense fallback={<ChessFallback />}>
          <LazyChessGame pgn={codeText} isStreaming={isStreaming} showNotation={chess.showNotation} />
        </Suspense>
      );
    }

    if (chess.enabled && lang === "fen") {
      return (
        <Suspense fallback={<ChessFallback />}>
          <LazyFenBoard fen={codeText} isStreaming={isStreaming} maxWidth={chess.maxWidth} showNotation={chess.showNotation} />
        </Suspense>
      );
    }

    return (
      <CodeBlock
        className={props.className}
        language={lang}
        worker={code.worker}
        hljsTheme={code.hljsTheme}
        hljsCustomCss={code.hljsCustomCss}
        hljsThemeUrl={code.hljsThemeUrl}
        hljsThemeBg={code.hljsThemeBg}
        codeFontFamily={code.codeFontFamily}
      >
        {props.children}
      </CodeBlock>
    );
  };

  return {
    h1: (props: any) => <H1 {...props} />,
    h2: (props: any) => <H2 {...props} />,
    h3: (props: any) => <H3 {...props} />,
    h4: (props: any) => <H4 {...props} />,
    h5: (props: any) => <H5 {...props} />,
    h6: (props: any) => <H6 {...props} />,
    p: (props: any) => <Paragraph {...props} />,
    a: (props: any) => (
      <Link {...props} href={withBase(props.href)} />
    ),
    code: (props: any) => <InlineCode {...props} />,
    img: (props: any) => (
      <Image
        {...props}
        youtubeEnabled={embeds.youtube}
        twitterEnabled={embeds.twitter}
        isStreaming={isStreaming}
      />
    ),
    blockquote: (props: any) => <Blockquote {...props} />,
    table: (props: any) => <Table {...props} />,
    thead: (props: any) => <THead {...props} />,
    tbody: (props: any) => <TBody {...props} />,
    tr: (props: any) => <TR {...props} />,
    th: (props: any) => <TH {...props} />,
    td: (props: any) => <TD {...props} />,
    ol: (props: any) => <OrderedList {...props} />,
    ul: (props: any) => <UnorderedList {...props} />,
    li: (props: any) => <ListItem {...props} />,
    hr: () => <Hr />,
    pre,
    style: () => null,
    script: () => null,
    ...overrides,
  } as Components;
}

export type { YouTubeVideo, ChessGameProps, FenBoardProps };

/* ── remark / rehype pipeline ──────────────────────────────────────────── */

const katexOptions = { strict: false, throwOnError: false };

const remarkPlugins: any[] = [remarkGfm, remarkMath, remarkFixKaTeXUnicode];
const rehypePlugins: any[] = [[rehypeKatex, katexOptions]];

/* ═══════════════════════════════════════════════════════════════════════
 * <Markify>
 * ═══════════════════════════════════════════════════════════════════════ */

export interface MarkifyProps {
  /** Markdown source to render. */
  children: string;
  /** Repair truncated markdown and render the last block streaming. */
  isStreaming?: boolean;
  /** Merged onto the root wrapper. */
  className?: string;
  /** Vertical rhythm override. */
  spacing?: MarkifySpacingPreset | MarkifySpacing;
  /** Token overrides (shadcn token names). */
  theme?: Partial<MarkifyTheme>;
  /** Raw custom property overrides, e.g. { "--markify-gap": "1.5rem" }. */
  cssVars?: Record<string, string>;
  /** Font family for the whole renderer. */
  fontFamily?: string;
  /** Swap/override any markdown element component. */
  components?: Partial<Components>;
}

function MarkifyInner({
  children,
  isStreaming = false,
  className,
  spacing: spacingProp,
  theme: themeProp,
  cssVars: cssVarsProp,
  fontFamily: fontFamilyProp,
  components: componentOverrides,
}: MarkifyProps) {
  const settings = markifyConfig;
  const content = useStreamingReveal(children, isStreaming);

  const spacing = spacingProp ?? settings.spacing;
  const theme = themeProp ?? settings.theme;
  const cssVars = cssVarsProp ?? settings.cssVars;
  const fontFamily = fontFamilyProp ?? settings.fontFamily;

  const spacingVars = useMemo(() => resolveSpacing(spacing), [spacing]);
  const themeVars = useMemo(() => ({ ...toMarkifyVars(theme), ...cssVars }), [theme, cssVars]);

  /* Preload hljs languages. */
  useEffect(() => {
    const configured = settings.codeBlock.hljsLanguages ?? "default";
    const langs = configured === "all" ? ALL_LANGUAGES : configured === "default" ? DEFAULT_LANGUAGES : configured;
    if (langs.length > 0) preloadLanguages(langs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableOptions = useMemo(
    () => ({
      showCopyButton: settings.table.showCopyButton ?? true,
      downloadFormats: settings.table.downloadFormats ?? [],
      scrollable: settings.table.scrollable ?? true,
    }),
    [settings.table],
  );

  const components = useMemo(
    () => buildComponents(settings, isStreaming, componentOverrides),
    [settings, isStreaming, componentOverrides],
  );

  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <TableOptionsContext.Provider value={tableOptions}>
      <div
        data-streaming={isStreaming || undefined}
        className={cn("markify-root text-(--markify-fg)", className)}
        style={{
          fontFamily: fontFamily ?? undefined,
          willChange: "contents",
          ...spacingVars,
          ...themeVars,
        }}
      >
        {blocks.map((block, i) => {
          const isLast = i === blocks.length - 1;

          if (!isLast || !isStreaming) {
            return <StaticBlock key={`b${i}-${hash(block)}`} block={block} components={components} />;
          }

          return <StreamingBlock key={`s-${i}`} block={block} components={components} />;
        })}
      </div>
    </TableOptionsContext.Provider>
  );
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

const StaticBlock = memo(function StaticBlock({
  block,
  components,
}: {
  block: string;
  components: Components;
}) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
      {block}
    </ReactMarkdown>
  );
});

function StreamingBlock({ block, components }: { block: string; components: Components }) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
      {block}
    </ReactMarkdown>
  );
}

export const Markify = memo(MarkifyInner);

export type { MarkifyMermaidConfig };
