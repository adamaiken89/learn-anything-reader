import type { Highlight, Note, Bookmark } from "./types";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.env.HOME || "", ".coursereader");
const DB_FILE = join(DATA_DIR, "data.json");

interface StorageData {
  highlights: Highlight[];
  notes: Note[];
  bookmarks: Bookmark[];
  geminiAPIKey?: string;
}

function load(): StorageData {
  if (!existsSync(DB_FILE)) return { highlights: [], notes: [], bookmarks: [] };
  try {
    return JSON.parse(readFileSync(DB_FILE, "utf-8"));
  } catch {
    return { highlights: [], notes: [], bookmarks: [] };
  }
}

function save(data: StorageData): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getHighlightsForModule(courseID: string, moduleID: number): Highlight[] {
  const data = load();
  return data.highlights
    .filter((h) => h.courseID === courseID && h.moduleID === moduleID)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addHighlight(
  courseID: string,
  moduleID: number,
  selectedText: string,
  startOffset: number,
  endOffset: number,
  color: string = "yellow"
): Highlight {
  const data = load();
  const highlight: Highlight = {
    id: crypto.randomUUID(),
    courseID,
    moduleID,
    selectedText,
    startOffset,
    endOffset,
    color,
    createdAt: new Date().toISOString(),
  };
  data.highlights.push(highlight);
  save(data);
  return highlight;
}

export function deleteHighlight(id: string): void {
  const data = load();
  data.highlights = data.highlights.filter((h) => h.id !== id);
  save(data);
}

export function addNote(
  courseID: string,
  moduleID: number,
  content: string,
  highlightID?: string,
  sectionID?: string
): Note {
  const data = load();
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    courseID,
    moduleID,
    highlightID: highlightID || null,
    sectionID: sectionID || null,
    content,
    createdAt: now,
    updatedAt: now,
  };
  data.notes.push(note);
  save(data);
  return note;
}

export function getNotesForModule(courseID: string, moduleID: number): Note[] {
  const data = load();
  return data.notes
    .filter((n) => n.courseID === courseID && n.moduleID === moduleID)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function updateNote(id: string, content: string): void {
  const data = load();
  const note = data.notes.find((n) => n.id === id);
  if (note) {
    note.content = content;
    note.updatedAt = new Date().toISOString();
    save(data);
  }
}

export function deleteNote(id: string): void {
  const data = load();
  data.notes = data.notes.filter((n) => n.id !== id);
  save(data);
}

export function addBookmark(
  courseID: string,
  moduleID: number,
  title: string,
  sectionID?: string,
  scrollPosition: number = 0
): Bookmark {
  const data = load();
  const bookmark: Bookmark = {
    id: crypto.randomUUID(),
    courseID,
    moduleID,
    sectionID: sectionID || null,
    title,
    scrollPosition,
    createdAt: new Date().toISOString(),
  };
  data.bookmarks.push(bookmark);
  save(data);
  return bookmark;
}

export function getAllBookmarks(): Bookmark[] {
  const data = load();
  return data.bookmarks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getBookmarksForCourse(courseID: string): Bookmark[] {
  const data = load();
  return data.bookmarks
    .filter((b) => b.courseID === courseID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookmarksForModule(courseID: string, moduleID: number): Bookmark[] {
  const data = load();
  return data.bookmarks
    .filter((b) => b.courseID === courseID && b.moduleID === moduleID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function deleteBookmark(id: string): void {
  const data = load();
  data.bookmarks = data.bookmarks.filter((b) => b.id !== id);
  save(data);
}

export function getGeminiKey(): string | null {
  const data = load();
  return data.geminiAPIKey || null;
}

export function setGeminiKey(key: string): void {
  const data = load();
  data.geminiAPIKey = key;
  save(data);
}

export function isBookmarked(courseID: string, moduleID: number): boolean {
  const data = load();
  return data.bookmarks.some((b) => b.courseID === courseID && b.moduleID === moduleID);
}
