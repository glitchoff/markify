"use client";

import { memo, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "./utils";
import { parseCallout, getText } from "./callout";
import { remarkFixKaTeXUnicode } from "./fix-katex-unicode";
import { CodeBlock } from "./CodeBlock";
import { MermaidBlock } from "./MermaidBlock";
import type { Components } from "react-markdown";

const katexOptions = {
  strict: false,
  throwOnError: false,
};

const baseRemarkPlugins: any[] = [remarkGfm, remarkMath, remarkFixKaTeXUnicode];
const baseRehypePlugins: any[] = [[rehypeKatex, katexOptions]];

export { baseRemarkPlugins, baseRehypePlugins };

function Heading({ level, children, ...props }: { level: 1 | 2 | 3 | 4 | 5 | 6; children: React.ReactNode }) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const styles: Record<number, string> = {
    1: "text-3xl font-bold mt-6 mb-3 border-b border-border pb-1",
    2: "text-2xl font-semibold mt-5 mb-2",
    3: "text-xl font-medium mt-4 mb-1",
    4: "text-lg font-medium mt-3 mb-1",
    5: "text-base font-medium mt-2 mb-0",
    6: "text-sm font-medium mt-2 mb-0",
  };
  return (
    <Tag className={cn(styles[level], "text-foreground")} {...props}>
      {children}
    </Tag>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  const content = getText(children).trim();
  if (!content) return null;
  return <p className="mb-4 last:mb-0 leading-relaxed text-base text-foreground/90">{children}</p>;
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
      className="max-w-full h-auto rounded-lg shadow-md mx-auto my-2"
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
      <div className={cn("my-4 rounded-lg border-l-4 p-4", styles[type])} {...props}>
        <strong className="mb-1 block font-semibold text-foreground">{titles[type]}</strong>
        <ReactMarkdown remarkPlugins={baseRemarkPlugins} rehypePlugins={baseRehypePlugins}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <blockquote
      className="my-4 border-l-4 border-muted-foreground/30 pl-4 text-muted-foreground italic"
      {...props}
    >
      {children}
    </blockquote>
  );
}

function Table({ children, ...props }: { children: React.ReactNode }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [copied, setCopied] = useState(false);
  const [showCopy, setShowCopy] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!tableRef.current) return;
      try {
        const rows = tableRef.current.querySelectorAll("tr");
        let md = "";
        rows.forEach((row, i) => {
          const cells = row.querySelectorAll("th, td");
          const vals = Array.from(cells).map((c) => (c as HTMLElement).innerText.trim());
          if (vals.length === 0) return;
          md += `| ${vals.join(" | ")} |\n`;
          if (i === 0 && row.querySelectorAll("th").length > 0) {
            md += `| ${vals.map(() => "---").join(" | ")} |\n`;
          }
        });
        await navigator.clipboard.writeText(md);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // silently fail
      }
    },
    [],
  );

  return (
    <div
      className="group relative my-4 overflow-hidden rounded-lg border border-border bg-card"
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <button
        onClick={handleCopy}
        className={cn(
          "absolute right-1 top-1 z-10 rounded-md border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur transition-all",
          showCopy ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
          copied && "border-primary/20 bg-primary/10 text-primary",
        )}
        type="button"
      >
        {copied ? "Copied" : "Copy as Markdown"}
      </button>
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
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

function List({ children, ordered, ...props }: { children: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "my-3 ml-6",
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
  return <hr className="my-6 border-border" />;
}

function PreWithWorker({ worker, ...props }: { worker: boolean; children: React.ReactNode; className?: string }) {
  const lang = extractLanguage(props.children, props.className);

  if (lang === "mermaid") {
    const rawCode = getCodeChildren(props.children);
    const codeText = typeof rawCode === "string" ? rawCode : getText(rawCode);
    return <MermaidBlock code={codeText} />;
  }

  return (
    <CodeBlock className={props.className} language={lang} worker={worker}>
      {props.children}
    </CodeBlock>
  );
}

export function createMarkdownComponents(worker?: boolean): Components {
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
    pre: (props) => <PreWithWorker worker={worker ?? false} {...props} />,
    ol: (props) => <List ordered {...props} />,
    ul: (props) => <List {...props} />,
    li: ListItem as any,
    hr: Hr as any,
  };
}

export { Image as ImageComponent };
