import { X } from 'lucide-react';
import mermaid from 'mermaid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

function MermaidOverlay({ svg, bg, onClose }: { svg: string; bg?: string; onClose: () => void }) {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStart = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Default to 150% zoom, centered
  useEffect(() => {
    requestAnimationFrame(() => {
      setZoom(1.5);
      setPan({ x: 0, y: 0 });
    });
  }, [svg]);

  // Window-level pan tracking during drag
  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      setPan({
        x: dragStart.current.panX + (e.clientX - dragStart.current.startX),
        y: dragStart.current.panY + (e.clientY - dragStart.current.startY),
      });
    };
    const onUp = () => setIsPanning(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isPanning]);

  const applyZoomWithCenterAnchor = useCallback(
    (newZoom: number) => {
      const rect = contentRef.current?.getBoundingClientRect();
      const cx = rect ? rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.height / 2 : window.innerHeight / 2;
      setPan({
        x: cx - (cx - pan.x) * (newZoom / zoom),
        y: cy - (cy - pan.y) * (newZoom / zoom),
      });
      setZoom(newZoom);
    },
    [zoom, pan.x, pan.y],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      setIsPanning(true);
      dragStart.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan.x, pan.y],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const newZoom = Math.max(0.5, Math.min(5, zoom * Math.exp(-e.deltaY * 0.002)));
      const rect = contentRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setPan({
        x: mx - (mx - pan.x) * (newZoom / zoom),
        y: my - (my - pan.y) * (newZoom / zoom),
      });
      setZoom(newZoom);
    },
    [zoom, pan.x, pan.y],
  );

  const handleDownload = async () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = bg || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'mermaid-diagram.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700 text-sm text-gray-300 shrink-0">
          <button
            onClick={() => applyZoomWithCenterAnchor(Math.min(5, zoom * 1.25))}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer"
          >
            +
          </button>
          <span className="w-16 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => applyZoomWithCenterAnchor(Math.max(0.5, zoom / 1.25))}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer"
          >
            −
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer"
          >
            {t('mermaid.reset', { defaultValue: 'Reset' })}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => void handleDownload()}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          >
            {t('mermaid.downloadPng')}
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div
          ref={contentRef}
          className="overflow-hidden flex-1 bg-gray-900 p-10"
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          <div
            className="mermaid-diagram"
            data-testid="mermaid-overlay-svg"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              cursor: isPanning ? 'grabbing' : 'grab',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    </div>
  );
}
