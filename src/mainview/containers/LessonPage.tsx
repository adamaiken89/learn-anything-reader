import { useTranslation } from 'react-i18next';
import LessonView from '../components/views/LessonView';
import ModuleSwitcher from '../components/ModuleSwitcher';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../layouts/PageHeader';
import { useSettingsStore } from '../stores/settingsStore';
import { useViewStore } from '../stores/viewStore';
import type { Course, ModuleMeta } from '../../bun/types';

interface LessonFeatureProps {
  course: Course;
  module: ModuleMeta;
  initialSectionID?: string;
  onBack: () => void;
  onSelectModule: (m: ModuleMeta) => void;
  onStartQuiz: () => void;
  onStartReview: () => void;
}

export default function LessonFeature({
  course,
  module,
  initialSectionID,
  onBack,
  onSelectModule,
  onStartQuiz,
  onStartReview,
}: LessonFeatureProps) {
  const { t } = useTranslation();
  const push = useViewStore((s) => s.push);
  const focusMode = useSettingsStore((s) => s.focusMode);
  const currentIdx = course.modules.findIndex((m) => m.id === module.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < course.modules.length - 1;

  return (
    <PageLayout>
      {!focusMode && (
        <PageHeader
          onBack={onBack}
          backLabel={course.displayName}
          center={
            <ModuleSwitcher
              modules={course.modules}
              currentModuleId={module.id}
              onSelect={onSelectModule}
            />
          }
          actions={
            <>
              <button
                onClick={onStartQuiz}
                className="px-2 py-1 text-xs bg-emerald-700 hover:bg-emerald-600 rounded"
              >
                {t('common.quiz')}
              </button>
              <button
                onClick={onStartReview}
                className="px-2 py-1 text-xs bg-amber-700 hover:bg-amber-600 rounded"
              >
                {t('common.review')}
              </button>
              <button
                onClick={() => push({ type: 'settings' })}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                title={t('common.settings')}
              >
                ⚙
              </button>
            </>
          }
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <LessonView
          courseId={course.id}
          module={module}
          initialSectionID={initialSectionID}
          hasPrevModule={hasPrev}
          hasNextModule={hasNext}
          onPrevModule={hasPrev ? () => onSelectModule(course.modules[currentIdx - 1]) : undefined}
          onNextModule={hasNext ? () => onSelectModule(course.modules[currentIdx + 1]) : undefined}
        />
      </div>
    </PageLayout>
  );
}
