import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { api } from '../../api';
import { useLessonViewStore } from '../../stores/lessonViewStore';
import { useSelectionStore } from '../../stores/selectionStore';

function getSurroundingText(container: HTMLElement, range: Range, chars = 100): string {
  try {
    const fullText = container.textContent || '';
    const text = range.toString();
    const idx = fullText.indexOf(text);
    if (idx === -1) return '';
    const start = Math.max(0, idx - chars);
    const end = Math.min(fullText.length, idx + text.length + chars);
    let before = fullText.slice(start, idx).trim();
    let after = fullText.slice(idx + text.length, end).trim();
    if (start > 0) before = '...' + before.slice(-chars);
    if (end < fullText.length) after = after.slice(0, chars) + '...';
    return `${before} [...${text}...] ${after}`.trim();
  } catch {
    return '';
  }
}

export default function CardEditor() {
  const { t } = useTranslation();

  const store = useSelectionStore(
    useShallow((s) => ({
      selection: s.selection,
      showCardEditor: s.showCardEditor,
      closeCardEditor: s.closeCardEditor,
    })),
  );
  const courseId = useLessonViewStore((s) => s.courseId);
  const moduleId = useLessonViewStore((s) => s.moduleId);
  const contentRef = useLessonViewStore((s) => s.contentRef);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [clozeMode, setClozeMode] = useState(false);
  const prevShowRef = useRef(false);

  // Auto-populate from selection
  useEffect(() => {
    if (store.showCardEditor && !prevShowRef.current && store.selection) {
      const txt = store.selection.text;
      setFront(txt);
      // Generate back from surrounding context
      const container = contentRef.current;
      if (container && store.selection.range) {
        const ctx = getSurroundingText(container, store.selection.range);
        setBack(ctx);
      } else {
        setBack('');
      }
    }
    prevShowRef.current = store.showCardEditor;
  }, [store.showCardEditor, store.selection, contentRef]);

  const handleSave = () => {
    if (!front.trim() || !back.trim()) return;
    if (clozeMode) {
      // Create cloze card: selected term becomes blank, context becomes back
      const clozeFront = front.replace(/^(.+)$/, '[...$1]');
      void api.usercards.create(courseId, moduleId, clozeFront, back);
    } else {
      void api.usercards.create(courseId, moduleId, front, back);
    }
    store.closeCardEditor();
  };

  if (!store.showCardEditor || !store.selection) return null;

  return (
    <div data-testid="card-editor" className="border-t border-gray-600 p-3">
      <p className="text-[10px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">
        {t('lesson.createCard')}
      </p>

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setClozeMode(false)}
          className={`flex-1 py-1 text-[10px] rounded ${!clozeMode ? 'bg-indigo-700 text-white' : 'bg-gray-700 text-gray-400'}`}
        >
          {t('userCardReview.front')}
        </button>
        <button
          onClick={() => setClozeMode(true)}
          className={`flex-1 py-1 text-[10px] rounded ${clozeMode ? 'bg-indigo-700 text-white' : 'bg-gray-700 text-gray-400'}`}
        >
          Cloze Card
        </button>
      </div>

      <label className="text-[10px] text-gray-400 block mb-0.5">
        {clozeMode ? t('studyTools.cardFront') + ' → [...blank...]' : t('userCardReview.front')}
      </label>
      <textarea
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder={t('studyTools.cardFront')}
        className="w-full bg-gray-700 border border-gray-600 rounded text-xs p-2 text-gray-200 placeholder-gray-500 resize-none h-16 focus:outline-none focus:border-indigo-500 mb-2"
        autoFocus
      />
      <label className="text-[10px] text-gray-400 block mb-0.5">
        {clozeMode ? `${t('userCardReview.back')} (auto-filled from context)` : t('userCardReview.back')}
      </label>
      <textarea
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder={t('studyTools.cardBack')}
        className="w-full bg-gray-700 border border-gray-600 rounded text-xs p-2 text-gray-200 placeholder-gray-500 resize-none h-20 focus:outline-none focus:border-indigo-500"
      />
      <div className="flex gap-2 mt-1.5">
        <button
          onClick={handleSave}
          disabled={!front.trim() || !back.trim()}
          className="flex-1 py-1 text-[10px] bg-indigo-700 hover:bg-indigo-600 rounded disabled:opacity-40"
        >
          {t('common.save')}
        </button>
        <button
          onClick={store.closeCardEditor}
          className="py-1 text-[10px] text-gray-400 hover:text-gray-200"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
