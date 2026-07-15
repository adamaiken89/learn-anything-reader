import { Check, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModuleMeta, ModuleSession, Section } from '../../../bun/types';
import { api } from '../../api';
import { logger } from '../../logger';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useCompletionStore } from '../../stores/completionStore';
import { useLessonUIStore } from '../../stores/lessonUIStore';
import type { RightPanel } from '../../stores/settingsStore';
import NotesHighlightsTab from '../studyTools/NotesHighlightsTab';
import { toggleVariants } from '../ui/variants/toggle';
import NavigationAITab from './NavigationAITab';
import SectionRow from './SectionRow';

interface NavigationPanelProps {
  courseId: string;
  moduleId: string;
  moduleName: string;
  modules: ModuleMeta[];
  currentModuleId: string;
  onScrollToSection: (sectionId: string) => void;
  onModuleSelect: (mod: ModuleMeta, sectionID?: string) => void;
  onClose: () => void;
  activeTab: RightPanel;
  onTabChange: (tab: RightPanel) => void;
}

export default function NavigationPanel({
  courseId,
  moduleId,
  moduleName,
  modules,
  currentModuleId,
  onScrollToSection,
  onModuleSelect,
  onClose,
  activeTab,
  onTabChange,
}: NavigationPanelProps) {
  const { t } = useTranslation();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [allSections, setAllSections] = useState<Record<string, Section[]>>({});
  const [moduleSessions, setModuleSessions] = useState<Record<string, ModuleSession>>({});
  const sectionsRef = useRef<HTMLDivElement>(null);
  const activeModRef = useRef<HTMLButtonElement>(null);

  const visibleSection = useLessonUIStore((s) => s.visibleSection);
  const bookmarks = useBookmarksStore((s) => s.byModule[`${courseId}:${moduleId}`]) ?? [];
  const completed = useCompletionStore((s) => s.completed);

  // Pre-fetch sections + module sessions
  useEffect(() => {
    const load = async () => {
      const [entries, sessions] = await Promise.all([
        Promise.all(modules.map((mod) => api.courses.sections(courseId, mod.id))),
        api.session.getCourseModuleSessions(courseId),
      ]);
      const sectionEntries = modules.map((mod, i) => [mod.id, entries[i]] as const);
      setAllSections(Object.fromEntries(sectionEntries));
      const sessionMap: Record<string, ModuleSession> = {};
      for (const s of sessions) {
        sessionMap[`${courseId}:${s.moduleId}`] = s;
      }
      setModuleSessions(sessionMap);
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
          <ChevronRight size={14} />
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
                      const s = moduleSessions[`${courseId}:${mod.id}`];
                      onModuleSelect(mod, s?.sectionId ?? undefined);
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
                    {/* Previously read indicator */}
                    {!isCompleted && moduleSessions[`${courseId}:${mod.id}`] && (
                      <span title={t('lesson.prevRead')}>
                        <Circle size={8} className="text-gray-500 fill-gray-500 shrink-0" />
                      </span>
                    )}
                    {/* Expand arrow */}
                    <span className="w-3 flex justify-center text-gray-500">
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
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
      {activeTab === 'ai' && <NavigationAITab />}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="overflow-y-auto flex-1">
          <NotesHighlightsTab />
        </div>
      )}
    </div>
  );
}
