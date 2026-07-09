import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';
import { useShallow } from 'zustand/react/shallow';

import { api } from '../../api';
import { useAutoCopy } from '../../hooks/useAutoCopy';
import { useCurrentLesson } from '../../hooks/useCurrentLesson';
import { useHighlights } from '../../hooks/useHighlights';
import { findVisibleHeading } from '../../hooks/useLesson';
import type { UseLessonSearchReturn } from '../../hooks/useLessonSearch';
import { useNotePopoverOnClick } from '../../hooks/useNotePopoverOnClick';
import { useNotes } from '../../hooks/useNotes';
import { useSelection } from '../../hooks/useSelection';
import { components as lessonComponents } from '../../sections/lessonHelpers';
import { useHighlightsStore } from '../../stores/highlightsStore';
import { useLessonUIStore } from '../../stores/lessonUIStore';
import { useLessonViewStore } from '../../stores/lessonViewStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useViewStore } from '../../stores/viewStore';
import { THEME_TOKENS, themeToCSSVars } from '../../themes';
import { rehypeCloze } from '../rehypeCloze';
import { rehypeHighlightText } from '../rehypeHighlightText';
import { rehypeSearchText } from '../rehypeSearchText';
import ClozeBlank from './ClozeBlank';
import LessonContentCompletionButton from './LessonContentCompletionButton';
import LessonContentHeader from './LessonContentHeader';
import NotePopover from './NotePopover';
import SelectionToolbar from './SelectionToolbar';

interface LessonContentViewerProps {
  search: UseLessonSearchReturn;
}

function ClozeBlockquote({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  const ref = useRef<HTMLQuoteElement>(null);
  useEffect(() => {
    const bq = ref.current;
    if (!bq) return;
    const btn = bq.querySelector('.cloze-reveal-all-btn');
    if (!btn) return;
    const handler = () => {
      const blanks = bq.querySelectorAll('.cloze-blank-hidden');
      blanks.forEach((el) => (el as HTMLElement).click());
    };
    btn.addEventListener('click', handler);
    return () => btn.removeEventListener('click', handler);
  }, []);
  return (
    <blockquote ref={ref} {...props}>
      {children}
    </blockquote>
  );
}

export default function LessonContentViewer({ search }: LessonContentViewerProps) {
  const { t } = useTranslation();
  const { course, module } = useCurrentLesson();
  const push = useViewStore((s) => s.push);
  const contentRef = useLessonViewStore((s) => s.contentRef);
  const setMarkdownRef = useLessonViewStore((s) => s.setMarkdownRef);
  const bodyContent = useLessonViewStore((s) => s.bodyContent);
  const [scrollPct, setScrollPct] = useState(0);
  const sections = useLessonViewStore((s) => s.sections);
  const courseId = useLessonViewStore((s) => s.courseId);
  const moduleId = useLessonViewStore((s) => s.moduleId);
  const [hasCloze, setHasCloze] = useState(false);
  const [hasCumulative, setHasCumulative] = useState(false);

  useEffect(() => {
    if (courseId && moduleId) {
      api.quiz
        .hasCloze(courseId, moduleId)
        .then(setHasCloze)
        .catch(() => {});
      api.quiz
        .hasCumulative(courseId)
        .then(setHasCumulative)
        .catch(() => {});
    }
  }, [courseId, moduleId]);

  const { contentWidth, fontSize, theme, focusMode } = useSettingsStore(
    useShallow((s) => ({
      contentWidth: s.contentWidth,
      fontSize: s.fontSize,
      theme: s.theme,
      focusMode: s.focusMode,
    })),
  );
  const themeVars = themeToCSSVars(THEME_TOKENS[theme]);

  const { notes } = useNotes(courseId, moduleId);
  useHighlights(courseId, moduleId);
  const selectionState = useSelection(contentRef);
  const { handleTextSelectionWithAutoCopy } = useAutoCopy(selectionState.handleTextSelection);
  useNotePopoverOnClick(
    contentRef,
    notes,
    selectionState.setSelectedHighlight,
    selectionState.handleTextSelection,
  );

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const id = findVisibleHeading(el, sections);
    useLessonUIStore.getState().setVisibleSection(id);
    const pct =
      el.scrollHeight > el.clientHeight
        ? Math.min(100, Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100))
        : 0;
    setScrollPct(pct);
  }, [contentRef, sections]);

  const highlights = useHighlightsStore((s) => s.byModule[`${courseId}:${moduleId}`]);
  const markdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setMarkdownRef(markdownRef);
  }, [setMarkdownRef]);

  const rehypePlugins = useMemo(
    () =>
      [
        rehypeHighlight,
        rehypeCloze,
        [rehypeHighlightText, highlights ?? []],
        ...(search.searchActive && search.searchQuery
          ? [[rehypeSearchText, search.searchQuery, search.caseSensitive]]
          : []),
      ] as PluggableList,
    [highlights, search.searchActive, search.searchQuery, search.caseSensitive],
  );

  return (
    <>
      <div className="flex-1 flex flex-col overflow-clip min-h-0">
        <div className="relative h-0.5 bg-gray-700/50 shrink-0">
          <div
            className="absolute top-0 left-0 h-full bg-indigo-500 reading-progress-bar"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
        <div
          className={`flex-1 overflow-y-auto min-h-0${focusMode ? ' hide-scrollbar' : ''}`}
          data-testid="lesson-content"
          ref={contentRef}
          tabIndex={-1}
          onScroll={handleScroll}
        >
          <div
            className={`px-3 sm:px-6 book-content${contentWidth === 'wide' ? ' book-content-wide' : contentWidth === 'standard' ? ' book-content-standard' : ''}`}
            data-testid="book-content-area"
            style={{ fontSize: `${fontSize}px`, ...themeVars }}
            onMouseUp={handleTextSelectionWithAutoCopy}
          >
            <LessonContentHeader rehypePlugins={rehypePlugins} />
            <div ref={markdownRef} data-markdown-root>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={rehypePlugins}
                components={{
                  ...lessonComponents,
                  blockquote: ClozeBlockquote,
                  span: ({ className, ...props }) => {
                    if (className?.includes('cloze-blank')) {
                      return (
                        <ClozeBlank
                          answer={(props as Record<string, string>)['data-answer'] || ''}
                        />
                      );
                    }
                    return <span className={className} {...props} />;
                  },
                }}
              >
                {bodyContent}
              </ReactMarkdown>
            </div>

            <div style={{ height: '50vh' }} />

            <div className="flex items-center justify-center gap-4 mt-8">
              <LessonContentCompletionButton />
              {course && module && (
                <div className="flex items-center bg-gray-800/50 border border-gray-700/60 rounded-lg overflow-hidden font-sans">
                  <button
                    onClick={() => push({ type: 'quiz', course, module })}
                    className="px-3 py-1.5 text-[11px] font-medium bg-indigo-600/80 text-indigo-100 hover:bg-indigo-500/80 transition-colors"
                  >
                    {t('lesson.quizMCQ', 'MCQ')}
                  </button>
                  {hasCloze && (
                    <>
                      <div className="h-4 w-px bg-gray-600/50" />
                      <button
                        onClick={() => push({ type: 'clozeQuiz', course, module })}
                        className="px-3 py-1.5 text-[11px] text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                      >
                        {t('lesson.quizCloze', 'Cloze')}
                      </button>
                    </>
                  )}
                  {hasCumulative && (
                    <>
                      <div className="h-4 w-px bg-gray-600/50" />
                      <button
                        onClick={() => push({ type: 'cumulativeQuiz', course })}
                        className="px-3 py-1.5 text-[11px] text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                      >
                        {t('lesson.quizCumulative', 'Cumulative')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SelectionToolbar />
      <NotePopover />
    </>
  );
}
