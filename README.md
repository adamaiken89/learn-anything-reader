# CourseReader

Desktop study app for structured curricula with quizzes, spaced repetition, AI-powered Q&A, syntax-highlighted code, and persistent annotations.

Built with **Electrobun** + **React 18** + **TypeScript** + **Bun**.

## Features

- **Course browser** — landing page → course list → module list → lesson, with course/module switchers
- **Quizzes** — MCQ per module, instant scoring
- **Spaced repetition** — SM-2 algorithm via SRS deck (JSON), star cards, filter by due/starred/all
- **AI assistant** — ask Gemini 2.0 Flash about lesson content in sidebar
- **Annotations** — highlights, notes, and bookmarks per module via JSON persistence
- **Syntax highlighting** — code blocks rendered via highlight.js (custom dark theme)
- **Reader navigation** — prev/next module and section buttons, font size controls (10–28px)
- **Book-like reading** — 8 themes (Dark, OLED, Nord, Sepia, Gruvbox, Light, Solarized, Catppuccin), decorative headers, blockquotes, wide mode toggle

## Subjects

| Subject                   | Modules |
| ------------------------- | ------- |
| Advanced React 19         | 20      |
| External Library Patterns | 40      |
| Fixed Income              | 22      |
| GraphQL Deep Dive         | 20      |
| Modern CSS with React     | 17      |
| Zustand State Management  | 21      |

Subjects live in `subjects/<id>/` with syllabus, modules, and SRS deck.

## Architecture

```
React Frontend (Vite) ──HTTP→ Bun Backend (port 50001) ──I/O→ subjects/ + ~/.coursereader/
```

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand (stores)
- **Backend**: Bun HTTP server (Bun.serve) with embedded API router
- **Packaging**: Electrobun (desktop app shell, like Electron but lighter)
- **Dependencies**: `react-markdown`, `remark-gfm`, `rehype-highlight`, `js-yaml`, `class-variance-authority`
- **No Swift**, no SwiftData, no SwiftUI, no React Router

## Quick start

```sh
bun install            # install dependencies
bun run start          # build + launch desktop app
bun run dev            # dev mode (HMR via Vite)
bun run dev:hmr        # Vite HMR + Electrobun concurrently
bun run build          # production build
bun test               # run all tests (bun:test + happy-dom)
```

## Project layout

```bash
src/
├── mainview/              # React frontend (Vite, root=src/mainview)
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # View stack router + layout
│   ├── api.ts             # HTTP client → localhost:50001
│   ├── index.css          # Tailwind + book prose styles
│   ├── themes.ts          # Theme token definitions (8 themes)
│   ├── hooks/
│   │   ├── useBookmarks.ts    # Bookmark CRUD hook
│   │   └── useHighlights.ts   # Highlights CRUD hook
│   ├── stores/
│   │   ├── viewStore.ts       # Zustand view stack (View union type)
│   │   ├── settingsStore.ts   # Font size, theme, wideMode, sections
│   │   └── courseStore.ts     # Course list state + load
│   └── components/
│       ├── LandingView.tsx        # Welcome screen
│       ├── CourseListView.tsx     # Subject grid
│       ├── CourseSwitcher.tsx     # Course navigation dropdown
│       ├── ModuleListView.tsx     # Module list for a course
│       ├── ModuleSwitcher.tsx     # Module navigation dropdown
│       ├── LessonView.tsx         # Markdown reader w/ section nav
│       ├── QuizView.tsx           # MCQ quiz with scoring
│       ├── ReviewView.tsx         # SRS review
│       ├── SettingsView.tsx       # Gemini API key config
│       ├── StudyTools.tsx         # Sidebar: notes, highlights, bookmarks, AI
│       ├── ui.tsx                 # Shared CVA variants (button, toggle, tab)
│       ├── sidebar-types.ts       # Sidebar-related types
│       └── rehype-highlight-text.ts  # Custom rehype plugin
├── types/                 # Ambient module declarations
│   ├── js-yaml.d.ts       # Declaration for js-yaml
│   └── three.d.ts         # Declaration for three
└── bun/                   # Bun backend (HTTP server, port 50001)
    ├── index.ts           # Router (Bun.serve), window creation, API handlers
    ├── types.ts           # Shared types: Course, ModuleMeta, QuizQuestion, etc.
    ├── course-loader.ts   # File I/O: load courses, lessons, quizzes; YAML parse
    ├── quiz-engine.ts     # QuizEngine class (MCQ state machine)
    ├── srs.ts             # SM-2 filter helpers (getDue, getStarred, toggleStar)
    ├── storage.ts         # JSON file persistence (~/.coursereader/data.json)
    ├── gemini.ts          # Gemini 2.0 Flash API client
    └── __tests__/         # Test suite (bun:test + happy-dom + @testing-library/react)
subjects/                  # Course data
├── <id>/syllabus.yaml     # Course metadata
├── <id>/modules/<NN->/    # Modules with lesson.md + quiz.yaml
└── <id>/srs/deck.json     # SRS deck
```

## License

MIT
