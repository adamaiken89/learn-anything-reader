import { useCallback } from 'react';

import type { Course, ModuleMeta } from '../../bun/types';
import { api } from '../api';
import { useViewStore } from '../stores/viewStore';

interface UseLessonNavReturn {
  hasPrev: boolean;
  hasNext: boolean;
  goPrev: () => void;
  goNext: () => void;
}

export function useLessonNav(course: Course, module: ModuleMeta): UseLessonNavReturn {
  const push = useViewStore((s) => s.push);

  const currentIdx = course.modules.findIndex((m) => m.id === module.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < course.modules.length - 1;

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    const prevMod = course.modules[currentIdx - 1];
    void api.session.getModuleSession(course.id, prevMod.id).then((session) => {
      push({ type: 'lesson', course, module: prevMod, sectionID: session?.sectionId || undefined });
    });
  }, [hasPrev, course, currentIdx, push]);

  const goNext = useCallback(() => {
    if (hasNext) push({ type: 'lesson', course, module: course.modules[currentIdx + 1] });
  }, [hasNext, course, currentIdx, push]);

  return { hasPrev, hasNext, goPrev, goNext };
}
