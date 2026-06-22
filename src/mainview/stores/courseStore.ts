import { create } from "zustand";
import { api } from "../api";
import type { Course } from "../../bun/types";

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
    set({ loading: true, error: null });
    api.courses.list()
      .then((courses) => set({ courses, loading: false, loaded: true }))
      .catch((e: Error) => set({ error: e.message, loading: false }));
  },
  reset: () => set({ courses: [], loading: false, error: null, loaded: false }),
}));
