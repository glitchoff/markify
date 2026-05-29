import { memo, useEffect, useState, useRef } from 'react';

const MermaidBlock = memo(function MermaidBlock({ children, className, ...props }) {
  const [rendered, setRendered] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;
    
    const initMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        containerRef.current.classList.add('mermaid');
        containerRef.current.textContent = children;
        await mermaid.run({ nodes: [containerRef.current] });
        setRendered(true);
      } catch (e) {
        console.warn('Mermaid not available');
      }
    };
    
    initMermaid();
  }, [children]);

  return (
    <div className="relative my-2 w-full">
      <pre ref={containerRef} className={`${className || ''} rounded-lg p-3 sm:p-4 bg-[#0d1117] border border-white/10 text-white/90 font-mono text-sm leading-relaxed w-full sm:w-auto`} {...props}>
        {children}
      </pre>
    </div>
  );
});

export const mermaid = {
  components: {
    pre: ({ children, className, ...props }) => {
      const code = Array.isArray(children) ? children[0] : children;
      const codeText = code?.props?.children || '';
      if (className?.includes('language-mermaid') || codeText.trim().startsWith('graph') || codeText.trim().startsWith('flowchart')) {
        return <MermaidBlock className={className} {...props}>{codeText}</MermaidBlock>;
      }
      return <pre className={className} {...props}>{children}</pre>;
    },
  },
};

export function createMermaidPlugin() {
  return mermaid;
}

export default mermaid;
