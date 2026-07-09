import { createRequire } from 'module';
const _require = createRequire(import.meta.url);

function importStore<T>(path: string): T {
  const mod = _require(path) as T;
  return mod;
}

export function resetAllStores() {
  const stores = [
    importStore<{ useViewStore: unknown }>('./stores/viewStore').useViewStore,
    importStore<{ useCourseStore: unknown }>('./stores/courseStore').useCourseStore,
    importStore<{ useBookmarksStore: unknown }>('./stores/bookmarksStore').useBookmarksStore,
    importStore<{ useCompletionStore: unknown }>('./stores/completionStore').useCompletionStore,
    importStore<{ useHighlightsStore: unknown }>('./stores/highlightsStore').useHighlightsStore,
    importStore<{ useLessonUIStore: unknown }>('./stores/lessonUIStore').useLessonUIStore,
    importStore<{ useLessonViewStore: unknown }>('./stores/lessonViewStore').useLessonViewStore,
    importStore<{ useNotesStore: unknown }>('./stores/notesStore').useNotesStore,
    importStore<{ usePomodoroStore: unknown }>('./stores/pomodoroStore').usePomodoroStore,
    importStore<{ useSelectionStore: unknown }>('./stores/selectionStore').useSelectionStore,
    importStore<{ useSettingsStore: unknown }>('./stores/settingsStore').useSettingsStore,
    importStore<{ useSyncStore: unknown }>('./stores/syncStore').useSyncStore,
  ];

  for (const store of stores) {
    const s = store as { setState: (s: unknown) => void; getInitialState: () => unknown };
    s.setState(s.getInitialState());
  }
}
