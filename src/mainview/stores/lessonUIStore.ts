import { create } from 'zustand';

interface LessonUIState {
  showPomodoro: boolean;
  searchCourseOpen: boolean;
  visibleSection: string | null;
  togglePomodoro: () => void;
  setSearchCourseOpen: (v: boolean) => void;
  setVisibleSection: (id: string | null) => void;
}

export const useLessonUIStore = create<LessonUIState>((set) => ({
  showPomodoro: false,
  searchCourseOpen: false,
  visibleSection: null,
  togglePomodoro: () => set((s) => ({ showPomodoro: !s.showPomodoro })),
  setSearchCourseOpen: (v) => set({ searchCourseOpen: v }),
  setVisibleSection: (id) => set({ visibleSection: id }),
}));
