import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useCurrentLesson } from '../../hooks/useCurrentLesson';
import { useShortcuts } from '../../hooks/useShortcuts';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useCourseStore } from '../../stores/courseStore';
import { useLessonStore } from '../../stores/lessonStore';
import type { TransitionStyle } from '../../stores/settingsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useViewStore } from '../../stores/viewStore';
import BookmarkButton from './BookmarkButton';
import CardsButton from './CardsButton';
import FocusPomodoroControls from './FocusPomodoroControls';
import FontSizeControl from './FontSizeControl';
import ProgressBadge from './ProgressBadge';
import QuizReviewButtons from './QuizReviewButtons';
import SearchCourseButton from './SearchCourseButton';
import ThemeControl from './ThemeControl';
import ToolsButton from './ToolsButton';
import WidthTransitionControl from './WidthTransitionControl';

function ToolbarSection({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`anim-toolbar-section flex items-center gap-2 ${visible ? 'anim-toolbar-section-visible' : 'anim-toolbar-section-hidden'}`}
    >
      {children}
    </div>
  );
}

export default function LessonToolbar() {
  const { course, module } = useCurrentLesson();

  const courses = useCourseStore((s) => s.courses);
  const push = useViewStore((s) => s.push);

  const { focusMode, toggleFocusMode, incFontSize, decFontSize, cycleTheme, contentWidth, setContentWidth, transitionStyle, setTransitionStyle } =
    useSettingsStore(useShallow((s) => ({
      focusMode: s.focusMode,
      toggleFocusMode: s.toggleFocusMode,
      incFontSize: s.incFontSize,
      decFontSize: s.decFontSize,
      cycleTheme: s.cycleTheme,
      contentWidth: s.contentWidth,
      setContentWidth: s.setContentWidth,
      transitionStyle: s.transitionStyle,
      setTransitionStyle: s.setTransitionStyle,
    })));

  const { toggleTools, togglePomodoro } =
    useLessonStore(useShallow((s) => ({
      toggleTools: s.toggleTools,
      togglePomodoro: s.togglePomodoro,
    })));

  const cycleTransition = useCallback(() => {
    const order: TransitionStyle[] = ['none', 'flip', 'slide', 'fade'];
    const next = order[(order.indexOf(transitionStyle) + 1) % order.length];
    setTransitionStyle(next);
  }, [transitionStyle, setTransitionStyle]);

  useShortcuts('lessonToolbar', {
    decFontSize,
    incFontSize,
    cycleTheme,
    toggleWidth: () => {
      const order: Array<'narrow' | 'standard' | 'wide'> = ['narrow', 'standard', 'wide'];
      const next = order[(order.indexOf(contentWidth) + 1) % order.length];
      setContentWidth(next);
    },
    bookmark: () => {
      if (!course || !module) return;
      const k = `${course.id}:${module.id}`;
      const bm = useBookmarksStore.getState().byModule[k] ?? [];
      const existing = bm.find((b) => !b.sectionID);
      if (existing) {
        void useBookmarksStore.getState().remove(existing.id);
      } else {
        void useBookmarksStore.getState().toggle(course.id, module.id, module.name, null);
      }
    },
    focusMode: toggleFocusMode,
    pomodoro: togglePomodoro,
    tools: toggleTools,
    reviewCards: () => {
      if (!course) return;
      const found = courses.find((c) => c.id === course.id);
      if (found) push({ type: 'userCardReview', course: found });
    },
    quiz: () => {
      if (!course || !module) return;
      push({ type: 'quiz', course, module });
    },
    review: () => {
      if (!course) return;
      push({ type: 'review', course });
    },
    cycleTransition: () => cycleTransition(),
  });

  return (
    <div className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700 px-4 py-1.5 flex items-center gap-2 shrink-0">
      <ToolbarSection visible={!focusMode}>
        <FontSizeControl />
      </ToolbarSection>
      <ToolbarSection visible={!focusMode}>
        <ThemeControl />
      </ToolbarSection>
      <ToolbarSection visible={!focusMode}>
        <WidthTransitionControl />
        <div className="h-3 w-px bg-gray-600" />
        <BookmarkButton />
      </ToolbarSection>
      <FocusPomodoroControls />
      <ToolbarSection visible={!focusMode}>
        <div className="h-3 w-px bg-gray-600" />
        <ToolsButton />
      </ToolbarSection>
      <ToolbarSection visible={!focusMode}>
        <div className="h-3 w-px bg-gray-600" />
        <SearchCourseButton />
      </ToolbarSection>
      {course && (
        <ToolbarSection visible={!focusMode}>
          <div className="h-3 w-px bg-gray-600" />
          <CardsButton />
        </ToolbarSection>
      )}
      <ToolbarSection visible={!focusMode}>
        <div className="h-3 w-px bg-gray-600" />
        <QuizReviewButtons />
      </ToolbarSection>
      <ToolbarSection visible={!focusMode}>
        <div className="h-3 w-px bg-gray-600" />
        <ProgressBadge />
      </ToolbarSection>
    </div>
  );
}
