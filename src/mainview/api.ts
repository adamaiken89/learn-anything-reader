import type {
  Course,
  ModuleMeta,
  QuizQuestion,
  ModuleSection,
  SRSDeck,
  SRSCard,
  Highlight,
  Note,
  Bookmark,
} from '../bun/types';

const API_PORT = new URLSearchParams(window.location.search).get('apiPort') || '50001';
const BASE = `http://localhost:${API_PORT}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

interface OkResponse {
  ok: true;
}

interface QuizState {
  currentIndex: number;
  selectedAnswers: Record<string, string>;
  isCompleted: boolean;
  currentQuestion: QuizQuestion | null;
  score: { correct: number; total: number };
  percentage: number;
}

export const api = {
  courses: {
    list: () => request<Course[]>('/courses'),
    modules: (courseId: string) => request<ModuleMeta[]>(`/courses/${courseId}/modules`),
    lesson: (courseId: string, moduleId: number) =>
      request<{ content: string }>(`/courses/${courseId}/modules/${moduleId}/lesson`),
    quiz: (courseId: string, moduleId: number) =>
      request<QuizQuestion[]>(`/courses/${courseId}/modules/${moduleId}/quiz`),
    sections: (courseId: string, moduleId: number) =>
      request<ModuleSection[]>(`/courses/${courseId}/modules/${moduleId}/sections`),
    srs: {
      get: (courseId: string) => request<SRSDeck>(`/courses/${courseId}/srs`),
      filter: (courseId: string, filter: string) =>
        request<SRSCard[]>(`/courses/${courseId}/srs/filter/${filter}`),
      toggleStar: (courseId: string, cardId: string) =>
        request<SRSDeck>(`/courses/${courseId}/srs`, {
          method: 'POST',
          body: JSON.stringify({ cardId }),
        }),
      review: (courseId: string, cardId: string, correct: boolean, deck: SRSDeck) =>
        request<SRSCard>(`/courses/${courseId}/srs/review`, {
          method: 'POST',
          body: JSON.stringify({ cardId, correct, deck }),
        }),
      create: (courseId: string, question: QuizQuestion, moduleId: number) =>
        request<SRSCard>(`/courses/${courseId}/srs/create`, {
          method: 'POST',
          body: JSON.stringify({ question, moduleId }),
        }),
    },
  },
  quiz: {
    start: (courseId: string, moduleId: number) =>
      request<QuizQuestion[]>('/quiz/start', {
        method: 'POST',
        body: JSON.stringify({ courseId, moduleId }),
      }),
    state: () => request<QuizState>('/quiz/state'),
    select: (answer: string) =>
      request<OkResponse>('/quiz/select', {
        method: 'POST',
        body: JSON.stringify({ answer }),
      }),
    next: () => request<OkResponse>('/quiz/next', { method: 'POST' }),
    reset: () => request<OkResponse>('/quiz/reset', { method: 'POST' }),
  },
  storage: {
    highlights: (courseID: string, moduleID: number) =>
      request<Highlight[]>(
        `/storage/highlights?courseID=${encodeURIComponent(courseID)}&moduleID=${moduleID}`,
      ),
    addHighlight: (data: {
      courseID: string;
      moduleID: number;
      selectedText: string;
      startOffset: number;
      endOffset: number;
      color?: string;
    }) => request<Highlight>('/storage/highlights', { method: 'POST', body: JSON.stringify(data) }),
    deleteHighlight: (id: string) =>
      request<OkResponse>(`/storage/highlights/${id}`, { method: 'DELETE' }),
    notes: (courseID: string, moduleID: number) =>
      request<Note[]>(
        `/storage/notes?courseID=${encodeURIComponent(courseID)}&moduleID=${moduleID}`,
      ),
    addNote: (data: {
      courseID: string;
      moduleID: number;
      content: string;
      highlightID?: string;
      sectionID?: string;
    }) => request<Note>('/storage/notes', { method: 'POST', body: JSON.stringify(data) }),
    updateNote: (id: string, content: string) =>
      request<OkResponse>(`/storage/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
    deleteNote: (id: string) => request<OkResponse>(`/storage/notes/${id}`, { method: 'DELETE' }),
    bookmarks: () => request<Bookmark[]>('/storage/bookmarks'),
    courseBookmarks: (courseID: string) =>
      request<Bookmark[]>(`/storage/bookmarks/course/${courseID}`),
    moduleBookmarks: (courseID: string, moduleID: number) =>
      request<Bookmark[]>(`/storage/bookmarks/module/${courseID}/${moduleID}`),
    addBookmark: (data: {
      courseID: string;
      moduleID: number;
      title: string;
      sectionID?: string;
      scrollPosition?: number;
    }) => request<Bookmark>('/storage/bookmarks', { method: 'POST', body: JSON.stringify(data) }),
    deleteBookmark: (id: string) =>
      request<OkResponse>(`/storage/bookmarks/${id}`, { method: 'DELETE' }),
    checkBookmark: (courseID: string, moduleID: number) =>
      request<boolean>(
        `/storage/check-bookmark?courseID=${encodeURIComponent(courseID)}&moduleID=${moduleID}`,
      ),
    isCompleted: (courseID: string, moduleID: number) =>
      request<{ completed: boolean }>(
        `/storage/completed?courseID=${encodeURIComponent(courseID)}&moduleID=${moduleID}`,
      ),
    toggleCompleted: (courseID: string, moduleID: number) =>
      request<{ completed: boolean }>('/storage/completed', {
        method: 'POST',
        body: JSON.stringify({ courseID, moduleID }),
      }),
    completedCount: (courseID: string) =>
      request<{ count: number }>(
        `/storage/completed/count?courseID=${encodeURIComponent(courseID)}`,
      ),
  },
  gemini: {
    hasKey: () => request<{ hasKey: boolean }>('/gemini/key'),
    setKey: (key: string) =>
      request<OkResponse>('/gemini/key', { method: 'POST', body: JSON.stringify({ key }) }),
    ask: (question: string, context: string) =>
      request<{ response: string }>('/gemini/ask', {
        method: 'POST',
        body: JSON.stringify({ question, context }),
      }),
  },
};
