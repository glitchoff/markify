"use client";

import { memo, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { cn } from "./utils";
import { useStreamingReveal } from "./streaming";
import { createMarkdownComponents, baseRemarkPlugins, baseRehypePlugins, TableOptionsContext, type TableOptions, type Renderers } from "./markdown-components";
import { DEFAULT_LANGUAGES, ALL_LANGUAGES, preloadLanguages } from "./hljs-languages";
import type { HljsTheme } from "./themes";
import type { MarkifyMermaidConfig } from "./MermaidBlock";

export interface MarkifyProps {
  children: string;
  isStreaming?: boolean;
  className?: string;
  codeBlockWorker?: boolean;
  table?: TableOptions;
  hljsTheme?: HljsTheme;
  hljsCustomCss?: string;
  hljsThemeUrl?: string;
  hljsThemeBg?: boolean;
  codeBlockClassName?: string;
  fontFamily?: string;
  codeFontFamily?: string;
  mermaidConfig?: MarkifyMermaidConfig;
  chessEnabled?: boolean;
  youtubeEnabled?: boolean;
  renderers?: Renderers;
  components?: Partial<Components>;
  /** Vertical rhythm between blocks. A named preset ("compact" | "normal" | "relaxed") or granular per-part overrides. Defaults to "normal". */
  spacing?: MarkifySpacing;
  /** Languages to preload on mount. Defaults to 20 common languages. Pass "all" to preload every supported language, or an array of language names. Pass an empty array to disable preloading. */
  hljsLanguages?: string[] | "all";
}

export type MarkifySpacing =
  | "compact"
  | "normal"
  | "relaxed"
  | {
      /** Bottom margin between blocks. Any CSS length (e.g. "0.75rem", "16px"). */
      block?: string;
      /** Top margin above headings. */
      headingTop?: string;
      /** Bottom margin between list items. */
      listItem?: string;
    };

const SPACING_BASE = {
  compact: { block: "0.5rem", headingTop: "0.75rem", listItem: "0.25rem" },
  normal: { block: "2rem", headingTop: "3.25rem", listItem: "0.5rem" },
  relaxed: { block: "2.5rem", headingTop: "4rem", listItem: "0.625rem" },
} as const;

type SpacingVars = {
  "--markify-gap": string;
  "--markify-gap-lg": string;
  "--markify-gap-sm": string;
};

function resolveSpacingVars(spacing: MarkifySpacing | undefined): SpacingVars {
  const base = typeof spacing === "string" ? SPACING_BASE[spacing] : SPACING_BASE.normal;
  const overrides = spacing && typeof spacing === "object" ? spacing : {};
  return {
    "--markify-gap": overrides.block ?? base.block,
    "--markify-gap-lg": overrides.headingTop ?? base.headingTop,
    "--markify-gap-sm": overrides.listItem ?? base.listItem,
  };
}

function parseBlocks(content: string): string[] {
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

const remarkPlugins: any[] = baseRemarkPlugins;
const rehypePlugins: any[] = baseRehypePlugins;

function MarkifyInner({ children, isStreaming = false, className, codeBlockWorker = false, table: tableOpts, hljsTheme = "dark", hljsCustomCss, hljsThemeUrl, hljsThemeBg = false, codeBlockClassName, fontFamily, codeFontFamily, mermaidConfig, chessEnabled = false, youtubeEnabled = false, renderers, components: overrides, spacing, hljsLanguages = DEFAULT_LANGUAGES }: MarkifyProps) {
  const content = useStreamingReveal(children, isStreaming);

  const spacingVars = useMemo(() => resolveSpacingVars(spacing), [spacing]);

  useEffect(() => {
    const langs = hljsLanguages === "all" ? ALL_LANGUAGES : hljsLanguages;
    if (langs.length > 0) {
      preloadLanguages(langs);
    }
  }, [hljsLanguages]);

  const tableOptions = useMemo(() => ({
    showCopyButton: tableOpts?.showCopyButton ?? true,
    downloadFormats: tableOpts?.downloadFormats ?? [],
    scrollable: tableOpts?.scrollable ?? true,
  }), [tableOpts]);

  const components = useMemo(
    () => ({ ...createMarkdownComponents({ codeBlockWorker, table: tableOptions, hljsTheme, hljsCustomCss, hljsThemeUrl, hljsThemeBg, codeFontFamily, mermaidConfig, chessEnabled, youtubeEnabled, isStreaming, renderers }), ...overrides }),
    [codeBlockWorker, tableOptions, hljsTheme, hljsCustomCss, hljsThemeUrl, hljsThemeBg, codeFontFamily, mermaidConfig, chessEnabled, youtubeEnabled, isStreaming, renderers, overrides],
  );

  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <TableOptionsContext.Provider value={tableOptions}>
    <div
      data-streaming={isStreaming || undefined}
      className={cn(
        "markify-root text-foreground [&_table]:w-full [&_img]:max-w-full",
        className,
      )}
      style={{ fontFamily: fontFamily ?? undefined, willChange: "contents", ...spacingVars }}
    >
      {blocks.map((block, i) => {
        const isLast = i === blocks.length - 1;

        if (!isLast || !isStreaming) {
          return (
            <StaticBlock key={`b${i}-${hash(block)}`} block={block} components={components} />
          );
        }

        return (
          <StreamingBlock key={`s-${i}`} block={block} components={components} />
        );
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
  components: ReturnType<typeof createMarkdownComponents>;
}) {
  return (
    <div className="static-block">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {block}
      </ReactMarkdown>
    </div>
  );
});

function StreamingBlock({
  block,
  components,
}: {
  block: string;
  components: ReturnType<typeof createMarkdownComponents>;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {block}
    </ReactMarkdown>
  );
}

export const Markify = memo(MarkifyInner);
