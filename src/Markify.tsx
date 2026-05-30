"use client";

import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "./utils";
import { useStreamingReveal } from "./streaming";
import { createMarkdownComponents, baseRemarkPlugins, baseRehypePlugins, TableOptionsContext, type TableOptions } from "./markdown-components";
import type { HljsTheme } from "./themes";

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
}

function parseBlocks(content: string): string[] {
  const blocks: string[] = [];
  let current = "";
  let inCodeFence = false;

  for (const line of content.split("\n")) {
    if (line.startsWith("```")) {
      current += (current ? "\n" : "") + line;
      inCodeFence = !inCodeFence;
      continue;
    }
    if (!inCodeFence && line === "" && current) {
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

function MarkifyInner({ children, isStreaming = false, className, codeBlockWorker = false, table: tableOpts, hljsTheme = "dark", hljsCustomCss, hljsThemeUrl, hljsThemeBg = false, codeBlockClassName, fontFamily, codeFontFamily }: MarkifyProps) {
  const content = useStreamingReveal(children, isStreaming);

  const tableOptions = useMemo(() => ({
    showCopyButton: tableOpts?.showCopyButton ?? true,
    downloadFormats: tableOpts?.downloadFormats ?? [],
    scrollable: tableOpts?.scrollable ?? true,
  }), [tableOpts]);

  const components = useMemo(
    () => createMarkdownComponents({ codeBlockWorker, table: tableOptions, hljsTheme, hljsCustomCss, hljsThemeUrl, hljsThemeBg, codeFontFamily }),
    [codeBlockWorker, tableOptions, hljsTheme, hljsCustomCss, hljsThemeUrl, hljsThemeBg, codeFontFamily],
  );

  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <TableOptionsContext.Provider value={tableOptions}>
    <div
      data-streaming={isStreaming || undefined}
      className={cn(
        "text-foreground [&_table]:w-full [&_img]:max-w-full",
        className,
      )}
      style={{ fontFamily: fontFamily ?? undefined, willChange: "contents" }}
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
