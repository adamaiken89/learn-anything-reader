import { useEffect } from 'react';

import type { Course, ModuleMeta } from '../../bun/types';
import { countCompleted, useCompletionStore } from '../stores/completionStore';
import { useLessonUIStore } from '../stores/lessonUIStore';
import { useSettingsStore } from '../stores/settingsStore';

export function useLessonSection(course: Course, module: ModuleMeta) {
  const storeKey = `${course.id}:${module.id}`;
  const isCompleted = useCompletionStore((s) => s.completed[storeKey] ?? false);
  const completedCount = useCompletionStore((s) => countCompleted(s.completed, course.id));
  const totalModules = useCompletionStore((s) => s.totalModules[course.id] ?? 0);
  const toggle = useCompletionStore((s) => s.toggle);
  const loadCompletion = useCompletionStore((s) => s.load);
  const loadCourseCompletion = useCompletionStore((s) => s.loadCourse);

  const showTools = useLessonUIStore((s) => s.showTools);
  const showPomodoro = useLessonUIStore((s) => s.showPomodoro);
  const toggleTools = useLessonUIStore((s) => s.toggleTools);
  const setSearchCourseOpen = useLessonUIStore((s) => s.setSearchCourseOpen);

  const focusMode = useSettingsStore((s) => s.focusMode);
  const theme = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const contentWidth = useSettingsStore((s) => s.contentWidth);
  const showSections = useSettingsStore((s) => s.showSections);
  const toggleSections = useSettingsStore((s) => s.toggleSections);

  useEffect(() => {
    void loadCompletion(course.id, module.id);
    void loadCourseCompletion(course.id);
  }, [course.id, module.id, loadCompletion, loadCourseCompletion]);

  return {
    isCompleted,
    completedCount,
    totalModules,
    toggle,
    showTools,
    showPomodoro,
    toggleTools,
    setSearchCourseOpen,
    focusMode,
    theme,
    fontSize,
    contentWidth,
    showSections,
    toggleSections,
  };
}
