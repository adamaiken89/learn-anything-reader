import { useState, useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface TextSelection {
  text: string;
  range: Range;
}

interface UseSelectionReturn {
  showToolbar: boolean;
  showNoteEditor: boolean;
  showCardEditor: boolean;
  noteText: string;
  selection: TextSelection | null;
  pickerPos: { x: number; y: number; selectionTop: number };
  handleTextSelection: () => void;
  openNoteEditor: () => void;
  openCardEditor: () => void;
  setNoteText: (text: string) => void;
  closeToolbar: () => void;
  closeNoteEditor: () => void;
  closeCardEditor: () => void;
}

export function useSelection(scrollContainerRef?: RefObject<HTMLElement | null>): UseSelectionReturn {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0, selectionTop: 0 });
  const rafRef = useRef<number>(0);

  const handleTextSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setShowToolbar(false);
      setSelection(null);
      return;
    }
    const text = sel.toString().trim();
    if (!text || text.length > 500) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setSelection({ text, range });
    setPickerPos({ x: rect.left + rect.width / 2, y: rect.bottom, selectionTop: rect.top });
    setShowToolbar(true);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el || !selection) return;
    const updatePos = () => {
      try {
        const rect = selection.range.getBoundingClientRect();
        setPickerPos({ x: rect.left + rect.width / 2, y: rect.bottom, selectionTop: rect.top });
      } catch { /* range invalid */ }
    };
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePos);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener('scroll', onScroll);
    };
  }, [selection, scrollContainerRef]);

  const openNoteEditor = useCallback(() => {
    setShowNoteEditor(true);
    setNoteText('');
  }, []);

  const openCardEditor = useCallback(() => {
    setShowCardEditor(true);
  }, []);

  const closeToolbar = useCallback(() => {
    setShowToolbar(false);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  const closeNoteEditor = useCallback(() => {
    setShowNoteEditor(false);
    setNoteText('');
  }, []);

  const closeCardEditor = useCallback(() => {
    setShowCardEditor(false);
  }, []);

  return {
    showToolbar,
    showNoteEditor,
    showCardEditor,
    noteText,
    selection,
    pickerPos,
    handleTextSelection,
    openNoteEditor,
    openCardEditor,
    setNoteText,
    closeToolbar,
    closeNoteEditor,
    closeCardEditor,
  };
}
