# Spec: Interactive Cloze (Fill-in-the-Blank) Support

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/interactive-cloze.md)

## [S1] Problem

CourseReader has partial cloze support that's mostly broken:
- `rehypeCloze.ts` renders `{term}` as click-to-reveal `[?]` via inline `onClick` — no typing, fragile with React re-renders
- `CardEditor` creates `[...term]` cloze cards, but `ReviewCardDisplay` renders them as plain text
- No UI toggle for `readingMode: 'active'` — users can never enable cloze
- Quiz system is multiple-choice only — no cloze question type
- The `onClick` approach bypasses React and breaks with strict mode / re-renders

## [S2] Solution overview

Replace the CSS-only cloze with a proper React component (`ClozeBlank`) that manages its own input state. Apply this component in three areas:

1. **Lesson reading** — `{term}` blanks become typeable inputs with reveal
2. **User card review** — `[...term]` in card fronts become interactive blanks
3. **Quiz cloze** — new question type with text input instead of multiple choice

## [S3] Area 1: Lesson reading blanks

### Mechanism

The rehype plugin (`rehypeCloze.ts`) transforms `{term}` into HAST nodes. Instead of emitting `<span onClick="...">`, emit:

```html
<span class="cloze-blank" data-answer="term">[?]</span>
```

ReactMarkdown's `components` prop maps `span.cloze-blank` to a React `ClozeBlank` component.

### ClozeBlank component (`src/mainview/components/lesson/ClozeBlank.tsx`)

```
Props: { answer: string }
State: { inputValue: string, revealed: boolean }

States:
- Initial: text input (small, inline) + "Reveal" button
- After reveal: shows user's answer (✓ green / ✗ red) + correct answer
```

- Text input styled to match `.cloze-blank` dimensions (min-width 3em, dashed border)
- "Reveal" button: small, muted, appears after user types something
- On reveal: input replaced by comparison display
- Local useState only — no store needed

### Settings toggle

Add a reading mode toggle to `LessonToolbar.tsx`:
- New `ReadingModeToggle` button (or add to existing `ToolsButton` dropdown)
- Toggles `settingsStore.readingMode` between `'normal'` and `'active'`
- When `'normal'`: rehypeCloze is inactive, `{term}` renders as plain text
- When `'active'`: rehypeCloze is active, `{term}` renders as `ClozeBlank`

### CSS changes (`src/mainview/index.css`)

Update `.cloze-blank` styles:
- Remove `cursor: pointer` (no longer click-to-reveal)
- Add input styling when in initial state
- Keep `.cloze-blank.revealed` for the revealed state display
- Add `.cloze-blank.correct` / `.cloze-blank.incorrect` for feedback

### Files

| File | Change |
|------|--------|
| `src/mainview/components/rehypeCloze.ts` | Remove `onClick` from cloze spans, simplify to `data-answer` attribute only |
| `src/mainview/components/lesson/ClozeBlank.tsx` | **New** — interactive blank component |
| `src/mainview/components/lesson/LessonContentViewer.tsx` | Add `ClozeBlank` to ReactMarkdown `components` map for `span` elements with `cloze-blank` class |
| `src/mainview/components/lesson/LessonToolbar.tsx` | Add reading mode toggle button |
| `src/mainview/index.css` | Update cloze-blank styles for input mode |
| `src/mainview/locales/*.json` | Add i18n keys for "Reveal", reading mode toggle label (5 files) |

## [S4] Area 2: User card review cloze

### Mechanism

`ReviewCardDisplay` detects `[...term]` pattern in `card.front`. Parses front into segments:
- Text segments → rendered as-is
- `[...term]` segments → rendered as `ClozeBlank` with `answer={term}`

### Interaction flow

1. Card front renders with `ClozeBlank` components for each `[...]` occurrence
2. User types answers into blanks
3. User clicks "Show Answer" → blanks reveal, back of card shows
4. Forgot/Remembered buttons work as before

### Files

| File | Change |
|------|--------|
| `src/mainview/components/userCards/ReviewCardDisplay.tsx` | Parse `[...]` in `card.front`, render segments with `ClozeBlank` |
| Reuse `ClozeBlank` from Area 1 |

## [S5] Area 3: Quiz cloze question type

### YAML format

```yaml
- id: 5
  type: cloze
  question: "The process of ___ data involves removing duplicate records."
  options: {}
  answer: "deduplicating"
  explanation: "Deduplication removes duplicate records..."
  difficulty: 2
  tags: [data-cleaning]
```

The `___` (3+ underscores) marks the blank position in the question text.

### QuizQuestion type change

```ts
interface QuizQuestion {
  // existing fields...
  type?: 'multiple-choice' | 'cloze';  // defaults to 'multiple-choice'
}
```

### QuizSection rendering

For `type: 'cloze'`:
- Parse question text for `___` placeholder
- Render text + inline text input + "Check" button
- On check: compare input (case-insensitive, trimmed) to `answer`
- Show correct/incorrect feedback + explanation
- Next/Skip buttons work as before

### useQuizEngine changes

- `SELECT_ANSWER` action already stores string answers — works for text input too
- Score calculation compares `selectedAnswers[q.id] === q.answer` — works for text (after normalization)

### Files

| File | Change |
|------|--------|
| `src/bun/types.ts` | Add `type?: 'multiple-choice' \| 'cloze'` to `QuizQuestion` |
| `src/bun/courseLoader.ts` | Parse `type` field in `parseQuiz()` |
| `src/mainview/sections/QuizSection.tsx` | Render cloze input for `type: 'cloze'` questions |
| `src/mainview/hooks/useQuizEngine.ts` | Normalize text answers for comparison (trim, lowercase) |

## [S6] Blockquote cloze (predict/spot the mistake)

The existing `> **Cloze**: ...` blockquote wrapping already works as `<details>` collapsible. No changes needed — this is a different interaction pattern (recall before revealing) that complements the inline blanks.

## [S7] Testing strategy

- Unit test `ClozeBlank` component: initial state, typing, reveal, correct/incorrect
- Unit test `rehypeCloze`: verify `data-answer` attribute, no `onClick`
- Update `ReviewCardDisplay` tests: verify `[...]` parsing and ClozeBlank rendering
- Update `QuizSection` tests: verify cloze question rendering
- Update snapshot tests for locale files (new keys)
- TypeScript: `tsc --noEmit` must pass
- Full test suite: `bun test` must pass

## [S8] Verification

1. Enable reading mode in lesson toolbar
2. Lesson with `{term}` syntax shows text inputs, not `[?]`
3. Type answer, click Reveal — shows correct/incorrect
4. Create cloze user card via CardEditor, review it — blanks are interactive
5. Quiz with `type: cloze` question shows text input
6. All 837+ tests pass, no TypeScript errors
