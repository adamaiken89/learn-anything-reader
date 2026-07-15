# CourseReader — desktop study app (Electrobun + React)

## Architecture

React 19 + TypeScript frontend, Bun backend, packaged as desktop app via Electrobun.

```
src/
├── mainview/             # React frontend (Vite, root=src/mainview)
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # View stack router
│   ├── rpc.ts            # Electrobun RPC client
│   ├── api.ts            # API helpers (wraps rpc.ts)
│   ├── index.css         # Tailwind + book prose styles
│   ├── colors.ts         # Color utilities
│   ├── themes.ts         # Theme definitions (18 themes)
│   ├── logger.ts         # Frontend logger
│   ├── toast.ts          # Toast notifications
│   ├── shortcuts.ts      # Keyboard shortcuts (single source of truth)
│   ├── i18n.ts           # Internationalization setup
│   ├── layouts/          # PageLayout, PageHeader, PageContent
│   ├── pages/            # 7 pages: Dashboard, Lesson, Quiz, Review, UserCardReview, Settings, Bookmarks
│   ├── sections/         # Complex content: Lesson, Quiz, Review, UserCardReview
│   ├── components/       # Leaf-level reusable UI. No routing awareness.
│   │   ├── lesson/       # LessonToolbar, NavigationPanel, SelectionToolbar, NoteEditor, CardEditor, ColorPickerRow, NotePopover, ViewerSearch
│   │   ├── study-tools/  # NotesHighlightsTab, BookmarksTab, CardsTab, AITab
│   │   ├── ui/           # Button, StatCard
│   │   └── ...           # CourseSwitcher, ErrorBoundary, MermaidDiagram, SearchOverlay, StudyTools, PomodoroTimer
│   ├── hooks/            # 22+ domain hooks (useLesson, useBookmarks, useHighlights, useQuizEngine, useReviewState, useCardReviewState, useLessonNav, useLessonSearch, useLessonSection, useLessonAnimations, useLessonKeyboardShortcuts, useNotes, useSelection, useShortcuts, useSettingsPage, useDashboard, useWheelNavigation, useSearchOverlay, useCurrentLesson, useAppInit, useAutoCopy, useCountUp, useClipboardFallback, etc.)
│   └── stores/           # Zustand (12): viewStore, lessonViewStore, courseStore, settingsStore, pomodoroStore, bookmarksStore, completionStore, highlightsStore, lessonUIStore, notesStore, syncStore, selectionStore
├── types/                # Ambient declarations (js-yaml, three, jest-dom)
└── bun/                  # Backend (Electrobun RPC handlers)
    ├── index.ts          # RPC router + all handlers
    ├── rpc-schema.ts     # RPC type definitions
    ├── types.ts          # Shared types
    ├── course-loader.ts  # File I/O: subjects, lessons, quizzes; YAML parse
    ├── lesson-markdown.ts # Lesson markdown processing
    ├── search.ts         # Search functionality
    ├── stats.ts          # Statistics computation
    ├── sync.ts           # Sync operations
    ├── srs.ts            # SM-2 filter helpers
    ├── storage.ts        # JSON persistence (~/.coursereader/data.json)
    ├── gemini.ts         # Gemini API client
    ├── logger.ts         # Backend logger
    ├── utils.ts          # Utility functions
    └── yaml.ts           # YAML parsing utilities
```

## Key conventions

- **Frontend → RPC → Backend handlers**. No direct file I/O from UI. Communication via `BrowserView.defineRPC()` — no HTTP server, no open ports.
- **Navigation**: React state-driven view stack. No React Router. Page transitions (flip/slide/fade/none) on LessonPage.
- **Pages**: use `PageLayout` + `PageHeader` + `PageContent`. No inline wrappers.
- **State management**: Zustand stores (cross-cutting), domain hooks (page-specific), useReducer (state machines), local useState (trivial UI only).
- **Store isolation**: Stores must never import other stores. Cross-store orchestration lives in custom hooks (`hooks/useLessonSection`, `hooks/useSettingsPage`). Hooks compose multiple stores internally; consumers call one hook instead of 2-4 stores inline. Individual store selectors remain atomic (each `useXxxStore((s) => s.field)` triggers re-render only on that field).
- **Subcomponents** receive data via props, never fetch directly.
- **Markdown**: react-markdown + remarkGfm + rehypeHighlight (highlight.js). Mermaid diagrams rendered via `MermaidDiagram` component.
- **Styling**: Tailwind + `.book-content` CSS (via CSS custom properties).
- **TypeScript strict mode**.
- **AGENTS.md live**: update AGENTS.md during every feature dev. New hooks, stores, pages, conventions, quirks, invariants get documented immediately. Treat AGENTS.md as living memory — next agent reads it first.
- **i18n first**: all text via `t('key')`. Locale files at `src/mainview/locales/*.json`. Adding UI text requires keys in all 5 locales + snapshot update.
- **Icons via lucide-react**: never emoji in locale strings. Import lucide components directly. Theme icons (`themes.ts` `THEME_ICONS` + locale `icons.*` emoji) are legacy — migrate to lucide when touched.
- **Keyboard shortcuts**: single source of truth at `src/mainview/shortcuts.ts`. All shortcut key/ID/scope defined there. Components import `shortcutKey(id)` for display use. Handlers kept in components (switch statements) — scope overlap intentional where same key does same action in different scopes. Adding new shortcut requires entry in `shortcuts.ts` + handler in component. Duplicate detection runs at module load.

## Course data model

Subjects in `.coursereader/subjects/<dir>/` (dev: `src/subjects/`). Dir name → `Subject.id`. Each subject:

- `syllabus.yaml`
- `modules/<NN-name>/lesson.md`
- `modules/<NN-name>/quiz.yaml`
- `srs/deck.json` (FSRS-5 SRS)

Module dir matching: `findModuleDir` scans `modules/<id>/` for `NN-` prefix.

Subjects path resolution (`src/bun/utils.ts` `findSubjectsDir`):
1. `src/bun/subjects/` (dev, adjacent to source)
2. `src/subjects/` (dev, one level up)
3. `~/.coursereader/subjects/` (production fallback)

## Data persistence

- Subjects/lessons/quizzes: file I/O from `.coursereader/subjects/` tree
- SRS decks: `.coursereader/subjects/<id>/srs/deck.json`
- Highlights, notes, bookmarks, user cards, completion: `~/.coursereader/data.json`
- Gemini API key: `~/.coursereader/prefs.json`
- Logs: `~/.coursereader/logs/<YYYY-MM-DD>.log`

## Scroll layout invariant

`PageContent` (`src/mainview/layouts/PageContent.tsx`) MUST have `flex flex-col` classes. Without them, `div.flex.flex-1.overflow-hidden` inside `LessonSection` gets unbounded height → inner `contentRef` (`overflow-y-auto`) never overflows → `scrollToSection` on `contentRef.scrollTop` silently does nothing.

The real scrollbar lives on `contentRef` only when `PageContent` is a flex container. If `contentRef` has `overflow-y-auto` but sections are always at scrollTop 0, check `PageContent` hasn't lost `flex flex-col`.

## Search

Two levels:
- **Global search** (`SearchOverlay`): ⌘K, debounced 300ms, searches all lessons/notes/highlights, course filter chips, grouped results, section-level scroll-to on navigate
- **Within-lesson search** (`ViewerSearch`): scoped to current lesson, match count, prev/next navigation, search highlighting via rehype plugin. `useLessonSearch` effect scans `mark[data-search-match]` in DOM — dep array MUST include `caseSensitive` (toggling case re-runs rehype but effect won't recalculate match count without it).

## Page Transitions

LessonPage supports 4 styles: none, flip, slide, fade. Stored in `settingsStore.transitionStyle`. CSS transforms only (no animation library). `useLessonNav` tracks direction for slide animation orientation.

## Quirks

- `vite.config.ts` root=`src/mainview`, output=`dist/`
- `index.css`: Tailwind directives + `.book-content` + highlight.js styles
- **Desktop-only app** (Electrobun). All I/O local. Skip lazy loading, code splitting, chunking, network optimizations. Import eagerly. Bundle once. `vite.config.ts` `rollupOptions.output.codeSplitting: false` intentional (no chunks needed).
- **Selection overlays**: `LessonSelectionOverlays` (selection toolbar, note/card editors) appear when text selected in content viewer. Driven by `selectionchange` listener in `useSelection` + `onMouseUp` on `LessonContentViewer`.
- **Mermaid zoom/pan overlay**: Full-view overlay uses CSS `transform: translate(panX, panY) scale(zoom)` with `overflow-hidden` container. Drag to pan (window-level mousemove/mouseup). Wheel zooms toward cursor. Zoom buttons adjust toward center anchor (`applyZoomWithCenterAnchor`). Auto-fit sets initial zoom to `Math.max(1, containerWidth/svgWidth)` — never below 100%. Limits: 0.5x – 5x. No animation (instant transform). Download PNG button unchanged.
- **E2E mock RPC**: `mockRPC.ts` uses `Proxy` + handler table. Unknown methods `reject` (not silent null). Add new RPC handler key when backend adds handler.
- **TS7 dual setup**: `typescript@6.0.2` (JS API for eslint/typescript-eslint) + `@typescript/native@npm:typescript@^7.0.2` (Go `tsc` binary). Install TS6 first so `.bin/tsc` links to TS7. `tsconfig.json` needs `"types": ["*"]` (TS7 default is `[]`). Bun alias resolution differs from node — use direct installs, not `@typescript/old`.

## Button styling conventions

- **`Button` component** (`src/mainview/components/ui/Button.tsx`): base shadow via `shadow-sm`, hover: `shadow-md` + `-translate-y-0.5`, transition `transition-all duration-150`. `variant` controls bg/border/text colors (primary=indigo, outline=border, ghost=transparent).
- **Toolbar buttons** (lesson toolbar, search, zoom, etc.): `shadow-none` (override Button's `shadow-sm`), `hover:bg-gray-700/30` subtle background instead of lift.
- **StatsBar**: `StatCard` counts animate via `useCountUp` hook. Test assertions on stats must avoid relying on exact animated value — check for surrounding text like `/10` instead of `4/10`.

## Clipboard fallback

`useClipboardFallback` (mounted in `App.tsx`) listens for window-level `copy`/`cut` events. When `clipboard-write` permission unavailable (Electrobun), uses `document.execCommand('copy')` fallback. Also overrides Ctrl+A in lesson content viewer to select all text in `contentRef`.

## Animations & timing

- **`useCountUp`** (`src/mainview/hooks/useCountUp.ts`): animated number counter using `setTimeout` loop (16ms intervals). Cubic ease-out. Avoid `requestAnimationFrame` — setup.tsx mocks RAF as `cb(0); return 0` (fires synchronously, `performance.now()` static), which causes infinite recursion.
## Lesson → Quiz user flow
- Lesson bottom: "Mark as Complete" (left) + "Cloze Drill" (outline) + "Go to Quiz" (primary, right), centered in flex row. Navigates `push({ type: 'quiz', course, module })`. If module ID matches a cumulative quiz milestone (source_modules suffix), also shows "Cumulative Review" outline button.
- Quiz completion: "Next Chapter →" (if not last module) or "Back to Dashboard" (if last module). Navigates `push({ type: 'lesson', course, module: nextModule })`
- No auto-redirect. User clicks buttons.

## Quiz types (3)

| Type | Data file | Page | Section | View type |
|------|-----------|------|---------|-----------|
| Module MCQ | `modules/N/quiz.yaml` (yaml sequence) | QuizPage | QuizSection | `quiz` |
| Module cloze | `modules/N/cloze.yaml` (yaml sequence, `text` field with `{term}` markers) | ClozeQuizPage | ClozeQuizSection | `clozeQuiz` |
| Cumulative | `cumulative_quiz.yaml` (hybrid: `source_modules: [N]` mapping + sequence) | CumulativeQuizPage | CumulativeQuizSection | `cumulativeQuiz` |

### Quiz section architecture

- **QuizSection** (`sections/QuizSection.tsx`): Full quiz with MCQ grid + cloze input. Uses `useQuizEngine()` (default loader → `api.quiz.start()`).
- **ClozeQuizSection** (`sections/ClozeQuizSection.tsx`): Cloze-only (text input). Uses `useQuizEngine()` (default loader → `api.quiz.cloze()`).
- **CumulativeQuizSection** (`sections/CumulativeQuizSection.tsx`): Mixed MCQ + cloze + TF. Uses `useQuizEngine(courseId, quizId, loader)` with custom loader → `api.quiz.cumulative()`.
- **All three** share `QuizCompletionView` for post-quiz summary (confetti, SVG score ring, filter tabs, review cards).
- **TF questions**: parser auto-fills `options: { True: 'True', False: 'False' }` when type=`tf` and options empty. Rendered as 2-button MCQ grid.

### useQuizEngine custom loader

`useQuizEngine(courseId, moduleId, loader?)` accepts optional `(courseId, moduleId) => Promise<QuizQuestion[]>` as third arg. When omitted, defaults to `api.quiz.start`. Stored in `useRef` to avoid re-fetch on identity change. Example:

```typescript
const loader = useCallback(
  (id, qId) => api.quiz.cumulative(id, qId || undefined).then(r => r.questions),
  [],
);
const { status, questions, score, ... } = useQuizEngine(course.id, quizId, loader);
```

### Cumulative quiz format

`cumulative_quiz.yaml` is hybrid YAML: a mapping (for `source_modules`) followed by a sequence (for questions). Custom `parseCumulativeQuiz()` function (`courseLoader.ts`) splits at the first `- ` line and parses each section separately — no library can parse both as a single document.

### Milestones

- `courseLoader.getCumulativeQuizMilestones(courseId)` returns `number[]` (last element of `source_modules`).
- `CumulativeQuizSection` (`sections/CumulativeQuizSection.tsx`): Matching mixed MCQ/cloze/TF. TF questions rendered as 2-option MCQ. Same completion view with score ring and filtering.

## Content area button conventions
- Buttons inside `.book-content` (lesson viewer) must use `font-sans` to break from serif prose inheritance
- Secondary actions (e.g., Mark as Complete) use `variant="outline"` — clean border, no fill
- Primary CTAs (e.g., Go to Quiz) use `variant="primary"` (indigo fill) + lucide ArrowRight icon
- Never use text arrows (`→`) in locale strings — use lucide ArrowRight component
- Lesson bottom buttons are centered via `flex items-center justify-center gap-4`

## Highlight algorithm

Highlights use two-step offset-based approach:

1. **Offset capture at selection time**: `getTextOffset` in `lessonHelpers.tsx` uses `document.createTreeWalker(container, SHOW_TEXT)` to compute plain-text offset of selected range. TreeWalker avoids `range.toString()` which inserts implicit `\n` at block boundaries (paragraphs, headings, lists) — correcting the mismatch between DOM text (with newlines) and hast tree text (no newlines).

2. **Offset application via rehype plugin**: `rehypeHighlightText` (`rehypeHighlightText.ts`) walks hast tree with cumulative `pos` counter. For each text node, highlights overlapping `[startOffset, endOffset)` range are applied by splitting the text node and inserting `<mark>` elements. Single offset pair can span multiple text nodes across inline formatting (bold, italic, code) and block boundaries.

Key invariants:
- **Offset root**: measured from `[data-markdown-root]` wrapper around ReactMarkdown output (not from scroll container). Stored as `markdownRef` in `lessonViewStore`. This excludes h1 heading, meta fields, and DOM whitespace before markdown content.
- **Plugin order**: `rehypeHighlight` → `rehypeCloze` → `rehypeHighlightText`. Cloze runs before highlight matching so `{term}` patterns are removed from text nodes — offsets match clean rendered text.
- **Code blocks**: NOT skipped anymore. `applyHighlightsByOffset` descends into `<pre>`/`<code>` elements. Syntax-highlighted `<span>` wrapper is preserved, `<mark>` inserted inside syntax spans: `<span class="hljs-keyword"><mark style="background:yellow">const</mark></span>`. Syntax color + highlight background coexist.
- **Blockquotes**: skipped (`deeper = true`). Text inside `<blockquote>` not highlighted.
- **Mermaid code**: skipped. `isMermaidCode()` detects `code.language-mermaid`. Both `applyHighlightsByOffset` and `transformTree` skip descending into mermaid code blocks — `pos` counter doesn't advance past mermaid text. Critical because MermaidDiagram component renders SVG via `dangerouslySetInnerHTML`, so code text ABSENT from DOM. Without this skip, `getTextOffset` TreeWalker (DOM-based) returns shorter offsets than hast walker (which counts mermaid code text), causing all highlights AFTER mermaid diagram to shift by mermaid code text length, corrupting rendering.
- **Text-based fallback** (`transformTree`/`splitText`): only used for highlights with `endOffset === 0` (legacy data). Uses `indexOf` on individual hast text nodes — fails for cross-element selections. New highlights always have offsets.

`lessonViewStore.markdownRef` wired in `LessonContentViewer` via `useEffect`. `SelectionToolbar` and `NoteEditor` both use `markdownRef.current ?? contentRef.current` for offset computation.

## Test conventions

- **NO `mock.module` in test files**. All external lib mocks in `src/setup.tsx` (sonner, react-markdown, child_process, fs, mermaid, electrobun). Internal modules: use `spyOn` on `import * as NS` (refactor prod code if needed) or rely on real impl + store state control.
- **`mock.restore()` DESTROYS setup.tsx's global mocks**. Never call `mock.restore()` in individual test files — it undoes sonner/react-markdown/child_process/fs/mermaid/electrobun mocks process-wide.
- **Page/test files must call `setupRPC()`** at module level. Without it, RPC handler defaults to `Promise.resolve(null)` (works only if another test file happened to call it first — fragile ordering dependence).
- **Store state pollution across test files**: zustand stores persist in-memory. `resetAllStores()` in `src/setup.tsx` afterEach resets all 12 stores to initial state via `src/mainview/resetStores.ts`. Uses `createRequire` (sync) to avoid electrobun `window` module-eval issue that dynamic `import()` has. After reset, individual test files can still set store state in their own `beforeEach`. Previously manual `localStorage.clear()` + explicit store resets — now automated.
- **E2E tests excluded from bun**: `e2e/tests/` Playwright tests crash under `bun test` (Playwright `test.describe` not a bun API). Exclude via `package.json` `test` script or bun config.
- **UI tests via e2e**: Component/interaction tests impractical with bun + jsdom (Electrobun `BrowserView`, DOM measurement, scroll behavior, selection overlays all platform-specific). Use Playwright e2e tests for UI validation instead. Prefer at module level — page snapshots catch most regressions cheaply. Reach for e2e when testing: scroll-to-section, selection toolbar positioning, popover/overlay placement, keyboard shortcut dispatch, search highlight matching, page transitions.
