"use client";

import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "./utils";
import { useStreamingReveal } from "./streaming";
import { createMarkdownComponents, baseRemarkPlugins, baseRehypePlugins } from "./markdown-components";

export interface MarkifyProps {
  children: string;
  isStreaming?: boolean;
  className?: string;
  codeBlockWorker?: boolean;
}

function MarkifyInner({ children, isStreaming = false, className, codeBlockWorker = false }: MarkifyProps) {
  const displayedContent = useStreamingReveal(children, isStreaming);
  const content = isStreaming ? displayedContent : children;

  const components = useMemo(
    () => createMarkdownComponents(codeBlockWorker),
    [codeBlockWorker],
  );

  return (
    <div
      data-streaming={isStreaming || undefined}
      className={cn(
        "text-foreground [&_table]:w-full [&_img]:max-w-full",
        "prose-custom",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={baseRemarkPlugins}
        rehypePlugins={baseRehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const Markify = memo(MarkifyInner);
