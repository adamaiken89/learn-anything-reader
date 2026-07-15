import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';

import MermaidOverlay from './MermaidOverlay';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

let counter = 0;

interface Props {
  code: string;
  isDark?: boolean;
  bg?: string;
}

export default function MermaidDiagram({ code, isDark, bg }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const id = `mermaid-${++counter}`;
    let cancelled = false;
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default' });
    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [code, isDark]);

  if (error)
    return (
      <pre className="mermaid-error" data-testid="mermaid-error">
        {error}
      </pre>
    );
  if (!svg)
    return (
      <div className="mermaid-loading" data-testid="mermaid-loading">
        Loading diagram...
      </div>
    );
  return (
    <>
      <div
        ref={ref}
        className="mermaid-diagram"
        data-testid="mermaid-diagram"
        dangerouslySetInnerHTML={{ __html: svg }}
        onClick={() => setShowOverlay(true)}
      />
      {showOverlay && <MermaidOverlay svg={svg} bg={bg} onClose={() => setShowOverlay(false)} />}
    </>
  );
}
