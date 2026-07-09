# C4 Component Diagram — CourseReader (Level 3)

```mermaid
C4Component
  title Component Diagram — CourseReader

  Person(student, "Student", "Uses the app to study")

  Container_Boundary(fe, "Frontend (React 19 + TypeScript + Vite)") {

    Boundary(pages, "Pages (src/mainview/pages/)") {
      Component(dashboard, "DashboardPage", "React component", "Course grid + module cards with stats, search/bookmarks/quick links")
      Component(lessonPage, "LessonPage", "React component", "Page transition wrapper, ModuleSwitcher + LessonSection")
      Component(quizPage, "QuizPage", "React component", "QuizSection wrapper with course/module context")
      Component(reviewPage, "ReviewPage", "React component", "ReviewSection wrapper for SRS review")
      Component(ucrPage, "UserCardReviewPage", "React component", "UserCardReviewSection wrapper for flash card review")
      Component(settingsPage, "SettingsPage", "React component", "Gemini API key, theme grid, font size, page transitions, sync, locale")
      Component(bookmarksPage, "BookmarksPage", "React component", "Bookmark list grouped by course, navigate/delete")
      Component(dashboardPage, "DashboardPage", "React component", "Per-course and global study stats, recent activity")
    }

    Boundary(sections, "Sections (src/mainview/sections/)") {
      Component(lessonSection, "LessonSection", "React component", "react-markdown renderer, section nav, search, notes, highlights, AI, scroll-to-section")
      Component(quizSection, "QuizSection", "React component", "MCQ quiz flow via RPC: load, select answer, score")
      Component(reviewSection, "ReviewSection", "React component", "SRS spaced repetition review via RPC")
      Component(ucrSection, "UserCardReviewSection", "React component", "Custom flash card review with SM-2")
    }

    Boundary(layouts, "Layouts (src/mainview/layouts/)") {
      Component(pageLayout, "PageLayout", "React component", "Outer wrapper: header + content area")
      Component(pageHeader, "PageHeader", "React component", "Back button + title + action buttons")
      Component(pageContent, "PageContent", "React component", "Scrollable content container (flex flex-col invariant)")
    }

    Boundary(stores, "Zustand Stores (src/mainview/stores/)") {
      Component(viewStore, "useViewStore", "Zustand store", "View stack: push, pop, replace, popToRoot")
      Component(courseStore, "useCourseStore", "Zustand store", "Course list, load/reset/refresh")
      Component(settingsStore, "useSettingsStore", "Zustand store", "Font size (10-28px), theme (18 themes), content width, focus mode, transitions, locale")
      Component(pomodoroStore, "usePomodoroStore", "Zustand store", "Focus/break timer with session tracking")
      Component(bookmarksStore, "useBookmarksStore", "Zustand store", "Bookmark CRUD, course/module filtering")
      Component(completionStore, "useCompletionStore", "Zustand store", "Module completion status per course")
      Component(highlightsStore, "useHighlightsStore", "Zustand store", "Highlight CRUD per module")
      Component(lessonUIStore, "useLessonUIStore", "Zustand store", "Lesson UI state: active section, search query, sidebar tab")
      Component(notesStore, "useNotesStore", "Zustand store", "Note CRUD per module")
      Component(syncStore, "useSyncStore", "Zustand store", "Remote content sync status, auto-sync on launch")
    }

    Boundary(hooks, "Hooks (src/mainview/hooks/)") {
      Component(useBookmarks, "useBookmarks", "React hook", "Bookmark CRUD via RPC, wraps bookmarksStore")
      Component(useHighlights, "useHighlights", "React hook", "Highlight CRUD via RPC, wraps highlightsStore")
      Component(useLesson, "useLesson", "React hook", "Lesson loading, sections, module nav")
      Component(useQuizEngine, "useQuizEngine", "React hook (useReducer)", "Quiz state machine: questions, currentIndex, score")
      Component(useReviewState, "useReviewState", "React hook (useReducer)", "SRS review state machine")
      Component(useCardReviewState, "useCardReviewState", "React hook (useReducer)", "User flash card review state machine")
      Component(useLessonNav, "useLessonNav", "React hook", "Module navigation with direction tracking")
      Component(useLessonSearch, "useLessonSearch", "React hook", "Section-level search with rehype search highlighting")
      Component(useNotes, "useNotes", "React hook", "Note CRUD via RPC, wraps notesStore")
      Component(useSelection, "useSelection", "React hook", "Text selection detection, highlight/note creation")
      Component(useShortcuts, "useShortcuts", "React hook", "Keyboard shortcut binding by scope")
      Component(useDashboard, "useDashboard", "React hook", "Orchestrates courseStore + viewStore + completionStore for dashboard")
      Component(useLessonSection, "useLessonSection", "React hook", "Orchestrates lessonUIStore + notesStore + highlightsStore")
      Component(useSettingsPage, "useSettingsPage", "React hook", "Orchestrates settingsStore + courseStore for settings")
    }

    Boundary(lessons, "Lesson Components (src/mainview/components/lesson/)") {
      Component(lessonToolbar, "LessonToolbar", "React component", "Theme cycle, font size, sections toggle, page transition, focus mode, copy link")
      Component(sectionsPanel, "SectionsPanel", "React component", "Section list with scroll-to, bookmark star indicator")
      Component(selectionToolbar, "SelectionToolbar", "React component", "Floating toolbar on text selection: highlight color picker, AI ask, add note")
      Component(noteEditor, "NoteEditor", "React component", "Inline note textarea with save/cancel")
      Component(cardEditor, "CardEditor", "React component", "Create flash card from selection: front/back editor")
      Component(colorPickerRow, "ColorPickerRow", "React component", "Color swatch row for highlight/annotation")
      Component(notePopover, "NotePopover", "React component", "Popover showing note linked to highlight")
      Component(viewerSearch, "ViewerSearch", "React component", "Within-lesson search bar: query input, match nav, match count")
    }

    Boundary(studyTools, "Study Tools (src/mainview/components/study-tools/)") {
      Component(notesHighlights, "NotesHighlightsTab", "React component", "List of notes + highlights for current module")
      Component(bookmarksTab, "BookmarksTab", "React component", "Bookmark list for current module")
      Component(cardsTab, "CardsTab", "React component", "SRS card list for current module")
      Component(aiTab, "AITab", "React component", "Gemini Q&A sidebar with context from selection")
    }

    Boundary(components, "Components (src/mainview/components/)") {
      Component(searchOverlay, "SearchOverlay", "React component", "⌘K global search: debounced, course filter chips, grouped results, section-level scroll-to")
      Component(studyTools, "StudyTools", "React component", "Tabbed side panel: notes/highlights, bookmarks, cards, AI")
      Component(pomodoro, "PomodoroTimer", "React component", "Focus/break timer with start/reset")
      Component(moduleSwitcher, "ModuleSwitcher", "React component", "Module dropdown for navigation")
      Component(courseSwitcher, "CourseSwitcher", "React component", "Course dropdown for switching courses (LessonPage)")
      Component(backToCourseList, "BackToCourseList", "React component", "← All Courses link")
      Component(mermaid, "MermaidDiagram", "React component", "Mermaid diagram rendering in lessons")
      Component(errorBoundary, "ErrorBoundary", "React component", "Error boundary wrapper")
      Component(rehypeHL, "rehype-highlight-text.ts", "rehype plugin", "Code syntax highlighting")
      Component(rehypeSearch, "rehype-search-text.ts", "rehype plugin", "Section-level search result highlighting")
    }

    Boundary(api, "API Client") {
      Component(rpcClient, "rpc.ts", "Electrobun RPC client", "BrowserView.rpc bridge to backend")
      Component(apiClient, "api.ts", "Typed RPC wrapper", "Wraps rpc.ts with typed methods, error handling, toast on failure")
    }

    Boundary(styles, "Styles") {
      Component(tailwind, "Tailwind CSS", "Utility framework", "All layout and component styles")
      Component(themes, "themes.ts", "Theme tokens + CSS vars", "18 themes via CSS custom properties: Theme → CSS vars mapping")
      Component(bookContent, "book-content CSS", "Custom CSS (index.css)", "Theme-driven prose styles via CSS variables, highlight.js overrides")
    }
  }

  Container_Boundary(be, "Backend (Bun Electrobun RPC handlers — src/bun/)") {

    Boundary(handlers, "RPC Handler (src/bun/index.ts)") {
      Component(router, "index.ts (Router)", "Electrobun RPC handler", "BrowserView.defineRPC handlers: all course, quiz, SRS, storage, search, stats, gemini, sync requests")
    }

    Boundary(services, "Backend Services") {
      Component(courseLoader, "course-loader.ts", "Bun module", "loadCourses(), loadLesson(), loadQuiz(), loadSRSDeck(), parseYAML, findModuleDir")
      Component(markdown, "lesson-markdown.ts", "Bun module", "processLessonMarkdown(): frontmatter parse, heading detection, section extraction, Mermaid extraction")
      Component(search, "search.ts", "Bun module", "Full-text search across lessons, notes, and highlights")
      Component(stats, "stats.ts", "Bun module", "CourseStats, GlobalStats computation, session logging")
      Component(sync, "sync.ts", "Bun module", "Git-based remote content sync (clone, pull, status)")
      Component(srs, "srs.ts", "Bun module", "SM-2 helpers: getDueCards, reviewCard, toggleStar, createSRSCard")
      Component(storage, "storage.ts", "Bun module", "JSON persistence: ~/.coursereader/data.json (highlights, notes, bookmarks, user cards, completion)")
      Component(gemini, "gemini.ts", "Bun module", "HTTP client for gemini-2.0-flash. API key from ~/.coursereader/prefs.json")
      Component(yaml, "yaml.ts", "Bun module", "Custom YAML parser (no external dep)")
      Component(utils, "utils.ts", "Bun module", "Utility functions (moduleID normalization, etc.)")
      Component(logger, "logger.ts", "Bun module", "Bun file logger: ~/.coursereader/logs/ — daily rotation by date")
    }

    Boundary(types, "Types") {
      Component(rpcSchema, "rpc-schema.ts", "TypeScript types", "Full RPC schema: AppRequests union, AppSchema — single source of truth for frontend→backend contract")
      Component(sharedTypes, "types.ts", "TypeScript interfaces", "Course, ModuleMeta, QuizQuestion, SRSCard, SRSDeck, Section, Highlight, Note, Bookmark, UserCard")
    }
  }

  System_Ext(fs, "File System", "subjects/ directory tree + ~/.coursereader/ + ~/.coursereader/logs/")
  System_Ext(geminiExt, "Google Gemini API", "generativelanguage.googleapis.com")

  Rel(student, courseList, "Browses courses")
  Rel(student, moduleList, "Selects module from course")
  Rel(student, lessonSection, "Reads lesson content")
  Rel(student, quizSection, "Takes MCQ quizzes")
  Rel(student, reviewSection, "Reviews SRS cards")
  Rel(student, ucrSection, "Reviews custom flash cards")
  Rel(student, settingsPage, "Configures API key, theme, font, transitions, sync, locale")
  Rel(student, bookmarksPage, "Views saved bookmarks")
  Rel(student, dashboardPage, "Views study stats")

  Rel(lessonPage, lessonSection, "Renders")
  Rel(quizPage, quizSection, "Renders")
  Rel(reviewPage, reviewSection, "Renders")
  Rel(ucrPage, ucrSection, "Renders")

  Rel(courseList, viewStore, "push(moduleList) on course select")
  Rel(moduleList, viewStore, "replace(courseList) on ← All Courses")
  Rel(moduleList, viewStore, "push(lesson) on module select")
  Rel(lessonPage, viewStore, "push(quiz/review/settings/bookmarks), replace(moduleList) on back")
  Rel(quizPage, viewStore, "pop on back")
  Rel(reviewPage, viewStore, "pop on back")
  Rel(ucrPage, viewStore, "pop on back")
  Rel(settingsPage, viewStore, "pop on back")
  Rel(bookmarksPage, viewStore, "replace(lesson) on open, pop on back")
  Rel(dashboardPage, viewStore, "pop on back")

  Rel(courseList, apiClient, "courses.list()")
  Rel(moduleList, apiClient, "reads course data (passed via viewStore)")
  Rel(lessonSection, apiClient, "courses.lesson(), storage.highlights/notes/bookmarks, gemini.ask()")
  Rel(quizSection, apiClient, "quiz.start()")
  Rel(reviewSection, apiClient, "courses.srs.*")
  Rel(ucrSection, apiClient, "usercards.*")
  Rel(settingsPage, apiClient, "gemini.*, sync.*")
  Rel(bookmarksPage, apiClient, "storage.bookmarks(), storage.deleteBookmark()")
  Rel(dashboardPage, apiClient, "stats.course() / stats.global()")

  Rel(apiClient, router, "rpc.ts request → BrowserView.rpc()")
  Rel(router, courseLoader, "loadCourses, loadLesson, loadQuiz, loadSRSDeck")
  Rel(router, markdown, "processLessonMarkdown")
  Rel(router, search, "searchAll")
  Rel(router, stats, "getCourseStats, getGlobalStats, logSession")
  Rel(router, sync, "syncStart, getSyncStatus, setURL")
  Rel(router, srs, "getDueCards, reviewCard, toggleStar, createSRSCard")
  Rel(router, storage, "saveHighlight, getNotes, bookmark ops, user card ops, completion")
  Rel(router, gemini, "askAboutHighlight, hasKey, setKey")
  Rel(router, yaml, "parseYAML")

  Rel(courseLoader, fs, "Reads subjects/<id>/syllabus.yaml, modules/<NN-*>/lesson.md, modules/<NN-*>/quiz.yaml, subjects/<id>/srs/deck.json")
  Rel(storage, fs, "Reads/writes ~/.coursereader/data.json, ~/.coursereader/prefs.json")
  Rel(logger, fs, "Writes ~/.coursereader/logs/<date>.log")
  Rel(gemini, geminiExt, "POST /v1beta/models/gemini-2.0-flash:generateContent")

  Rel(lessonSection, bookContent, "Applies .book-content CSS class with theme CSS vars")
```

## Component Groups

### Pages (9 components, src/mainview/pages/)

| Page | File | Responsibility |
|------|------|----------------|
| DashboardPage | `src/mainview/pages/DashboardPage.tsx` | Course grid + module cards with stats, search/bookmarks/quick links |
| LessonPage | `src/mainview/pages/LessonPage.tsx` | Page transition animations (flip/slide/fade), ModuleSwitcher + LessonSection |
| QuizPage | `src/mainview/pages/QuizPage.tsx` | QuizSection wrapper, passes course/module context |
| ReviewPage | `src/mainview/pages/ReviewPage.tsx` | ReviewSection wrapper for SRS review |
| UserCardReviewPage | `src/mainview/pages/UserCardReviewPage.tsx` | UserCardReviewSection wrapper for custom flash card review |
| SettingsPage | `src/mainview/pages/SettingsPage.tsx` | Gemini API key, theme grid (18), font size, page transitions, content width, focus mode, remote sync, locale |
| BookmarksPage | `src/mainview/pages/BookmarksPage.tsx` | Bookmark list grouped by course, open/delete |
| DashboardPage | `src/mainview/pages/DashboardPage.tsx` | Per-course + global stats, recent sessions, streak |

### Sections (4 + context, src/mainview/sections/)

| Section | File | Responsibility |
|---------|------|----------------|
| LessonSection | `src/mainview/sections/LessonSection.tsx` | Markdown reader, section nav, viewer search, AI, notes+highlights, scroll-to-section |
| QuizSection | `src/mainview/sections/QuizSection.tsx` | MCQ quiz: load questions, select answer, score |
| ReviewSection | `src/mainview/sections/ReviewSection.tsx` | SRS spaced repetition: due cards, rate ease/hard/good/easy |
| UserCardReviewSection | `src/mainview/sections/UserCardReviewSection.tsx` | Custom flash card review: front/back flip, rate correct/incorrect |
| LessonContext | `src/mainview/sections/LessonContext.ts` | React context for lesson state sharing |

### Layouts (3 components, src/mainview/layouts/)

| Component | File | Responsibility |
|-----------|------|----------------|
| PageLayout | `src/mainview/layouts/PageLayout.tsx` | Outer wrapper: header + content area |
| PageHeader | `src/mainview/layouts/PageHeader.tsx` | Back button + title + action buttons |
| PageContent | `src/mainview/layouts/PageContent.tsx` | Scrollable content container (flex flex-col invariant) |

### Lesson Components (8 components, src/mainview/components/lesson/)

| Component | File | Responsibility |
|-----------|------|----------------|
| LessonToolbar | `src/mainview/components/lesson/LessonToolbar.tsx` | Theme cycle, font size, sections toggle, page transition toggle, focus mode, module copy link, pomodoro |
| SectionsPanel | `src/mainview/components/lesson/SectionsPanel.tsx` | Section navigation with scroll-to, bookmark star (yellow=bookmarked, white=active, grey=inactive) |
| SelectionToolbar | `src/mainview/components/lesson/SelectionToolbar.tsx` | Floating toolbar: color picker, AI ask, add note/annotation |
| NoteEditor | `src/mainview/components/lesson/NoteEditor.tsx` | Inline note textarea with save/cancel |
| CardEditor | `src/mainview/components/lesson/CardEditor.tsx` | Flash card creation: auto-detected front/back with editable fields |
| ColorPickerRow | `src/mainview/components/lesson/ColorPickerRow.tsx` | Color swatch selection (yellow/green/blue/pink/purple) |
| NotePopover | `src/mainview/components/lesson/NotePopover.tsx` | Popover showing note content linked to highlight |
| ViewerSearch | `src/mainview/components/lesson/ViewerSearch.tsx` | Within-lesson search: input, match count, prev/next navigation |

### Study Tools (4 components, src/mainview/components/study-tools/)

| Component | File | Responsibility |
|-----------|------|----------------|
| NotesHighlightsTab | `src/mainview/components/study-tools/NotesHighlightsTab.tsx` | List of notes + highlights for current module |
| BookmarksTab | `src/mainview/components/study-tools/BookmarksTab.tsx` | Bookmark list for current module |
| CardsTab | `src/mainview/components/study-tools/CardsTab.tsx` | SRS card list for current module |
| AITab | `src/mainview/components/study-tools/AITab.tsx` | Gemini Q&A sidebar with context-aware prompting |

### Other Components (9, src/mainview/components/)

| Component | File | Responsibility |
|-----------|------|----------------|
| SearchOverlay | `src/mainview/components/SearchOverlay.tsx` | ⌘K global search: debounced (300ms), course filter chips, grouped results, section-level scroll-to |
| StudyTools | `src/mainview/components/StudyTools.tsx` | Tabbed side panel (N/H, Bookmarks, Cards, AI) |
| PomodoroTimer | `src/mainview/components/PomodoroTimer.tsx` | Focus (25m) / break (5m) timer with start/reset, session tracking |
| ModuleSwitcher | `src/mainview/components/ModuleSwitcher.tsx` | Module dropdown for navigation |
| CourseSwitcher | `src/mainview/components/CourseSwitcher.tsx` | Course dropdown for switching courses (LessonPage) |
| BackToCourseList | `src/mainview/components/BackToCourseList.tsx` | ← All Courses link |
| MermaidDiagram | `src/mainview/components/MermaidDiagram.tsx` | Mermaid diagram rendering in lessons |
| ErrorBoundary | `src/mainview/components/ErrorBoundary.tsx` | Error boundary wrapper |
| rehype-search-text | `src/mainview/components/rehype-search-text.ts` | rehype plugin for search match highlighting in lesson content |

### State Management (12 stores, src/mainview/stores/)

| Store | File | Responsibility |
|-------|------|----------------|
| useViewStore | `src/mainview/stores/viewStore.ts` | View stack: push/pop/replace/popToRoot |
| useCourseStore | `src/mainview/stores/courseStore.ts` | Course list load/reset |
| useSettingsStore | `src/mainview/stores/settingsStore.ts` | Font size (10-28px), theme (18), content width, focus mode, transitions, locale |
| usePomodoroStore | `src/mainview/stores/pomodoroStore.ts` | Focus/break timer state |
| useBookmarksStore | `src/mainview/stores/bookmarksStore.ts` | Bookmark CRUD with course/module filtering |
| useCompletionStore | `src/mainview/stores/completionStore.ts` | Module completion status per course |
| useHighlightsStore | `src/mainview/stores/highlightsStore.ts` | Highlight CRUD per module |
| useLessonUIStore | `src/mainview/stores/lessonUIStore.ts` | Lesson UI state: active section, search, sidebar tab |
| useNotesStore | `src/mainview/stores/notesStore.ts` | Note CRUD per module |
| useSyncStore | `src/mainview/stores/syncStore.ts` | Remote content sync status |

### Hooks (23 hooks, src/mainview/hooks/)

| Hook | File | Responsibility |
|------|------|----------------|
| useBookmarks | `src/mainview/hooks/useBookmarks.ts` | Bookmark CRUD via RPC, wraps bookmarksStore |
| useHighlights | `src/mainview/hooks/useHighlights.ts` | Highlight CRUD via RPC, wraps highlightsStore |
| useLesson | `src/mainview/hooks/useLesson.ts` | Lesson loading, sections, module nav |
| useQuizEngine | `src/mainview/hooks/useQuizEngine.ts` | Quiz state machine (useReducer): questions, currentIndex, score |
| useReviewState | `src/mainview/hooks/useReviewState.ts` | SRS review state machine (useReducer) |
| useCardReviewState | `src/mainview/hooks/useCardReviewState.ts` | User flash card review state machine (useReducer) |
| useLessonNav | `src/mainview/hooks/useLessonNav.ts` | Module navigation with direction tracking |
| useLessonSearch | `src/mainview/hooks/useLessonSearch.ts` | Section-level search with rehype search highlighting |
| useNotes | `src/mainview/hooks/useNotes.ts` | Note CRUD via RPC, wraps notesStore |
| useSelection | `src/mainview/hooks/useSelection.ts` | Text selection detection, highlight/note creation |
| useShortcuts | `src/mainview/hooks/useShortcuts.ts` | Keyboard shortcut binding by scope |
| useDashboard | `src/mainview/hooks/useDashboard.ts` | Orchestrates courseStore + viewStore + completionStore |
| useLessonSection | `src/mainview/hooks/useLessonSection.ts` | Orchestrates lessonUIStore + notesStore + highlightsStore |
| useSettingsPage | `src/mainview/hooks/useSettingsPage.ts` | Orchestrates settingsStore + courseStore |

### Backend (12 modules, src/bun/)

| Module | File | Responsibility |
|--------|------|----------------|
| index.ts (RPC) | `src/bun/index.ts` | BrowserView.defineRPC handlers: all request types |
| rpc-schema.ts | `src/bun/rpc-schema.ts` | Full RPC type schema: AppRequests union, frontend-backend contract |
| course-loader.ts | `src/bun/course-loader.ts` | File I/O: load subjects, lessons, quizzes, SRS decks; YAML parse; findModuleDir |
| lesson-markdown.ts | `src/bun/lesson-markdown.ts` | processLessonMarkdown: frontmatter, heading detection, sections, Mermaid extraction |
| search.ts | `src/bun/search.ts` | Full-text search across lessons, notes, highlights |
| stats.ts | `src/bun/stats.ts` | Course/global statistics, session logging |
| sync.ts | `src/bun/sync.ts` | Git-based remote content sync |
| srs.ts | `src/bun/srs.ts` | SM-2 helpers: getDueCards, reviewCard, toggleStar, createSRSCard |
| storage.ts | `src/bun/storage.ts` | JSON persistence: ~/.coursereader/data.json |
| gemini.ts | `src/bun/gemini.ts` | Gemini 2.0 Flash API client |
| logger.ts | `src/bun/logger.ts` | Bun file logger with daily rotation |
| yaml.ts | `src/bun/yaml.ts` | Custom YAML parser |
| utils.ts | `src/bun/utils.ts` | Utility functions |

### Models (src/bun/types.ts)

| Interface | Description |
|-----------|-------------|
| Course | Course metadata + modules array |
| ModuleMeta | Module name, time, prerequisites, topics |
| QuizQuestion | MCQ question with options + answer |
| SRSCard | SM-2 card: easeFactor, interval, repetitions |
| SRSDeck | Card collection (Record<string, SRSCard>) |
| Section | Heading-based section (id, heading, level) |
| Highlight | Selected text highlight with color + position offsets |
| Note | User note attached to highlight/section |
| Bookmark | Bookmarked position in lesson (with optional sectionID + scrollPosition) |
| UserCard | Custom flash card (front, back, easeFactor, interval, etc.) |

### Themes (src/mainview/themes.ts)

18 themes via CSS custom properties (not CSS classes):

dark, oled, nord, sepia, gruvbox, light, solarized-dark, catppuccin, dracula, tokyo-night, rose-pine, everforest, notebook, one-dark, terminal, monokai, monochrome, night-owl

Each theme defines ~40 CSS variables via `themeToCSSVars()`, consumed by `.book-content` in `index.css`.

## Navigation Flow

```
courseList → moduleList        (select course, push)
moduleList → lesson            (select module, push)
moduleList → courseList        (← All Courses, replace)
lesson → moduleList            (← back, replace)
lesson → lesson                (switch module via ModuleSwitcher)
lesson → quiz                  (push)
lesson → review                (push)
lesson → userCardReview        (push)
lesson → settings              (push)
lesson → bookmarks             (push)
moduleList → dashboard         (push, with courseID)
courseList → dashboard         (push, no courseID)
quiz → previous view           (pop)
review → previous view         (pop)
userCardReview → previous view (pop)
settings → previous view       (pop)
bookmarks → lesson             (replace, on open)
bookmarks → previous view      (pop, on back)
dashboard → previous view      (pop)
```

## Page Transitions

LessonPage supports 4 transition styles between modules (stored in settingsStore):

- **none**: instant swap (no animation)
- **flip**: 3D card flip via `transform-style: preserve-3d` + `rotateY`
- **slide**: horizontal slide based on module direction
- **fade**: crossfade via opacity

`useLessonNav` hook tracks module direction (prev/next) for slide animation orientation.

## Data Flow

```
Student → Page Component → api.ts (RPC wrapper) → rpc.ts (Electrobun IPC) → Bun RPC handlers → Services → File System / Gemini API
                               ↑                                                                      ↓
                               └───────────────────── JSON response ──────────────────────────────────┘
```

- **View → Store**: Read/write Zustand state (view stack, settings, bookmarks, highlights, notes, completion, pomodoro, sync)
- **View → RPC**: api.ts calls rpc.ts with typed methods (typed via rpc-schema.ts AppRequests)
- **Backend → Services**: RPC handler calls course-loader, lesson-markdown, search, stats, sync, srs, storage, gemini, yaml
- **Services → File System**: read/write subjects/ directory tree, ~/.coursereader/data.json, ~/.coursereader/logs/
- **Response → View**: JSON returned, React re-renders
