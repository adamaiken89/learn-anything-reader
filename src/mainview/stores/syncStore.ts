import { create } from 'zustand';
import { api } from '../api';

interface SyncState {
  lastSyncTime: string | null;
  lastSyncedCommit: string | null;
  isSyncing: boolean;
  remoteRepoURL: string;
  error: string | null;
  loadStatus: () => Promise<void>;
  startSync: () => Promise<void>;
  setRepoURL: (url: string) => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  lastSyncTime: null,
  lastSyncedCommit: null,
  isSyncing: false,
  remoteRepoURL: '',
  error: null,

  loadStatus: async () => {
    try {
      const status = await api.sync.status();
      set({
        lastSyncTime: status.lastSyncTime,
        lastSyncedCommit: status.lastSyncedCommit,
        isSyncing: status.isSyncing,
        remoteRepoURL: status.remoteRepoURL,
        error: null,
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  startSync: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true, error: null });
    try {
      const result = await api.sync.start();
      if (result.success) {
        set({
          lastSyncTime: new Date().toISOString(),
          lastSyncedCommit: result.commitHash,
          isSyncing: false,
        });
      } else {
        set({ isSyncing: false, error: result.message });
      }
    } catch (e) {
      set({ isSyncing: false, error: (e as Error).message });
    }
  },

  setRepoURL: async (url: string) => {
    try {
      await api.sync.setURL(url);
      set({ remoteRepoURL: url, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
