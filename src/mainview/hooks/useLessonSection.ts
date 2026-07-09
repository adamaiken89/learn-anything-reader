import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { Course, ModuleMeta } from '../../bun/types';
import { countCompleted, useCompletionStore } from '../stores/completionStore';
import { useLessonUIStore } from '../stores/lessonUIStore';
import { useSettingsStore } from '../stores/settingsStore';

export function useLessonSection(course: Course, module: ModuleMeta) {
  const storeKey = `${course.id}:${module.id}`;
  const isCompleted = useCompletionStore((s) => s.completed[storeKey] ?? false);
  const completedCount = useCompletionStore((s) => countCompleted(s.completed, course.id));
  const totalModules = useCompletionStore((s) => s.totalModules[course.id] ?? 0);
  const {
    toggle,
    load: loadCompletion,
    loadCourse: loadCourseCompletion,
  } = useCompletionStore(
    useShallow((s) => ({ toggle: s.toggle, load: s.load, loadCourse: s.loadCourse })),
  );

  const { showPomodoro, setSearchCourseOpen } = useLessonUIStore(
    useShallow((s) => ({
      showPomodoro: s.showPomodoro,
      setSearchCourseOpen: s.setSearchCourseOpen,
    })),
  );

  const { focusMode, rightPanel, setRightPanel } = useSettingsStore(
    useShallow((s) => ({
      focusMode: s.focusMode,
      rightPanel: s.rightPanel,
      setRightPanel: s.setRightPanel,
    })),
  );

  useEffect(() => {
    void loadCompletion(course.id, module.id);
    void loadCourseCompletion(course.id);
  }, [course.id, module.id, loadCompletion, loadCourseCompletion]);

  return {
    isCompleted,
    completedCount,
    totalModules,
    toggle,
    showPomodoro,
    setSearchCourseOpen,
    focusMode,
    rightPanel,
    setRightPanel,
  };
}
