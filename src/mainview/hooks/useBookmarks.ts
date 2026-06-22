import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Bookmark } from '../components/sidebar-types';

interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  loading: boolean;
  handleToggleBookmark: (title: string, sectionID: string | null) => Promise<void>;
  handleDeleteBookmark: (id: string) => Promise<void>;
  sectionBookmark: Bookmark | undefined;
  moduleBookmark: Bookmark | undefined;
  hasActiveBookmark: boolean;
  activeBookmarkId: string | undefined;
}

export function useBookmarks(
  courseId: string,
  moduleId: number,
  visibleSection: string | null,
): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.storage
      .moduleBookmarks(courseId, moduleId)
      .then(setBookmarks)
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  }, [courseId, moduleId]);

  const sectionBookmark = bookmarks.find((b) => b.sectionID === visibleSection);
  const moduleBookmark = bookmarks.find((b) => !b.sectionID);
  const hasActiveBookmark = visibleSection ? !!sectionBookmark : !!moduleBookmark;
  const activeBookmarkId = visibleSection ? sectionBookmark?.id : moduleBookmark?.id;

  const handleToggleBookmark = useCallback(
    async (title: string, sectionID: string | null) => {
      const existing = sectionID
        ? bookmarks.find((b) => b.sectionID === sectionID)
        : moduleBookmark;
      if (existing) {
        await api.storage.deleteBookmark(existing.id);
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
      } else {
        const bookmark = await api.storage.addBookmark({
          courseID: courseId,
          moduleID: moduleId,
          title,
          sectionID: sectionID ?? undefined,
          scrollPosition: 0,
        });
        setBookmarks((prev) => [...prev, bookmark]);
      }
    },
    [bookmarks, moduleBookmark, courseId, moduleId],
  );

  const handleDeleteBookmark = useCallback(async (id: string) => {
    await api.storage.deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    bookmarks,
    loading,
    handleToggleBookmark,
    handleDeleteBookmark,
    sectionBookmark,
    moduleBookmark,
    hasActiveBookmark,
    activeBookmarkId,
  };
}
