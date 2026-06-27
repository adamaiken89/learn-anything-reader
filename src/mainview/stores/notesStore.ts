import { create } from 'zustand';

import type { Note } from '../../bun/types';
import { api } from '../api';
import { showToast } from '../toast';

function key(courseId: string, moduleId: string) {
  return `${courseId}:${moduleId}`;
}

interface NotesState {
  byModule: Record<string, Note[]>;
  loading: Record<string, boolean>;
  load(courseId: string, moduleId: string): Promise<void>;
  add(note: {
    courseID: string;
    moduleID: string;
    content: string;
    sectionID?: string;
    highlightID?: string;
  }): Promise<void>;
  update(id: string, content: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export const useNotesStore = create<NotesState>((set) => ({
  byModule: {},
  loading: {},

  load: async (courseId, moduleId) => {
    const k = key(courseId, moduleId);
    set((s) => ({ loading: { ...s.loading, [k]: true } }));
    try {
      const data = await api.storage.notes(courseId, moduleId);
      set((s) => ({ byModule: { ...s.byModule, [k]: Array.isArray(data) ? data : [] } }));
    } catch {
      showToast.error('toast.loadFailed');
      set((s) => ({ byModule: { ...s.byModule, [k]: [] } }));
    } finally {
      set((s) => ({ loading: { ...s.loading, [k]: false } }));
    }
  },

  add: async (note) => {
    const created = await api.storage.addNote(note);
    const k = key(note.courseID, note.moduleID);
    set((s) => ({
      byModule: { ...s.byModule, [k]: [...(s.byModule[k] ?? []), created] },
    }));
  },

  update: async (id, content) => {
    await api.storage.updateNote(id, content);
    set((s) => {
      const byModule = { ...s.byModule };
      for (const k of Object.keys(byModule)) {
        byModule[k] = byModule[k].map((n) =>
          n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n,
        );
      }
      return { byModule };
    });
  },

  remove: async (id) => {
    await api.storage.deleteNote(id);
    set((s) => {
      const byModule = { ...s.byModule };
      for (const k of Object.keys(byModule)) {
        byModule[k] = byModule[k].filter((n) => n.id !== id);
      }
      return { byModule };
    });
  },
}));
