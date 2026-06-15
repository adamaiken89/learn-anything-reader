# CourseReader — macOS SwiftUI study app

## Build & run

```sh
make build          # swift build (debug)
make build-strict   # + -strict-concurrency=complete
make run            # build + bundle .app + open
make test           # swift test --verbose
make format         # xcrun swift-format format --in-place Sources/ Tests/
make check          # format-check → build-strict → test
make release        # swift build -c release
```

## Architecture

MVVM + Swift 6 strict concurrency. macOS 15+ only. No external dependencies.

```
Sources/CourseReader/
├── App/               # @main entry point, Scene config
├── Helpers/           # DesignConstants, AppColors, VisualEffectBackground, ButtonStyles, Loc
├── Models/            # Subject (yaml), QuizQuestion (yaml), SRSCard/SRSDeck (json)
├── Services/          # CourseLoader, GeminiService, QuizEngine
├── ViewModels/        # CourseViewModel (@Observable @MainActor singleton)
└── Views/             # ContentView, SubjectListView, ModuleListView, LessonView, QuizView, AskAIView, SettingsView
```

## Key conventions

- **View → ViewModel → Service**. ViewModel = `@Observable @MainActor` singleton. Views observe via `@Environment`.
- **Design constants**: use `DesignConstants.Spacing.*`, `DesignConstants.Padding.*`, `DesignConstants.Font.*` everywhere. Never hardcode numbers.
- **Colors**: always use `AppColors.*`, never `Color(.sRGB, red:green:blue:)` or `.foregroundColor(.someColor)`.
- **Buttons**: `.primaryButton()`, `.secondaryButton()`, `.inlineButton()` modifier extensions.
- **Backgrounds**: `.cardBackground()`, `.sectionBackground()`, `.rowBackground()`, `.badgeBackground()`.
- **Window**: `.windowVisualEffect()` for glassmorphism via `NSVisualEffectView`.
- **Localization**: `loc("key")` helper wrapping `String(localized:bundle:)`.
- **Navigation**: `NavigationStack` + `AppScreen` enum path driven by `CourseViewModel.navigationPath`.

## Course data model

Subjects live in `subjects/<dir>/`. Each subject has:
- `syllabus.yaml` — parsed by `Subject.parse(yaml:directory:)` (manual YAML parser, no dependencies)
- `modules/<NN-name>/lesson.md` — markdown rendered via `NSTextView` + custom parser in `LessonMarkdownView`
- `modules/<NN-name>/quiz.yaml` — parsed by `parseQuizYAML()` (manual YAML parser)
- `srs/deck.json` — SM-2 SRS deck (JSON via `Codable`)

Subject directory name becomes `Subject.id`. Module directory name derived from id + slug (`syllabus.yaml` `name` → kebab-case). Exact match required for loading.

## Data loading

`CourseLoader` finds `subjects/` by checking: bundle resources → cwd → `~/Desktop/courses/subjects`. All loading is synchronous file I/O.

## Quiz engine

`QuizEngine` is `@MainActor @ObservableObject` (not `@Observable`). Used via `CourseViewModel.quizEngine`. State: `questions`, `currentIndex`, `selectedAnswers`, `isCompleted`. Score computed from `selectedAnswers` match against `correctOption`.

## AI / Gemini

`GeminiService` hits `gemini-2.0-flash` via `generativelanguage.googleapis.com`. API key stored in `UserDefaults.standard` key `"geminiAPIKey"`. Checks `hasAPIKey` before requests. Text selection in `LessonView` feeds `AskAIView` sidebar.

## Testing

Test target `CourseReaderTests` exists but has no tests yet. Add tests in `Tests/CourseReaderTests/`. Run via `make test`.

## Project structure quirks

- `Package.swift` defines target with path `Sources/CourseReader` (not default `Sources/`).
- `support/Info.plist` holds bundle metadata. Version bumped via `make bump-version V=x.y.z`.
- No `.xcodeproj`. SPM-only. Xcode can open via `Package.swift`.
- No `Resources/` directory with real files yet (placeholder only).
- `scripts/make-app-bundle.sh` bundles binary + Info.plist + generates icon (may fail silently on some systems).

## Style

- 2-space indentation. No semicolons.
- No comments in production code (per team convention).
- Match existing naming: `Subject`, `ModuleMeta`, `QuizQuestion`, `AppColors`, `DesignConstants`.
- Prefer `if-let` with `guard` early returns over `if let` nesting.
