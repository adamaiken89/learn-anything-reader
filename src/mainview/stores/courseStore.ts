import { create } from 'zustand';

import type { Course } from '../../bun/types';
import { api } from '../api';
import { logger } from '../logger';
import { showToast } from '../toast';

interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  load: () => Promise<Course[]>;
  reset: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  loading: false,
  error: null,
  loaded: false,
  load: async () => {
    if (get().loaded) return get().courses;
    logger.debug('Loading courses');
    set({ loading: true, error: null });
    try {
      const courses = await api.courses.list();
      logger.info({ count: courses.length }, 'Courses loaded');
      set({ courses, loading: false, loaded: true });
      return courses;
    } catch (e) {
      logger.error({ err: (e as Error).message }, 'Failed to load courses');
      showToast.error('toast.loadFailed');
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  reset: () => set({ courses: [], loading: false, error: null, loaded: false }),
}));
