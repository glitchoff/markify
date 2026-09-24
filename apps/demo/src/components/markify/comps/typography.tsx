"use client";

import { isValidElement, type ReactNode } from "react";
import { cn } from "./_lib";

/* Headings ──────────────────────────────────────────────────────────── */

function Heading({
  level,
  children,
  className,
  ...props
}: { level: 1 | 2 | 3 | 4 | 5 | 6; children?: ReactNode; className?: string; [key: string]: unknown }) {
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
    <Tag className={cn(styles[level], "text-(--markify-fg)", className)} {...props}>
      {children}
    </Tag>
  );
}

export function H1(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <Heading level={1} {...props} />;
}
export function H2(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <Heading level={2} {...props} />;
}
export function H3(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <Heading level={3} {...props} />;
}
export function H4(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <Heading level={4} {...props} />;
}
export function H5(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <Heading level={5} {...props} />;
}
export function H6(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <Heading level={6} {...props} />;
}

/* Paragraph ─────────────────────────────────────────────────────────── */

function hasElements(node: ReactNode): boolean {
  if (isValidElement(node)) return true;
  if (Array.isArray(node)) return node.some(hasElements);
  return false;
}

export function Paragraph({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  const content = children ? String(getTextSafe(children)).trim() : "";
  if (!content && !hasElements(children)) return null;
  const onlyImage = hasElements(children) && !content;
  return (
    <p
      className={cn(
        "mt-[calc(var(--markify-gap)_*_0.5)] mb-(--markify-gap) first:mt-0 last:mb-0 leading-relaxed text-base text-(--markify-fg-90) whitespace-pre-wrap",
        onlyImage && "text-center",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Local recursive text extraction (mirrors _lib getText without importing it
// into a file that doesn't otherwise need it).
function getTextSafe(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getTextSafe).join("");
  const props = (node as { props?: { children?: ReactNode } })?.props;
  if (props?.children !== undefined) return getTextSafe(props.children);
  return "";
}

/* Link ──────────────────────────────────────────────────────────────── */

export function Link({ href, children, className, ...props }: { href?: string; children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-(--markify-primary) underline underline-offset-2 decoration-(--markify-primary-30) hover:decoration-(--markify-primary) transition-colors break-all",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

/* Inline code ───────────────────────────────────────────────────────── */

export function InlineCode({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <code
      className={cn(
        "rounded bg-(--markify-muted) px-1.5 py-0.5 font-mono text-sm font-medium text-(--markify-fg)",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

/* Lists ─────────────────────────────────────────────────────────────── */

export function List({ children, ordered, className, ...props }: { children?: ReactNode; ordered?: boolean; className?: string; [key: string]: unknown }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "mt-[calc(var(--markify-gap)_*_0.75)] mb-(--markify-gap) ml-6",
        ordered ? "list-decimal" : "list-disc",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
export function UnorderedList(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <List {...props} />;
}
export function OrderedList(props: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return <List ordered {...props} />;
}

export function ListItem({ children, className, ...props }: { children?: ReactNode; className?: string; [key: string]: unknown }) {
  return (
    <li
      className={cn(
        "mb-(--markify-gap-sm) leading-relaxed text-(--markify-fg-90) [&>ul]:my-1 [&>ol]:my-1",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

/* Horizontal rule ───────────────────────────────────────────────────── */

export function Hr({ className, ...props }: { className?: string; [key: string]: unknown }) {
  return <hr className={cn("mt-(--markify-gap) mb-(--markify-gap) border-(--markify-border)", className)} {...props} />;
}
