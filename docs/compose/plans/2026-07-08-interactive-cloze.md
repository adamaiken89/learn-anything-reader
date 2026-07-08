# Interactive Cloze Implementation Plan

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/interactive-cloze.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full interactive cloze (fill-in-the-blank) support across lessons, user card review, and quizzes.

**Architecture:** Replace CSS-only `onClick` cloze with a React `ClozeBlank` component that manages typed input + reveal. Apply in three areas: lesson reading (`{term}`), user card review (`[...term]`), and quiz cloze questions (`type: 'cloze'`). Reuse one component across all three.

**Tech Stack:** React 19, TypeScript, Zustand, react-markdown, rehype (HAST), bun:test

## Global Constraints

- All user-facing text via `t('key')`. Locale files at `src/mainview/locales/*.json`. 5 locales: en-US, en-GB, en-CA, en-AU, zh-TW.
- TypeScript strict mode. `tsc --noEmit` must pass.
- Tests: `bun test` must pass (837+ tests). NO `mock.module` in test files. NO `mock.restore()`.
- Page/test files must call `setupRPC()` at module level.
- Store isolation: stores must never import other stores.
- `PageContent` must have `flex flex-col` classes (scroll invariant).
- Desktop-only app (Electrobun). No lazy loading, code splitting.

---

### Task 1: Types + parser — add `type` field to QuizQuestion

**Covers:** [S5]

**Files:**
- Modify: `src/bun/types.ts:21-29`
- Modify: `src/bun/courseLoader.ts:46-59`
- Test: `src/bun/courseLoader.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `QuizQuestion.type?: 'multiple-choice' | 'cloze'` — used by Task 5

- [ ] **Step 1: Update QuizQuestion type**

In `src/bun/types.ts`, add optional `type` field to `QuizQuestion`:

```ts
export interface QuizQuestion {
  id: string;
  type?: 'multiple-choice' | 'cloze';
  question: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  difficulty: number;
  tags: string[];
}
```

- [ ] **Step 2: Update parseQuiz to read type field**

In `src/bun/courseLoader.ts`, in the `parseQuiz` function, add `type` to the mapped object:

```ts
export function parseQuiz(yamlStr: string): QuizQuestion[] {
  const raw = yaml.parse(yamlStr) as Record<string, unknown>[];
  if (!Array.isArray(raw)) return [];

  return raw.map((q) => ({
    id: String(q.id || ''),
    type: (q.type === 'cloze' ? 'cloze' : undefined) as 'cloze' | undefined,
    question: String(q.question || ''),
    options: (q.options as Record<string, string>) || {},
    answer: String(q.answer || ''),
    explanation: String(q.explanation || ''),
    difficulty: Number(q.difficulty) || 1,
    tags: Array.isArray(q.tags) ? q.tags.map(String) : [],
  }));
}
```

- [ ] **Step 3: Add test for cloze type parsing**

In `src/bun/courseLoader.test.ts`, in the `parseQuiz` describe block, add:

```ts
test('parses cloze type from quiz YAML', () => {
  const yaml = `
- id: 1
  type: cloze
  question: "The ___ process removes duplicates."
  answer: "deduplication"
  explanation: "Deduplication removes duplicate records."
  difficulty: 2
  tags: [data]
`;
  const result = parseQuiz(yaml);
  expect(result[0].type).toBe('cloze');
  expect(result[0].options).toEqual({});
});

test('defaults to undefined type for standard questions', () => {
  const yaml = `
- id: 1
  question: "What is X?"
  options: { a: "A", b: "B" }
  answer: "a"
  explanation: "Because"
  difficulty: 1
  tags: []
`;
  const result = parseQuiz(yaml);
  expect(result[0].type).toBeUndefined();
});
```

- [ ] **Step 4: Run tests**

Run: `bun test src/bun/courseLoader.test.ts`
Expected: PASS (existing + 2 new tests)

- [ ] **Step 5: Commit**

```bash
git add src/bun/types.ts src/bun/courseLoader.ts src/bun/courseLoader.test.ts
git commit -m "feat(cloze): add type field to QuizQuestion for cloze support"
```

---

### Task 2: ClozeBlank React component

**Covers:** [S3, S4]

**Files:**
- Create: `src/mainview/components/lesson/ClozeBlank.tsx`
- Create: `src/mainview/components/lesson/ClozeBlank.component.test.tsx`

**Interfaces:**
- Consumes: nothing (standalone component)
- Produces: `<ClozeBlank answer="term" />` — used by Task 3 (lessons), Task 4 (user cards), Task 5 (quiz)

- [ ] **Step 1: Write the failing test**

In `src/mainview/components/lesson/ClozeBlank.component.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'bun:test';

import ClozeBlank from './ClozeBlank';

describe('ClozeBlank', () => {
  const user = userEvent.setup();

  test('renders text input and reveal button', () => {
    const { getByPlaceholderText, getByText } = render(<ClozeBlank answer="discount" />);
    expect(getByPlaceholderText('Type your answer...')).toBeInTheDocument();
    expect(getByText('Reveal')).toBeInTheDocument();
  });

  test('does not show reveal button when input is empty', () => {
    const { queryByText } = render(<ClozeBlank answer="discount" />);
    expect(queryByText('Reveal')).toBeNull();
  });

  test('shows reveal button after typing', async () => {
    const { getByPlaceholderText, getByText } = render(<ClozeBlank answer="discount" />);
    await user.type(getByPlaceholderText('Type your answer...'), 'disc');
    expect(getByText('Reveal')).toBeInTheDocument();
  });

  test('shows correct answer after reveal', async () => {
    const { getByPlaceholderText, getByText, queryByPlaceholderText } = render(
      <ClozeBlank answer="discount" />,
    );
    await user.type(getByPlaceholderText('Type your answer...'), 'discount');
    await user.click(getByText('Reveal'));
    expect(queryByPlaceholderText('Type your answer...')).toBeNull();
    expect(getByText('discount')).toBeInTheDocument();
    expect(getByText(/✓/)).toBeInTheDocument();
  });

  test('shows incorrect feedback when answer wrong', async () => {
    const { getByPlaceholderText, getByText } = render(<ClozeBlank answer="discount" />);
    await user.type(getByPlaceholderText('Type your answer...'), 'wrong');
    await user.click(getByText('Reveal'));
    expect(getByText(/✗/)).toBeInTheDocument();
    expect(getByText('discount')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/mainview/components/lesson/ClozeBlank.component.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write the component**

In `src/mainview/components/lesson/ClozeBlank.tsx`:

```tsx
import { useState } from 'react';

interface ClozeBlankProps {
  answer: string;
}

export default function ClozeBlank({ answer }: ClozeBlankProps) {
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    const isCorrect = input.trim().toLowerCase() === answer.toLowerCase();
    return (
      <span className="cloze-blank revealed">
        <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
          {isCorrect ? '✓' : '✗'}
        </span>{' '}
        <span>{answer}</span>
        {!isCorrect && input.trim() && (
          <span className="text-gray-500 text-xs ml-1">(you: {input.trim()})</span>
        )}
      </span>
    );
  }

  return (
    <span className="cloze-blank-input inline-flex items-center gap-1">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) setRevealed(true);
        }}
        placeholder="Type your answer..."
        className="bg-transparent border-b border-dashed border-gray-500 text-sm px-1 py-0.5 w-24 focus:outline-none focus:border-indigo-400 text-gray-200 placeholder-gray-600"
      />
      {input.trim() && (
        <button
          onClick={() => setRevealed(true)}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors px-1"
        >
          Reveal
        </button>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/mainview/components/lesson/ClozeBlank.component.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/mainview/components/lesson/ClozeBlank.tsx src/mainview/components/lesson/ClozeBlank.component.test.tsx
git commit -m "feat(cloze): add ClozeBlank interactive component"
```

---

### Task 3: Lesson reading — rehypeCloze + LessonContentViewer integration

**Covers:** [S3]

**Files:**
- Modify: `src/mainview/components/rehypeCloze.ts:29-54`
- Modify: `src/mainview/components/lesson/LessonContentViewer.tsx:100-107`
- Modify: `src/mainview/components/rehypeCloze.test.ts`
- Modify: `src/mainview/index.css:835-905`

**Interfaces:**
- Consumes: `ClozeBlank` from Task 2
- Produces: `{term}` in lessons renders as interactive `ClozeBlank` components

- [ ] **Step 1: Update rehypeCloze to emit data-answer without onClick**

In `src/mainview/components/rehypeCloze.ts`, update `transformClozeText` — replace the `onClick` property with just `dataAnswer`:

```ts
function transformClozeText(text: string): HastNode[] {
  const regex = /\{([^}]+)\}/g;
  let last = 0;
  const nodes: HastNode[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push({ type: 'text', value: text.slice(last, match.index) });
    }
    nodes.push({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'cloze-blank',
        dataAnswer: match[1],
      },
      children: [{ type: 'text', value: match[1] }],
    });
    last = regex.lastIndex;
  }
  if (last < text.length) {
    nodes.push({ type: 'text', value: text.slice(last) });
  }
  return nodes.length > 0 ? nodes : [{ type: 'text', value: text }];
}
```

- [ ] **Step 2: Update rehypeCloze tests**

In `src/mainview/components/rehypeCloze.test.ts`, update any tests that check for `onClick` or `[?]` text:

- Replace checks for `onClick: "this.classList.toggle('revealed')"` with just verifying `dataAnswer` exists
- Replace checks for text content `[?]` with checks for the actual answer text

- [ ] **Step 3: Add ClozeBlank to LessonContentViewer ReactMarkdown components**

In `src/mainview/components/lesson/LessonContentViewer.tsx`, import `ClozeBlank` and add it to the `components` prop:

```tsx
import ClozeBlank from './ClozeBlank';
```

Then in the `components` prop of `<ReactMarkdown>`:

```tsx
components={{
  ...components,
  span: ({ className, ...props }) => {
    if (className?.includes('cloze-blank')) {
      return <ClozeBlank answer={(props as any).dataAnswer || ''} />;
    }
    return <span className={className} {...props} />;
  },
}}
```

Note: `components` from `sections/lessonHelpers` already exists — spread it and override `span`.

- [ ] **Step 4: Update CSS for cloze-blank**

In `src/mainview/index.css`, update the `.cloze-blank` styles to support the new revealed state:

```css
/* Cloze blank: interactive input mode */
.cloze-blank {
  display: inline;
  min-width: 3em;
  margin: 0 1px;
  font-weight: 600;
  text-align: center;
}
.cloze-blank.revealed {
  background: transparent;
  cursor: default;
}

/* Cloze input wrapper */
.cloze-blank-input {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  min-width: 3em;
  margin: 0 1px;
  vertical-align: baseline;
}
```

Remove the old `.cloze-blank` styles that no longer apply (the dashed border, padding, cursor pointer — replaced by input styling).

- [ ] **Step 5: Run all tests**

Run: `bun test src/mainview/components/rehypeCloze.test.ts src/mainview/components/lesson/ClozeBlank.component.test.tsx`
Expected: PASS

- [ ] **Step 6: TypeScript check**

Run: `tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/mainview/components/rehypeCloze.ts src/mainview/components/lesson/LessonContentViewer.tsx src/mainview/index.css src/mainview/components/rehypeCloze.test.ts
git commit -m "feat(cloze): integrate ClozeBlank into lesson reading"
```

---

### Task 4: User card review — cloze detection in ReviewCardDisplay

**Covers:** [S4]

**Files:**
- Modify: `src/mainview/components/userCards/ReviewCardDisplay.tsx`
- Test: update existing tests or add new

**Interfaces:**
- Consumes: `ClozeBlank` from Task 2
- Produces: `[...term]` in user card fronts renders as interactive blanks

- [ ] **Step 1: Add cloze parsing utility**

At the top of `src/mainview/components/userCards/ReviewCardDisplay.tsx`, add a helper to parse `[...term]` patterns:

```tsx
import ClozeBlank from '../lesson/ClozeBlank';

function parseClozeText(text: string): Array<{ type: 'text'; value: string } | { type: 'blank'; answer: string }> {
  const regex = /\[\.\.\.([^\]]+)\]/g;
  const segments: Array<{ type: 'text'; value: string } | { type: 'blank'; answer: string }> = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: text.slice(last, match.index) });
    }
    segments.push({ type: 'blank', answer: match[1] });
    last = regex.lastIndex;
  }
  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) });
  }
  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}
```

- [ ] **Step 2: Render cloze segments in card front**

In `ReviewCardDisplay`, replace the plain `{card.front}` rendering in the `!showAnswer` block with:

```tsx
const segments = parseClozeText(card.front);
const hasCloze = segments.some((s) => s.type === 'blank');

// In the !showAnswer block:
<div>
  <h3 className="text-lg font-medium mb-6">
    {hasCloze ? (
      segments.map((seg, i) =>
        seg.type === 'blank' ? (
          <ClozeBlank key={i} answer={seg.answer} />
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )
    ) : (
      card.front
    )}
  </h3>
  <button onClick={onShowAnswer} data-testid="show-answer" className="...">
    {t('review.showAnswer')}
  </button>
</div>
```

Also update the `showAnswer` block to show cloze-front with blanks revealed:

```tsx
const segments = parseClozeText(card.front);
// ...in the showAnswer front display:
<p className="text-lg font-medium">
  {segments.map((seg, i) =>
    seg.type === 'blank' ? (
      <ClozeBlank key={i} answer={seg.answer} />
    ) : (
      <span key={i}>{seg.value}</span>
    )
  )}
</p>
```

- [ ] **Step 3: Run tests**

Run: `bun test` (full suite — ReviewCardDisplay tests are page-level snapshots)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/mainview/components/userCards/ReviewCardDisplay.tsx
git commit -m "feat(cloze): render interactive blanks in user card review"
```

---

### Task 5: Quiz cloze question type

**Covers:** [S5]

**Files:**
- Modify: `src/mainview/sections/QuizSection.tsx`
- Modify: `src/mainview/hooks/useQuizEngine.ts:96-98`

**Interfaces:**
- Consumes: `QuizQuestion.type` from Task 1
- Produces: cloze questions render text input instead of option buttons

- [ ] **Step 1: Add text answer normalization to useQuizEngine**

In `src/mainview/hooks/useQuizEngine.ts`, update the score calculation at line 98 to normalize text answers:

```ts
const score = state.questions.filter((q) => {
  const userAnswer = state.selectedAnswers[q.id];
  if (userAnswer === undefined) return false;
  if (q.type === 'cloze') {
    return userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
  }
  return userAnswer === q.answer;
}).length;
```

Also update the `percentage` calculation (line 136) — same logic applies since it uses `score`.

- [ ] **Step 2: Add cloze rendering to QuizSection**

In `src/mainview/sections/QuizSection.tsx`, add state for text input and update the question rendering:

At the top of the component, add:

```tsx
const [textInput, setTextInput] = useState('');
```

In the question rendering block (around line 97), add a conditional for cloze:

```tsx
{currentQuestion?.type === 'cloze' ? (
  <div className="mt-4">
    <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{currentQuestion.question}</p>
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && textInput.trim() && !hasAnswer) {
            selectAnswer(textInput.trim());
          }
        }}
        placeholder="Type your answer..."
        disabled={hasAnswer}
        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
      />
      {!hasAnswer && (
        <button
          onClick={() => textInput.trim() && selectAnswer(textInput.trim())}
          disabled={!textInput.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
        >
          Check
        </button>
      )}
    </div>
    {hasAnswer && (
      <div className="mt-3">
        {textInput.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase() ? (
          <p className="text-emerald-400 text-sm">✓ Correct!</p>
        ) : (
          <p className="text-red-400 text-sm">
            ✗ Your answer: {textInput} — Correct answer: {currentQuestion.answer}
          </p>
        )}
      </div>
    )}
  </div>
) : (
  /* existing multiple-choice options rendering */
  <div className="space-y-3">
    {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => {
      // ... existing code
    })}
  </div>
)}
```

- [ ] **Step 3: Reset textInput on question change**

Add a `useEffect` to reset text input when the current question changes:

```tsx
useEffect(() => {
  setTextInput('');
}, [currentIndex]);
```

- [ ] **Step 4: Run tests**

Run: `bun test src/mainview/sections/QuizSection.component.test.tsx`
Expected: PASS

- [ ] **Step 5: TypeScript check**

Run: `tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/mainview/sections/QuizSection.tsx src/mainview/hooks/useQuizEngine.ts
git commit -m "feat(cloze): add cloze question type to quiz system"
```

---

### Task 6: Reading mode toggle in LessonToolbar

**Covers:** [S3]

**Files:**
- Create: `src/mainview/components/lesson/ReadingModeToggle.tsx`
- Modify: `src/mainview/components/lesson/LessonToolbar.tsx`
- Modify: `src/mainview/locales/*.json` (5 files)
- Test: add component test or update snapshot

**Interfaces:**
- Consumes: `useSettingsStore.readingMode`, `useSettingsStore.setReadingMode`
- Produces: toolbar button that toggles reading mode

- [ ] **Step 1: Create ReadingModeToggle component**

In `src/mainview/components/lesson/ReadingModeToggle.tsx`:

```tsx
import { useTranslation } from 'react-i18next';

import { useSettingsStore } from '../../stores/settingsStore';

export default function ReadingModeToggle() {
  const { t } = useTranslation();
  const readingMode = useSettingsStore((s) => s.readingMode);
  const setReadingMode = useSettingsStore((s) => s.setReadingMode);

  return (
    <button
      onClick={() => setReadingMode(readingMode === 'active' ? 'normal' : 'active')}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        readingMode === 'active'
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-700 text-gray-400 hover:text-gray-200'
      }`}
      title={t('lesson.readingMode')}
    >
      {t('lesson.readingMode')}
    </button>
  );
}
```

- [ ] **Step 2: Add to LessonToolbar**

In `src/mainview/components/lesson/LessonToolbar.tsx`, import and add the toggle:

```tsx
import ReadingModeToggle from './ReadingModeToggle';
```

Add after the `WidthTransitionControl` group (around line 39):

```tsx
<div className="flex items-center gap-2">
  <ReadingModeToggle />
</div>
```

- [ ] **Step 3: Add i18n keys to all 5 locales**

Add `"readingMode": "Active Recall"` to `lesson` namespace in en-US, en-GB, en-CA, en-AU.
Add `"readingMode": "主動回憶"` to zh-TW.

- [ ] **Step 4: Run tests**

Run: `bun test`
Expected: PASS (snapshot tests may need update for new locale keys)

- [ ] **Step 5: Commit**

```bash
git add src/mainview/components/lesson/ReadingModeToggle.tsx src/mainview/components/lesson/LessonToolbar.tsx src/mainview/locales/*.json
git commit -m "feat(cloze): add reading mode toggle to lesson toolbar"
```

---

### Task 7: Final verification + cleanup

**Covers:** [S7, S8]

**Files:**
- None (verification only)

- [ ] **Step 1: Full test suite**

Run: `bun test`
Expected: PASS (all tests, 0 failures)

- [ ] **Step 2: TypeScript check**

Run: `tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Locale parity check**

Verify all 5 locale files have the same number of keys (310 + new keys).

- [ ] **Step 4: Commit any final fixes**

If any fixes were needed, commit them.
