import { memo, useState, useMemo, useCallback } from 'react';

const CodeBlock = memo(function CodeBlock({ children, className: preClassName, highlight, ...props }) {
  const [copied, setCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(true);

  const codeElement = Array.isArray(children) ? children[0] : children;
  const codeClassName = codeElement?.props?.className || '';
  const match = /language-(\w+)/.exec(codeClassName || preClassName || '');
  const lang = match ? match[1] : 'plaintext';

  const codeText = useMemo(() => {
    const getCodeText = (nodeChildren) => {
      if (typeof nodeChildren === 'string') return nodeChildren.replace(/\n$/, '');
      if (Array.isArray(nodeChildren)) {
        return nodeChildren
          .map((child) => typeof child === 'string' ? child : child?.props?.children ? getCodeText(child.props.children) : '')
          .join('');
      }
      return nodeChildren?.props?.children ? getCodeText(nodeChildren.props.children) : '';
    };
    return getCodeText(codeElement?.props?.children).replace(/\n$/, '');
  }, [codeElement]);

  const highlighted = useMemo(() => {
    if (!highlight || lang === 'mermaid') return codeText;
    return highlight(codeText, lang);
  }, [codeText, lang, highlight]);

  const toggleWrap = useCallback(() => setIsWrapped((prev) => !prev), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = codeText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codeText]);

  return (
    <div className="relative my-2 w-full">
      <pre className={`${isWrapped ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'} rounded-lg p-3 sm:p-4 bg-[#0d1117] border border-white/10 text-white/90 font-mono text-sm leading-relaxed w-full sm:w-auto ${preClassName || ''}`} {...props}>
        <code className={`language-${lang} font-mono text-sm w-full`} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      <div className="absolute top-2 right-2 flex gap-1">
        <button onClick={toggleWrap} className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium">
          {isWrapped ? 'Unwrap' : 'Wrap'}
        </button>
        <button onClick={handleCopy} className={`bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${copied ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
});

export const code = {
  components: {
    pre: ({ children, className, ...props }) => <CodeBlock className={className} {...props}>{children}</CodeBlock>,
  },
};

export function createCodePlugin({ highlight }) {
  return {
    components: {
      pre: memo((props) => <CodeBlock highlight={highlight} {...props} />),
    },
  };
}

export default code;
