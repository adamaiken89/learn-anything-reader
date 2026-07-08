---
feature: interactive-cloze
status: delivered
specs:
  - docs/compose/specs/2026-07-08-interactive-cloze-design.md
plans:
  - docs/compose/plans/2026-07-08-interactive-cloze.md
branch: main
commits: 877e0a6..34832f0
---

# Interactive Cloze — Final Report

## What Was Built

Full interactive cloze (fill-in-the-blank) support across three areas of CourseReader:

1. **Lesson reading** — `{term}` syntax in lesson markdown renders as typeable text inputs with a "Reveal" button. Users type their guess, click reveal, and see correct/incorrect feedback. Gated behind an "Active Recall" toggle in the lesson toolbar (default on).

2. **User card review** — `[...term]` syntax in user-created flashcard fronts renders as interactive blanks during review. The `CardEditor` already created cloze cards with this format; now `ReviewCardDisplay` actually renders them as interactive inputs instead of plain text.

3. **Quiz cloze questions** — New `type: 'cloze'` question type in quiz YAML. Renders a text input + "Check" button instead of multiple-choice options. Case-insensitive, trimmed comparison. Completion screen handles cloze scoring correctly.

All three areas share a single `ClozeBlank` React component that manages typed input + reveal state.

## Architecture

### Component: `ClozeBlank` (`src/mainview/components/lesson/ClozeBlank.tsx`)

- Props: `{ answer: string }`
- Local state: `input` (text), `revealed` (boolean)
- Two states: input mode (text field + Reveal button) → revealed mode (✓/✗ + correct answer)
- Reused in lesson reading, user card review, and quiz cloze

### Lesson reading pipeline

```
Markdown: {discount}
  → rehypeCloze: <span class="cloze-blank" data-answer="discount">
  → ReactMarkdown components.span override
  → <ClozeBlank answer="discount" />
```

- `rehypeCloze.ts` emits `dataAnswer` attribute (no more `onClick` hack)
- `LessonContentViewer.tsx` maps `span.cloze-blank` to `ClozeBlank` via ReactMarkdown `components` prop
- Active when `readingMode === 'active'` (toggled via `ReadingModeToggle` in toolbar)

### User card review

- `ReviewCardDisplay.tsx` parses `[...term]` patterns in `card.front`
- Renders text segments as-is, `[...term]` segments as `ClozeBlank`
- Works in both pre-reveal and post-reveal states

### Quiz cloze

- `QuizQuestion.type?: 'multiple-choice' | 'cloze'` (optional, defaults to multiple-choice)
- `parseQuiz()` reads `type` field from YAML
- `QuizSection` renders text input for `type: 'cloze'` questions
- `useQuizEngine` normalizes text answers (trim + lowercase) for scoring

### Files created

| File | Role |
|------|------|
| `src/mainview/components/lesson/ClozeBlank.tsx` | Interactive blank component |
| `src/mainview/components/lesson/ReadingModeToggle.tsx` | Toolbar toggle for active recall |

### Files modified

| File | Change |
|------|--------|
| `src/bun/types.ts` | Added `type?` field to `QuizQuestion` |
| `src/bun/courseLoader.ts` | Parse `type` field in `parseQuiz()` |
| `src/mainview/components/rehypeCloze.ts` | Emit `dataAnswer` without `onClick` |
| `src/mainview/components/lesson/LessonContentViewer.tsx` | Map `span.cloze-blank` to `ClozeBlank` |
| `src/mainview/components/lesson/LessonToolbar.tsx` | Added `ReadingModeToggle` |
| `src/mainview/components/userCards/ReviewCardDisplay.tsx` | Parse `[...]` and render `ClozeBlank` |
| `src/mainview/sections/QuizSection.tsx` | Render cloze input for `type: 'cloze'` |
| `src/mainview/hooks/useQuizEngine.ts` | Case-insensitive text answer scoring |
| `src/mainview/index.css` | Updated cloze-blank styles |
| `src/mainview/locales/*.json` | Added `lesson.readingMode` key (5 files) |

## Design Decisions

- **React component over CSS hack**: Replaced `this.classList.toggle('revealed')` inline onClick with a proper React component. The old approach bypassed React's rendering cycle and was fragile with re-renders.
- **Type + reveal on click**: Chosen over instant validation to avoid frustration with long/formula answers. User types freely, then clicks Reveal to check.
- **Default on, togglable**: Active recall defaults to on (new users get the feature immediately), but can be toggled off via toolbar button.
- **Shared ClozeBlank component**: One component reused across all three areas (lessons, cards, quizzes) ensures consistent UX and minimal code.
- **`[...term]` detection in ReviewCardDisplay**: Simple regex parsing — no AST needed since card fronts are plain text, not markdown.

## Verification

- **844 tests pass**, 0 failures
- **TypeScript**: no errors (`tsc --noEmit`)
- **Locale parity**: all 5 locales have 311 leaf keys (310 + `lesson.readingMode`)
- **New tests**: 5 ClozeBlank component tests, 2 parseQuiz cloze type tests

## Journey Log

- [dead end] Initial rehypeCloze used `onClick: "this.classList.toggle('revealed')"` — bypassed React, broke with re-renders. Replaced with data-attribute + React component overlay.
- [lesson] CardEditor already had a "Cloze Card" toggle that wraps text in `[...term]`, but ReviewCardDisplay rendered it as plain text. The gap was in review, not creation.
- [lesson] `readingMode` setting existed in the store but had no UI toggle anywhere — dead code path. Added `ReadingModeToggle` to make it accessible.
