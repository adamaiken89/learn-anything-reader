import { HelpCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Shortcut } from '../../shortcuts';
import { SHORTCUTS } from '../../shortcuts';

const KEY_DISPLAY: Record<string, string> = {
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓',
  Escape: 'Esc',
  ' ': 'Space',
};

const ID_LABELS: Record<string, string> = {
  prevModule: 'Previous module',
  nextModule: 'Next module',
  scrollUp: 'Scroll up',
  scrollDown: 'Scroll down',
  toggleSections: 'Toggle sections panel',
  findInPage: 'Find in page',
  courseSearch: 'Course search',
  decFontSize: 'Decrease font size',
  incFontSize: 'Increase font size',
  cycleTheme: 'Cycle theme',
  toggleWidth: 'Toggle width',
  bookmark: 'Bookmark section',
  focusMode: 'Focus mode',
  pomodoro: 'Pomodoro timer',
  tools: 'Study tools',
  reviewCards: 'Review cards',
  quiz: 'Go to quiz',
  review: 'Open review',
  cycleTransition: 'Cycle transition',
  search: 'Search',
};

const READING_IDS = new Set([
  'decFontSize',
  'incFontSize',
  'cycleTheme',
  'toggleWidth',
  'bookmark',
  'focusMode',
  'pomodoro',
  'tools',
]);
const ACTION_IDS = new Set(['reviewCards', 'quiz', 'review', 'cycleTransition', 'search']);

const GROUPS = [
  { id: 'lesson', labelKey: 'Navigation' },
  { id: 'lessonToolbar', labelKey: 'Reading', filter: (s: Shortcut) => READING_IDS.has(s.id) },
  { id: 'all', labelKey: 'Actions', filter: (s: Shortcut) => ACTION_IDS.has(s.id) },
] as const;

function formatKey(s: (typeof SHORTCUTS)[number]): string {
  const key = KEY_DISPLAY[s.key] || s.key.toUpperCase();
  return s.mod ? `⌘${key}` : key;
}

export default function ShortcutHelp({ scope }: { scope?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const groups = GROUPS.filter((g) => !scope || g.id === scope || !scope).map((g) => ({
    ...g,
    shortcuts: SHORTCUTS.filter((s) => ('filter' in g ? g.filter(s) : s.scope === g.id)),
  }));

  const getDropdownLeft = (): number => {
    const btn = btnRef.current;
    const wrapper = ref.current;
    if (!btn || !wrapper) return 0;
    return btn.getBoundingClientRect().left - wrapper.getBoundingClientRect().left;
  };

  return (
    <div ref={ref} className="relative z-50">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`px-2 py-1 text-[11px] rounded border transition-all hover:shadow-sm hover:-translate-y-0.5 ${
          open
            ? 'bg-gray-800 text-white border-gray-600'
            : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-200'
        }`}
        title={t('lesson.shortcutHelp', 'Keyboard shortcuts')}
      >
        <HelpCircle size={16} />
      </button>
      {open && (
        <div
          className="absolute top-full mt-2 z-40 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl p-3.5 min-w-[260px] max-h-[min(400px,60vh)] overflow-y-auto"
          style={{ left: getDropdownLeft() }}
        >
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-900/95 border-l border-t border-gray-700/50 rotate-45" />
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {t('lesson.shortcutsTitle', 'Keyboard Shortcuts')}
          </div>
          {groups.map((g) =>
            g.shortcuts.length === 0 ? null : (
              <div key={g.id} className="mb-2 last:mb-0">
                <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {g.labelKey}
                </div>
                {g.shortcuts.map((s) => {
                  const label = ID_LABELS[s.id];
                  if (!label) return null;
                  return (
                    <div key={s.id} className="flex items-center justify-between py-0.5">
                      <span className="text-[11px] text-gray-300">{label}</span>
                      <kbd className="text-[10px] font-mono bg-gray-800 border border-gray-600/50 rounded px-1.5 py-0.5 text-gray-400 ml-3">
                        {formatKey(s)}
                      </kbd>
                    </div>
                  );
                })}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
