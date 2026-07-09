import { useTranslation } from 'react-i18next';

import { useCompletionStore } from '../../stores/completionStore';
import { useLessonViewStore } from '../../stores/lessonViewStore';
import { Button } from '../ui/Button';

export default function LessonContentCompletionButton() {
  const { t } = useTranslation();
  const courseId = useLessonViewStore((s) => s.courseId);
  const moduleId = useLessonViewStore((s) => s.moduleId);
  const isCompleted = useCompletionStore((s) => s.getEffectiveCompleted(courseId, moduleId));
  const toggle = useCompletionStore((s) => s.toggle);

  return (
    <Button
      onClick={() => {
        void toggle(courseId, moduleId);
      }}
      data-testid="complete-btn"
      variant="outline"
      className={`font-sans ${
        isCompleted
          ? 'border-green-500/50 text-green-500 hover:border-green-500 hover:text-green-400'
          : ''
      }`}
    >
      {isCompleted ? t('lesson.completed') : t('lesson.markAsComplete')}
    </Button>
  );
}
