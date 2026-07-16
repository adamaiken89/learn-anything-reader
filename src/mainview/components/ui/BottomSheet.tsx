import { X } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    const delta = e.touches[0].clientY - dragStart.current;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) onClose();
    setDragY(0);
    dragStart.current = null;
  };

  const onEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  });

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl max-h-[85vh] flex flex-col safe-area-bottom"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform 0.25s ease-out' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 rounded-full bg-gray-600 mx-auto md:hidden" />
            {title && <span className="text-sm font-medium text-gray-200">{title}</span>}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-md">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
