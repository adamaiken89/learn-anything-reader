export interface ModuleMeta {
  id: number;
  name: string;
  timeHours: number;
  prerequisites: number[];
  topics: string[];
}

export interface Course {
  id: string;
  course: string;
  timeBudgetHours: number;
  targetLevel: string;
  domain: string;
  prerequisites: string[];
  learningObjectives: string[];
  modules: ModuleMeta[];
  displayName: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  difficulty: number;
  tags: string[];
}

export interface SRSCard {
  id: string;
  questionId: string;
  moduleId: number;
  courseId: string;
  question: string;
  answer: string;
  explanation: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewed: string | null;
  isStarred: boolean;
}

export interface SRSDeck {
  cards: Record<string, SRSCard>;
}

export interface ModuleSection {
  id: string;
  heading: string;
  level: number;
  parentID: string | null;
}

export interface Highlight {
  id: string;
  courseID: string;
  moduleID: number;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  courseID: string;
  moduleID: number;
  highlightID: string | null;
  sectionID: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  courseID: string;
  moduleID: number;
  sectionID: string | null;
  title: string;
  scrollPosition: number;
  createdAt: string;
}

export interface CompletedModule {
  courseID: string;
  moduleID: number;
  completedAt: string;
}

export type NavigationDirection = 'prev' | 'next';

export type ReviewFilter = 'all' | 'due' | 'starred';

export interface AppState {
  courses: Course[];
  selectedCourse: Course | null;
  selectedModule: ModuleMeta | null;
  readerCourse: Course | null;
  readerSelectedModule: ModuleMeta | null;
  lessonContent: string;
  readerSections: ModuleSection[];
  readerVisibleSectionId: string | null;
  readerScrollTarget: string | null;
  lessonFontSize: number;
  currentHighlights: Highlight[];
  currentNotes: Note[];
  isBookmarked: boolean;
  srsDeck: SRSDeck;
  reviewFilter: ReviewFilter;
  quizQuestions: QuizQuestion[];
  quizCurrentIndex: number;
  quizSelectedAnswers: Record<string, string>;
  quizCompleted: boolean;
}
