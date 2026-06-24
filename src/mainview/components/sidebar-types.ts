export interface Section {
  id: string;
  heading: string;
  level: number;
  parentID: string | null;
}

export interface Note {
  id: string;
  courseID: string;
  moduleID: string | number;
  highlightID: string | null;
  sectionID: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: string;
  courseID: string;
  moduleID: string | number;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  color: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  courseID: string;
  moduleID: string | number;
  sectionID: string | null;
  title: string;
  scrollPosition: number;
  createdAt: string;
}
