# Plan: Lesson-end Quiz Button + Quiz-end Next Chapter Button

## Changes

### 1. `src/mainview/components/lesson/LessonContentViewer.tsx`

**Imports add:**
- `useTranslation` from `react-i18next`
- `useCurrentLesson` from `../../hooks/useCurrentLesson`
- `useViewStore` from `../../stores/viewStore`

**Body add:**
```tsx
const { t } = useTranslation();
const { course, module } = useCurrentLesson();
const push = useViewStore((s) => s.push);
```

**JSX — after `<LessonContentCompletionButton />` (line 121):**
```tsx
<LessonContentCompletionButton />

{course && module && (
  <button
    onClick={() => push({ type: 'quiz', course, module })}
    className="w-full mt-3 py-3 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200"
  >
    {t('lesson.goToQuiz')}
  </button>
)}
```

### 2. `src/mainview/App.tsx`

Change quiz case from passing IDs to passing full objects:
```tsx
// BEFORE:
<QuizPage
  courseId={currentView.course.id}
  moduleId={currentView.module.id}
  onBack={pop}
/>

// AFTER:
<QuizPage
  course={currentView.course}
  module={currentView.module}
  onBack={pop}
/>
```

### 3. `src/mainview/pages/QuizPage.tsx`

**Props change:**
```tsx
// BEFORE
interface QuizPageProps {
  courseId: string;
  moduleId: string;
  onBack: () => void;
}

// AFTER
import type { Course, ModuleMeta } from '../../bun/types';

interface QuizPageProps {
  course: Course;
  module: ModuleMeta;
  onBack: () => void;
}
```

**Render change — pass course/module to QuizSection:**
```tsx
<QuizSection course={course} module={module} />
```

### 4. `src/mainview/sections/QuizSection.tsx`

**Props add:**
```tsx
import type { Course, ModuleMeta } from '../../bun/types';
import { useViewStore } from '../stores/viewStore';

interface Props {
  courseId: string;
  moduleId: string;
  course: Course;
  module: ModuleMeta;
}
```

**Body add:**
```tsx
const push = useViewStore((s) => s.push);
const currentIdx = course.modules.findIndex((m) => m.id === module.id);
const hasNext = currentIdx < course.modules.length - 1;
const nextModule = hasNext ? course.modules[currentIdx + 1] : null;
```

**Completed section (lines 179-186) — add after Retry button:**
```tsx
<div className="flex gap-3 mt-6 justify-center">
  <button
    onClick={retry}
    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-[10px] text-sm font-medium transition-colors"
  >
    {t('quiz.retry')}
  </button>

  {nextModule ? (
    <button
      onClick={() => push({ type: 'lesson', course, module: nextModule })}
      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-[10px] text-sm font-medium transition-colors"
    >
      {t('quiz.nextChapter')}
    </button>
  ) : (
    <button
      onClick={() => push({ type: 'dashboard' })}
      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-[10px] text-sm font-medium transition-colors"
    >
      {t('quiz.backToDashboard')}
    </button>
  )}
</div>
```

### 5. i18n — Add to all 5 locale files (`en-US.json`, `en-GB.json`, `en-CA.json`, `en-AU.json`, `zh-TW.json`)

| Key | en-US/en-GB/en-CA/en-AU | zh-TW |
|-----|------------------------|-------|
| `lesson.goToQuiz` | "Go to Quiz →" | "前往測驗 →" |
| `quiz.nextChapter` | "Next Chapter →" | "下一章 →" |
| `quiz.backToDashboard` | "Back to Dashboard" | "返回儀表板" |

### 6. Snapshots — auto-update on test run

| File | Reason |
|------|--------|
| `LessonContentViewer.component.test.tsx` snapshot | New button in DOM |
| `QuizSection.component.test.tsx` snapshot | New buttons in completion view |

Run `bun test --update` to update snapshots.
