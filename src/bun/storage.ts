// Re-exports from domain persistence modules.
// Kept for backward compatibility — consumers can migrate to direct imports.

export { load, save, clearAllData, invalidateCache } from './persistence';
export type { StorageData } from './persistence';

export {
  getHighlightsForModule,
  addHighlight,
  deleteHighlight,
  addNote,
  getNotesForModule,
  updateNote,
  deleteNote,
  addAnnotation,
  addBookmark,
  getAllBookmarks,
  getBookmarksForCourse,
  getBookmarksForModule,
  deleteBookmark,
  isBookmarked,
} from './persistence-annotations';

export {
  isModuleCompleted,
  toggleModuleCompleted,
  getCompletedModuleIDs,
  getCompletedModuleCount,
  addStudySession,
  getLastQuizSession,
  getStudySessions,
  getGlobalStudySessions,
  getDailyStreak,
  getGeminiKey,
  setGeminiKey,
  getSyncConfig,
  saveSyncConfig,
  getLastSession,
  setLastSession,
  clearLastSession,
  getModuleSession,
  setModuleSession,
  getCourseModuleSessions,
} from './persistence-progress';

export {
  addUserCard,
  getUserCards,
  getAllUserCards,
  getUserCardById,
  deleteUserCard,
  updateUserCard,
  reviewUserCard,
  toggleUserCardStar,
} from './persistence-usercards';
