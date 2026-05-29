import { useRef, useEffect, useState, useMemo, memo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STREAM_CONFIG = {
  BASE_CHARS_PER_FRAME: 12,
  MAX_CATCHUP_MULTIPLIER: 8,
  CATCHUP_THRESHOLD: 60,
  MIN_FRAME_MS: 16,
  WORD_SNAP_LOOKAHEAD: 12,
};

const getText = (nodeChildren) => {
  if (typeof nodeChildren === "string") return nodeChildren;
  if (Array.isArray(nodeChildren)) {
    return nodeChildren
      .map((child) =>
        typeof child === "string"
          ? child
          : child?.props?.children
            ? getText(child.props.children)
            : ""
      )
      .join("");
  }
  return nodeChildren?.props?.children ? getText(nodeChildren.props.children) : "";
};

const parseCallout = (text) => {
  const calloutRegex = /^\[!(\w+)\]\s*(.*)$/si;
  const match = text.match(calloutRegex);
  if (match) {
    return { type: match[1].toUpperCase(), content: match[2].trim() };
  }
  return { type: null, content: text };
};

const ImageWithLoading = memo(({ src, alt, className = "", isStreaming = false, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isStreaming || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isStreaming]);

  if (isStreaming) return null;

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    if (imgRef.current) {
      const separator = src.includes("?") ? "&" : "?";
      imgRef.current.src = `${src}${separator}_t=${Date.now()}`;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex justify-center my-3 group min-h-[1px]">
      {isVisible && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${className} transition-all duration-700 ease-out ${isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[0.98] blur-sm"}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          {...props}
        />
      )}
      {hasError && (
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
          <span>⚠️</span>
          <button onClick={handleRetry} className="underline hover:text-zinc-300 transition-colors">
            retry
          </button>
        </span>
      )}
    </div>
  );
});

const defaultCodeComponent = memo(({ children, className: preClassName, highlight, ...props }) => {
  const [copied, setCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(true);

  const codeElement = Array.isArray(children) ? children[0] : children;
  const codeClassName = codeElement?.props?.className || "";
  const match = /language-(\w+)/.exec(codeClassName || preClassName || "");
  const lang = match ? match[1] : "plaintext";

  const codeText = useMemo(() => {
    const getCodeText = (nodeChildren) => {
      if (typeof nodeChildren === "string") return nodeChildren.replace(/\n$/, "");
      if (Array.isArray(nodeChildren)) {
        return nodeChildren
          .map((child) =>
            typeof child === "string" ? child : child?.props?.children ? getCodeText(child.props.children) : ""
          )
          .join("");
      }
      return nodeChildren?.props?.children ? getCodeText(nodeChildren.props.children) : "";
    };
    return getCodeText(codeElement?.props?.children).replace(/\n$/, "");
  }, [codeElement]);

  const highlighted = useMemo(() => {
    if (!highlight || lang === "mermaid") return codeText;
    return highlight(codeText, lang);
  }, [codeText, lang, highlight]);

  const toggleWrap = useCallback(() => setIsWrapped((prev) => !prev), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = codeText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codeText]);

  if (lang === "mermaid") {
    return (
      <div className="relative my-2 w-full">
        <pre className={`mermaid ${isWrapped ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"} rounded-lg p-3 sm:p-4 bg-[#0d1117] border border-white/10 text-white/90 font-mono text-sm leading-relaxed w-full sm:w-auto ${preClassName || ""}`} {...props}>
          {codeText}
        </pre>
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={toggleWrap} className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium">
            {isWrapped ? "Unwrap" : "Wrap"}
          </button>
          <button onClick={handleCopy} className={`bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${copied ? "bg-emerald-500/20 text-emerald-400" : ""}`}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative my-2 w-full">
      <pre className={`${isWrapped ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"} rounded-lg p-3 sm:p-4 bg-[#0d1117] border border-white/10 text-white/90 font-mono text-sm leading-relaxed w-full sm:w-auto ${preClassName || ""}`} {...props}>
        <code className={`language-${lang} font-mono text-sm w-full`} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      <div className="absolute top-2 right-2 flex gap-1">
        <button onClick={toggleWrap} className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium">
          {isWrapped ? "Unwrap" : "Wrap"}
        </button>
        <button onClick={handleCopy} className={`bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${copied ? "bg-emerald-500/20 text-emerald-400" : ""}`}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
});

const defaultComponents = {
  style: () => null,
  script: () => null,
  a: ({ children, href, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-150" {...props}>
      {children}
    </a>
  ),
  img: null,
  h1: memo(({ children, ...props }) => <h1 className="text-3xl font-bold !mt-2 !mb-1 border-b border-zinc-300 pb-1" {...props}>{children}</h1>),
  h2: memo(({ children, ...props }) => <h2 className="text-2xl font-semibold !mt-1.5 !mb-0.5" {...props}>{children}</h2>),
  h3: memo(({ children, ...props }) => <h3 className="text-xl font-medium !mt-1 !mb-0.5" {...props}>{children}</h3>),
  h4: memo(({ children, ...props }) => <h4 className="text-lg font-medium !mt-0.5 !mb-0" {...props}>{children}</h4>),
  h5: memo(({ children, ...props }) => <h5 className="text-base font-medium !mt-0.5 !mb-0" {...props}>{children}</h5>),
  h6: memo(({ children, ...props }) => <h6 className="text-sm font-medium !mt-0.5 !mb-0" {...props}>{children}</h6>),
  p: memo(({ children }) => {
    const content = getText(children).trim();
    if (!content) return null;
    return <p className="!mb-0.5 last:!mb-0 !leading-snug">{children}</p>;
  }),
  pre: memo(({ children, className, ...props }) => {
    if (props.children?.props?.className?.includes("language-")) {
      return <defaultCodeComponent {...props}>{children}</defaultCodeComponent>;
    }
    return <pre className={className} {...props}>{children}</pre>;
  }),
  code: memo(({ children, className, ...props }) => (
    <code className={`px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-100 font-mono text-[0.9em] ${className || ""}`} {...props}>
      {children}
    </code>
  )),
  ul: memo(({ children, ...props }) => <ul className="!my-0 list-disc pl-4 !space-y-0 [&_li]:!my-0 [&_p]:!my-0" {...props}>{children}</ul>),
  ol: memo(({ children, ...props }) => <ol className="!my-0 list-decimal pl-4 !space-y-0 [&_li]:!my-0 [&_p]:!my-0" {...props}>{children}</ol>),
  li: memo(({ children, ...props }) => <li className="!my-0 !leading-snug" {...props}>{children}</li>),
  blockquote: memo(({ children, ...props }) => {
    const text = getText(children);
    const { type, content } = parseCallout(text);
    if (type) {
      const calloutStyles = {
        NOTE: "bg-blue-500/10 border-blue-500/30 text-blue-200",
        WARNING: "bg-yellow-500/10 border-yellow-500/30 text-yellow-200",
        TIP: "bg-green-500/10 border-green-500/30 text-green-200",
      };
      const calloutTitles = { NOTE: "Note", WARNING: "Warning", TIP: "Tip" };
      return (
        <div className={`my-2 p-4 rounded-lg border-l-4 ${calloutStyles[type] || "bg-zinc-800/50 border-zinc-600 text-zinc-300"}`} {...props}>
          <strong className="block font-semibold mb-1">{calloutTitles[type] || type}</strong>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      );
    }
    return <blockquote className="my-2 pl-4 border-l-4 border-zinc-600 text-zinc-400 italic" {...props}>{children}</blockquote>;
  }),
};

const remarkPlugins = [remarkGfm];

export const Markify = memo(function Markify({ 
  children, 
  isStreaming = false, 
  components = {},
  plugins = {},
  highlight,
  onArtifactClick,
}) {
  const containerRef = useRef(null);
  const [displayedContent, setDisplayedContent] = useState("");
  const targetContentRef = useRef("");
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const displayedLenRef = useRef(0);

  const mergedComponents = useMemo(() => ({
    ...defaultComponents,
    ...components,
    img: components.img || (({ src, alt, ...props }) => (
      <ImageWithLoading src={src} alt={alt || ""} className="max-w-full h-auto rounded-lg shadow-md mx-auto" loading="lazy" isStreaming={isStreaming} {...props} />
    )),
    pre: components.pre || defaultComponents.pre,
  }), [components, isStreaming]);

  useEffect(() => {
    const targetContent = typeof children === "string" ? children : String(children || "");
    targetContentRef.current = targetContent;

    if (!isStreaming) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      displayedLenRef.current = targetContent.length;
      setDisplayedContent(targetContent);
      return;
    }

    const { BASE_CHARS_PER_FRAME, MAX_CATCHUP_MULTIPLIER, CATCHUP_THRESHOLD, MIN_FRAME_MS, WORD_SNAP_LOOKAHEAD } = STREAM_CONFIG;

    const revealContent = (timestamp) => {
      if (timestamp - lastUpdateRef.current < MIN_FRAME_MS) {
        animationFrameRef.current = requestAnimationFrame(revealContent);
        return;
      }
      lastUpdateRef.current = timestamp;

      const target = targetContentRef.current;
      const currentLen = displayedLenRef.current;
      const lag = target.length - currentLen;

      if (lag <= 0) {
        animationFrameRef.current = null;
        return;
      }

      const multiplier = lag > CATCHUP_THRESHOLD
        ? Math.min(MAX_CATCHUP_MULTIPLIER, 1 + lag / CATCHUP_THRESHOLD)
        : 1;
      const charsToAdd = Math.ceil(BASE_CHARS_PER_FRAME * multiplier);
      let nextLen = Math.min(currentLen + charsToAdd, target.length);

      if (nextLen < target.length) {
        const spaceIdx = target.indexOf(" ", nextLen);
        const newlineIdx = target.indexOf("\n", nextLen);
        const boundary = Math.min(
          spaceIdx === -1 ? Infinity : spaceIdx + 1,
          newlineIdx === -1 ? Infinity : newlineIdx + 1,
        );
        if (boundary !== Infinity && boundary <= nextLen + WORD_SNAP_LOOKAHEAD) {
          nextLen = boundary;
        }
      }

      displayedLenRef.current = nextLen;
      setDisplayedContent(target.slice(0, nextLen));

      animationFrameRef.current = requestAnimationFrame(revealContent);
    };

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(revealContent);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [children, isStreaming]);

  const stableChildren = typeof children === "string" ? children : String(children || "");
  const contentToRender = isStreaming ? displayedContent : stableChildren;

  const { textWithPlaceholders, images } = useMemo(() => {
    if (!contentToRender) return { textWithPlaceholders: "", images: [] };
    if (isStreaming) return { textWithPlaceholders: contentToRender, images: [] };

    const codeBlockPlaceholders = [];
    const inlineCodePlaceholders = [];

    let processed = contentToRender.replace(/```[\s\S]*?```/g, (match) => {
      codeBlockPlaceholders.push(match);
      return `[[CODEBLOCK-${codeBlockPlaceholders.length - 1}]]`;
    });

    processed = processed.replace(/`[^`]+`/g, (match) => {
      inlineCodePlaceholders.push(match);
      return `[[INLINECODE-${inlineCodePlaceholders.length - 1}]]`;
    });

    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const imgs = [];
    let idx = 0;
    processed = processed.replace(imageRegex, (m, alt, src) => {
      imgs.push({ alt: alt || "", src });
      return `[[IMG-${idx++}]]`;
    });

    processed = processed.replace(/\[\[CODEBLOCK-(\d+)\]\]/g, (m, i) => codeBlockPlaceholders[parseInt(i)]);
    processed = processed.replace(/\[\[INLINECODE-(\d+)\]\]/g, (m, i) => inlineCodePlaceholders[parseInt(i)]);

    return { textWithPlaceholders: processed, images: imgs };
  }, [isStreaming ? displayedContent : stableChildren, isStreaming]);

  const parts = useMemo(() => textWithPlaceholders.split(/\[\[IMG-(\d+)\]\]/g), [textWithPlaceholders]);

  const groupedParts = useMemo(() => {
    const result = [];
    let currentImageGroup = [];

    parts.forEach((part, i) => {
      if (i % 2 === 1) {
        const imgIndex = Number(part);
        const img = images[imgIndex];
        if (img) currentImageGroup.push(img);
      } else {
        const trimmed = part.trim();
        if (trimmed === "" && currentImageGroup.length > 0) return;
        if (currentImageGroup.length > 0) {
          result.push({ type: "images", images: [...currentImageGroup] });
          currentImageGroup = [];
        }
        if (trimmed) result.push({ type: "text", content: part });
      }
    });

    if (currentImageGroup.length > 0) {
      result.push({ type: "images", images: currentImageGroup });
    }

    return result;
  }, [parts, images]);

  const activePlugins = useMemo(() => {
    const p = [remarkGfm];
    if (plugins.math) p.push(plugins.math);
    return p;
  }, [plugins]);

  return (
    <div ref={containerRef} data-streaming={isStreaming} className="prose dark:prose-invert max-w-none p-2 sm:p-4 leading-normal">
      {groupedParts.map((item, i) => {
        if (item.type === "images") {
          const imgs = item.images;
          if (isStreaming) {
            return <div key={`img-placeholder-${i}`} className="inline-flex items-center gap-2 px-2 py-1 text-xs text-zinc-500 bg-zinc-800/50 rounded">🖼️ {imgs.length} image{imgs.length !== 1 ? "s" : ""} loading...</div>;
          }
          if (imgs.length === 1) {
            return <ImageWithLoading key={`img-${i}`} src={imgs[0].src} alt={imgs[0].alt || ""} className="max-w-full h-auto rounded-lg shadow-md mx-auto" loading="lazy" isStreaming={isStreaming} />;
          }
          return (
            <div key={`masonry-${i}`} className="my-3 columns-2 md:columns-3 gap-2 space-y-2">
              {imgs.map((img, idx) => (
                <div key={idx} className="break-inside-avoid rounded-lg overflow-hidden bg-zinc-800">
                  <img src={img.src} alt={img.alt || ""} className="w-full h-auto block rounded-lg" loading="lazy" />
                </div>
              ))}
            </div>
          );
        }
        return (
          <ReactMarkdown key={`md-${i}`} remarkPlugins={activePlugins} components={mergedComponents}>
            {item.content}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children && prevProps.isStreaming === nextProps.isStreaming;
});

export default Markify;
