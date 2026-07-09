import { Pencil } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectionStore } from '../../stores/selectionStore';

export default function NotePopover() {
  const { t } = useTranslation();
  const popoverNote = useSelectionStore((s) => s.popoverNote);
  const setPopoverNote = useSelectionStore((s) => s.setPopoverNote);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popoverNote) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPopoverNote(null);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverNote(null);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [popoverNote, setPopoverNote]);

  if (!popoverNote) return null;

  const clampedTop = Math.max(8, popoverNote.y - 120);
  const clampedLeft = Math.min(Math.max(8, popoverNote.x), window.innerWidth - 8);

  return (
    <div
      ref={ref}
      data-testid="note-popover"
      className="fixed z-50 bg-gray-900/80 backdrop-blur-md border border-gray-800/80 rounded-xl p-3 shadow-2xl max-w-xs"
      style={{ left: clampedLeft, top: clampedTop, transform: 'translate(-50%, 0)' }}
    >
      <p className="text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide flex items-center gap-1.5">
        <Pencil size={12} className="text-gray-400" />
        {t('studyTools.notes')}
      </p>
      <p className="text-xs text-gray-200 whitespace-pre-wrap">{popoverNote.note.content}</p>
    </div>
  );
}
