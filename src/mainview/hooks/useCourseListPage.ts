import { useEffect } from 'react';

import { useCompletionStore } from '../stores/completionStore';
import { useCourseStore } from '../stores/courseStore';

export { countCompleted } from '../stores/completionStore';

export function useCourseListPage() {
  const courses = useCourseStore((s) => s.courses);
  const loading = useCourseStore((s) => s.loading);
  const error = useCourseStore((s) => s.error);
  const load = useCourseStore((s) => s.load);
  const completed = useCompletionStore((s) => s.completed);

  useEffect(() => {
    void load();
  }, [load]);

  return { courses, loading, error, completed };
}
