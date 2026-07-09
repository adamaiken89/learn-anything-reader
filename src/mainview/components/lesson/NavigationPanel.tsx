import { Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModuleMeta, Section } from '../../../bun/types';
import { logger } from '../../logger';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useCompletionStore } from '../../stores/completionStore';
import { useLessonUIStore } from '../../stores/lessonUIStore';
import { useLessonViewStore } from '../../stores/lessonViewStore';
import type { RightPanel } from '../../stores/settingsStore';
import NotesHighlightsTab from '../studyTools/NotesHighlightsTab';
import { toggleVariants } from '../ui';
import SectionRow from './SectionRow';

interface NavigationPanelProps {
  sections: Section[];
  courseId: string;
  moduleId: string;
  moduleName: string;
  modules: ModuleMeta[];
  currentModuleId: string;
  hasPrev: boolean;
  hasNext: boolean;
  onGoPrev: () => void;
  onGoNext: () => void;
  onScrollToSection: (sectionId: string) => void;
  onModuleSelect: (mod: ModuleMeta) => void;
  onClose: () => void;
  activeTab: RightPanel;
  onTabChange: (tab: RightPanel) => void;
}

const AI_SKILLS = [
  {
    id: 'feynman',
    label: 'Feynman Explain',
    prompt:
      'Explain this section using the Feynman technique: simplify each concept as if teaching a beginner.',
  },
  {
    id: 'reframe',
    label: 'Reframe',
    prompt:
      'Reframe the key concepts in this lesson from a different perspective to deepen understanding.',
  },
  {
    id: 'drill',
    label: 'Drill',
    prompt: 'Generate practice questions for this lesson to test understanding.',
  },
] as const;

type AISkillId = (typeof AI_SKILLS)[number]['id'];

export default function NavigationPanel({
  sections: _sections,
  courseId,
  moduleId,
  moduleName,
  modules,
  currentModuleId,
  hasPrev: _hasPrev,
  hasNext: _hasNext,
  onGoPrev: _onGoPrev,
  onGoNext: _onGoNext,
  onScrollToSection,
  onModuleSelect,
  onClose,
  activeTab,
  onTabChange,
}: NavigationPanelProps) {
  const { t } = useTranslation();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [allSections, setAllSections] = useState<Record<string, Section[]>>({});
  const [activeAISkill, setActiveAISkill] = useState<AISkillId | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const activeModRef = useRef<HTMLButtonElement>(null);

  const visibleSection = useLessonUIStore((s) => s.visibleSection);
  const bookmarks = useBookmarksStore((s) => s.byModule[`${courseId}:${moduleId}`]) ?? [];
  const completed = useCompletionStore((s) => s.completed);
  const content = useLessonViewStore((s) => s.content);

  // Pre-fetch sections for all modules
  useEffect(() => {
    const load = async () => {
      const { api } = await import('../../api');
      const entries = await Promise.all(
        modules.map(async (mod) => {
          const secs = await api.courses.sections(courseId, mod.id);
          return [mod.id, secs] as const;
        }),
      );
      setAllSections(Object.fromEntries(entries));
    };
    void load();
  }, [courseId, modules]);

  // Auto-expand current module on mount / when it changes
  useEffect(() => {
    setExpandedModules((prev) => {
      if (prev.has(currentModuleId)) return prev;
      return new Set(prev).add(currentModuleId);
    });
  }, [currentModuleId]);

  // Scroll active module into view
  useEffect(() => {
    activeModRef.current?.scrollIntoView({ block: 'nearest' });
  }, [currentModuleId]);

  const toggleExpand = useCallback((modId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  }, []);

  const handleAISkill = async (skill: AISkillId) => {
    if (skill === activeAISkill && aiResponse) {
      setActiveAISkill(null);
      setAiResponse('');
      return;
    }
    const info = AI_SKILLS.find((s) => s.id === skill);
    if (!info) return;
    setActiveAISkill(skill);
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = content || '';
      const { api } = await import('../../api');
      const response = await api.gemini.ask(info.prompt, res);
      setAiResponse(response.response);
    } catch {
      setAiResponse(t('studyTools.aiError'));
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!visibleSection || !sectionsRef.current) return;
    const el = sectionsRef.current.querySelector(`[data-section-id="${visibleSection}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [visibleSection]);

  const handleToggleSectionBookmark = (sectionId: string, heading: string) => {
    const { toggle } = useBookmarksStore.getState();
    void toggle(courseId, moduleId, `${moduleName} – ${heading}`, sectionId);
  };

  return (
    <div data-testid="navigation-panel" className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="shrink-0 flex items-stretch border-b border-gray-700 min-h-0">
        {(['sections', 'ai', 'notes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 text-[11px] font-medium py-1 px-2 transition-colors ${
              activeTab === tab
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-900/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            {tab === 'sections' && t('lesson.sections')}
            {tab === 'ai' && 'AI+Ask'}
            {tab === 'notes' && 'Notes'}
          </button>
        ))}
        <button onClick={onClose} className={`px-2 ${toggleVariants({ active: true })}`}>
          →
        </button>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="overflow-y-auto flex-1" ref={sectionsRef}>
          {modules.map((mod) => {
            const isCurrent = mod.id === currentModuleId;
            const isExpanded = isCurrent || expandedModules.has(mod.id);
            const isCompleted = completed[`${courseId}:${mod.id}`] ?? false;
            const modSections = allSections[mod.id] ?? [];
            const displaySections = modSections.filter((s) => s.level > 1);
            return (
              <div key={mod.id}>
                <button
                  ref={isCurrent ? activeModRef : undefined}
                  onClick={() => {
                    if (!isCurrent) {
                      onModuleSelect(mod);
                    }
                    toggleExpand(mod.id);
                  }}
                  title={mod.name}
                  className={`w-full text-left px-2 py-1.5 text-xs transition-colors flex items-start ${
                    isCurrent
                      ? 'bg-indigo-900/30 text-indigo-300'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {/* Left zone: indicators (fixed) */}
                  <span className="shrink-0 flex items-center pt-px">
                    {/* Module number */}
                    <span className="w-5 text-right text-[10px] tabular-nums text-gray-500">
                      {modules.indexOf(mod) + 1}
                    </span>
                    {/* Completed check — Lucide icon */}
                    {isCompleted && <Check size={12} className="text-green-400 shrink-0" />}
                    {/* Expand arrow */}
                    <span className="w-3 text-center text-[10px] text-gray-500">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </span>
                  {/* Right zone: module name (flex-1, wraps) */}
                  <span className="flex-1 min-w-0 whitespace-normal leading-snug text-xs">
                    {mod.name}
                  </span>
                </button>
                {isExpanded && displaySections.length > 0 && (
                  <div>
                    {displaySections.map((s) => (
                      <SectionRow
                        key={s.id}
                        section={s}
                        isActive={s.id === visibleSection}
                        isBookmarked={bookmarks.some((b) => b.sectionID === s.id)}
                        onScrollTo={() => {
                          logger.debug(
                            { sectionId: s.id, heading: s.heading },
                            'NavigationPanel: section clicked',
                          );
                          onScrollToSection(s.id);
                        }}
                        onToggleBookmark={() => handleToggleSectionBookmark(s.id, s.heading)}
                      />
                    ))}
                  </div>
                )}
                {isExpanded && displaySections.length === 0 && isCurrent && (
                  <div className="p-4 text-center text-xs text-gray-500">
                    {t('lesson.noSections')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI+Ask Tab */}
      {activeTab === 'ai' && (
        <div className="overflow-y-auto flex-1 p-2.5">
          <div className="mb-3">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              AI Power-ups
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AI_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => void handleAISkill(skill.id)}
                className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                  activeAISkill === skill.id
                    ? 'bg-indigo-700/50 border-indigo-500 text-indigo-200'
                    : 'bg-gray-800/60 border-gray-600/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {skill.label}
              </button>
            ))}
          </div>
          {activeAISkill && (
            <div className="mb-3">
              {aiLoading ? (
                <div className="text-[10px] text-gray-400 animate-pulse">
                  {t('studyTools.thinking')}
                </div>
              ) : aiResponse ? (
                <div className="text-[10px] text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-800/60 rounded p-2 max-h-48 overflow-y-auto">
                  {aiResponse}
                </div>
              ) : null}
            </div>
          )}
          <div className="mb-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Ask anything
            </span>
          </div>
          <textarea
            className="w-full bg-gray-800/60 border border-gray-600/50 rounded p-2 text-xs text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500"
            rows={3}
            placeholder="Ask a question about this lesson..."
          />
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="overflow-y-auto flex-1">
          <NotesHighlightsTab />
        </div>
      )}
    </div>
  );
}
