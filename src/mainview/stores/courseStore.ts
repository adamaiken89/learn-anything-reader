import { create } from 'zustand';
import { api } from '../api';
import { logger } from '../logger';
import type { Course } from '../../bun/types';

interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  load: () => void;
  reset: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  loading: false,
  error: null,
  loaded: false,
  load: () => {
    if (get().loaded) return;
    logger.debug('Loading courses');
    set({ loading: true, error: null });
    api.courses
      .list()
      .then((courses) => {
        logger.info({ count: courses.length }, 'Courses loaded');
        set({ courses, loading: false, loaded: true });
      })
      .catch((e: Error) => {
        logger.error({ err: e.message }, 'Failed to load courses');
        set({ error: e.message, loading: false });
      });
  },
  reset: () => set({ courses: [], loading: false, error: null, loaded: false }),
}));
