import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

export default function MermaidDiagram({ code, className }: { code: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
    mermaid
      .render(id, code)
      .then(({ svg }) => setSvg(svg))
      .catch((e) => setError(String(e)));
  }, [code]);

  if (error)
    return (
      <pre className={className}>
        <code className={className}>{code}</code>
        <div className="mermaid-error">{error}</div>
      </pre>
    );
  if (!svg) return <div className="mermaid-loading">Loading diagram...</div>;
  return <div ref={ref} className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
