import { create } from 'zustand';

import type { Course } from '../../bun/types';
import { api } from '../api';
import { logger } from '../logger';
import { showToast } from '../toast';
import { useCompletionStore } from './completionStore';

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
      .then(async (courses) => {
        logger.info({ count: courses.length }, 'Courses loaded');
        set({ courses, loading: false, loaded: true });
        void useCompletionStore.getState().loadAll(courses.map((c) => c.id));
      })
      .catch((e: Error) => {
        logger.error({ err: e.message }, 'Failed to load courses');
        showToast.error('toast.loadFailed');
        set({ error: e.message, loading: false });
      });
  },
  reset: () => set({ courses: [], loading: false, error: null, loaded: false }),
}));
