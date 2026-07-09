import { useTranslation } from 'react-i18next';

import { useCurrentLesson } from '../../hooks/useCurrentLesson';
import { useViewStore } from '../../stores/viewStore';
import QuizPopover from './QuizPopover';

function QuizReviewButtons() {
  const { t } = useTranslation();
  const { course } = useCurrentLesson();
  const push = useViewStore((s) => s.push);

  return (
    <>
      <QuizPopover />
      <div className="h-3 w-px bg-gray-700/50" />
      <button
        className="px-2 py-1 text-[11px] text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
        onClick={() => {
          if (!course) return;
          push({ type: 'review', course });
        }}
        title={t('common.review')}
      >
        {t('common.review')}
      </button>
    </>
  );
}

export default QuizReviewButtons;
