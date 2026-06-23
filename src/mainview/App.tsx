import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LandingView from './components/LandingView';
import CourseListView from './components/CourseListView';
import QuizView from './components/QuizView';
import ReviewView from './components/ReviewView';
import SettingsView from './components/SettingsView';
import ModuleListView from './components/ModuleListView';
import BookmarksView from './components/BookmarksView';
import CourseSwitcher from './components/CourseSwitcher';
import LessonFeature from './features/lesson/LessonFeature';
import { useViewStore } from './stores/viewStore';
import type { Course, ModuleMeta } from '../bun/types';

export default function App() {
  const { t } = useTranslation();
  const views = useViewStore((s) => s.views);
  const push = useViewStore((s) => s.push);
  const pop = useViewStore((s) => s.pop);
  const replace = useViewStore((s) => s.replace);
  const currentView = views[views.length - 1];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentView) {
      setLoading(false);
      return;
    }
    replace({ type: 'landing' });
    setLoading(false);
  }, [currentView, replace]);

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

  switch (currentView.type) {
    case 'landing':
      return <LandingView />;

    case 'courseList':
      return (
        <CourseListView
          onSelectCourse={handleSelectCourse}
          onOpenSettings={() => push({ type: 'settings' })}
          onOpenBookmarks={() => push({ type: 'bookmarks' })}
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
        />
      );

    case 'lesson':
      return (
        <LessonFeature
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
  }
}

function QuizPage({
  courseId,
  moduleId,
  onBack,
  onSwitchCourse,
}: {
  courseId: string;
  moduleId: number;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            {t('common.back')}
          </button>
          <div className="h-4 w-px bg-gray-600" />
          <span className="text-sm font-medium">{t('common.quiz')}</span>
        </div>
        <div className="flex-1 flex justify-center">
          <CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />
        </div>
        <div className="w-16" />
      </header>
      <div className="p-6">
        <QuizView courseId={courseId} moduleId={moduleId} onBack={onBack} />
      </div>
    </div>
  );
}

function ReviewPage({
  courseId,
  onBack,
  onSwitchCourse,
}: {
  courseId: string;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            {t('common.back')}
          </button>
          <div className="h-4 w-px bg-gray-600" />
          <span className="text-sm font-medium">{t('common.review')}</span>
        </div>
        <div className="flex-1 flex justify-center">
          <CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />
        </div>
        <div className="w-16" />
      </header>
      <div className="p-6">
        <ReviewView courseId={courseId} onBack={onBack} />
      </div>
    </div>
  );
}
