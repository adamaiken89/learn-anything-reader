# CourseReader

macOS SwiftUI study app for structured curricula with quizzes, spaced repetition, AI-powered Q&A, syntax-highlighted code, and persistent annotations.

## Features

- **Course browser** — subjects split into modules, each with markdown lessons (h1–h6 headings)
- **Quizzes** — MCQ per module, instant scoring
- **Spaced repetition** — SM-2 algorithm via SRS deck (JSON), star cards, filter by due/starred/all
- **AI assistant** — select text in lesson → ask Gemini 2.0 Flash in sidebar
- **Annotations** — highlights, notes, and bookmarks per module via SwiftData persistence
- **Syntax highlighting** — code blocks rendered via HighlighterSwift (github-dark theme)
- **Reader navigation** — prev/next module and section buttons, font size controls
- **Localization** — all user-facing strings via `loc("key")` (Localizable.xcstrings)
- **Glassmorphism UI** — `NSVisualEffectView` + design token system

## Subjects

| Subject | Modules |
|---------|---------|
| Advanced React 19 | — |
| External Library Patterns | 40 |
| Fixed Income | 20 |
| GraphQL Deep Dive | 20 |
| Modern CSS with React | — |
| Zustand State Management | — |

Subjects live in `subjects/<id>/` with syllabus, modules, and SRS deck.

## Architecture

```
View → ViewModel (@Observable @MainActor singleton) → Service
```

- **MVVM** + Swift 6 strict concurrency
- **macOS 15+** only
- **Dependencies**: [HighlighterSwift](https://github.com/smittytone/HighlighterSwift) (syntax highlighting)
- **Persistence**: SwiftData (highlights, notes, bookmarks)

## Quick start

```sh
make build          # debug build
make run            # build + bundle .app + launch
make test           # run tests
make format         # format sources
make check          # format-check → build → test
```

## Project layout

```
Sources/CourseReader/
├── App/               # @main entry, Scene config
├── Helpers/           # DesignConstants, AppColors, ButtonStyles, VisualEffectBackground, Loc
├── Models/            # Subject, QuizQuestion, SRSCard/SRSDeck, ModuleSection, UserAnnotation
├── Services/          # CourseLoader, GeminiService, QuizEngine, StorageService, HighlighterService
├── ViewModels/        # CourseViewModel (singleton)
└── Views/             # ContentView, SubjectListView, ReaderView, LessonView, QuizView, ReviewView, AskAIView, SettingsView, BookmarksView
```

## License

MIT
