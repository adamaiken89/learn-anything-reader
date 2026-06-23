import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BookmarksView from './components/views/BookmarksView';
import CourseListView from './components/views/CourseListView';
import DashboardView from './components/views/DashboardView';
import LandingView from './components/views/LandingView';
import ModuleListView from './components/views/ModuleListView';
import SearchOverlay from './components/SearchOverlay';
import SettingsView from './components/views/SettingsView';
import LessonPage from './containers/LessonPage';
import QuizPage from './containers/QuizPage';
import ReviewPage from './containers/ReviewPage';
import UserCardReviewPage from './containers/UserCardReviewPage';
import { useCourseStore } from './stores/courseStore';
import { useViewStore } from './stores/viewStore';

import type { Course, ModuleMeta } from '../bun/types';

export default function App() {
  const { t } = useTranslation();
  const views = useViewStore((s) => s.views);
  const push = useViewStore((s) => s.push);
  const pop = useViewStore((s) => s.pop);
  const replace = useViewStore((s) => s.replace);
  const currentView = views[views.length - 1];
  const courses = useCourseStore((s) => s.courses);
  const loadCourses = useCourseStore((s) => s.load);

  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (currentView) {
      setLoading(false);
      return;
    }
    replace({ type: 'landing' });
    setLoading(false);
  }, [currentView, replace]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearchNavigate = useCallback(
    (courseID: string, moduleID: number) => {
      const course = courses.find((c) => c.id === courseID);
      const mod = course?.modules.find((m) => m.id === moduleID);
      if (course && mod) {
        push({ type: 'lesson', course, module: mod });
      }
    },
    [courses, push],
  );

  const handleSelectModule = (course: Course, module: ModuleMeta) => {
    push({ type: 'lesson', course, module });
  };

  const handleStartReview = (course: Course) => {
    push({ type: 'review', course });
  };

  const handleSwitchCourse = (course: Course) => {
    replace({ type: 'lesson', course, module: course.modules[0] });
  };

  const handleSelectCourse = (course: Course) => {
    push({ type: 'moduleList', course });
  };

  if (loading || !currentView) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-400 flex items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  const viewContent = (() => {
    switch (currentView.type) {
    case 'landing':
      return <LandingView />;

    case 'courseList':
      return (
        <CourseListView
          onSelectCourse={handleSelectCourse}
          onOpenSettings={() => push({ type: 'settings' })}
          onOpenBookmarks={() => push({ type: 'bookmarks' })}
          onOpenDashboard={() => push({ type: 'dashboard' })}
        />
      );

    case 'moduleList':
      return (
        <ModuleListView
          course={currentView.course}
          onSelectModule={(m) => handleSelectModule(currentView.course, m)}
          onBack={() => replace({ type: 'courseList' })}
          onOpenSettings={() => push({ type: 'settings' })}
          onOpenBookmarks={() => push({ type: 'bookmarks' })}
          onOpenDashboard={() => push({ type: 'dashboard' })}
        />
      );

    case 'lesson':
      return (
        <LessonPage
          course={currentView.course}
          module={currentView.module}
          initialSectionID={currentView.sectionID}
          onBack={() => replace({ type: 'moduleList', course: currentView.course })}
          onSelectModule={(m) => handleSelectModule(currentView.course, m)}
          onStartQuiz={() => push({ type: 'quiz', course: currentView.course, module: currentView.module })}
          onStartReview={() => handleStartReview(currentView.course)}
        />
      );

    case 'quiz':
      return (
        <QuizPage
          courseId={currentView.course.id}
          moduleId={currentView.module.id}
          onBack={pop}
          onSwitchCourse={handleSwitchCourse}
        />
      );

    case 'review':
      return (
        <ReviewPage
          courseId={currentView.course.id}
          onBack={pop}
          onSwitchCourse={handleSwitchCourse}
        />
      );

    case 'userCardReview':
      return (
        <UserCardReviewPage
          courseId={currentView.course.id}
          onBack={pop}
          onSwitchCourse={handleSwitchCourse}
        />
      );

    case 'settings':
      return <SettingsView onBack={pop} />;

    case 'bookmarks':
      return (
        <BookmarksView
          onBack={pop}
          onSwitchCourse={handleSwitchCourse}
          onOpen={(courseID, moduleID, sectionID, courses) => {
            const course = courses.find((c: Course) => c.id === courseID);
            const module = course?.modules.find((m) => m.id === moduleID);
            if (course && module) {
              replace({ type: 'lesson', course, module, sectionID: sectionID || undefined });
            }
          }}
        />
      );

    case 'dashboard':
      return (
        <DashboardView courseID={currentView.courseID} onBack={pop} />
      );
  }})();

  return (
    <>
      {viewContent}
      <button
        onClick={() => setSearchOpen(true)}
        className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg flex items-center justify-center text-white transition-colors"
        title="Search (⌘K)"
      >
        🔍
      </button>
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onNavigate={handleSearchNavigate}
        />
      )}
    </>
  );
}
