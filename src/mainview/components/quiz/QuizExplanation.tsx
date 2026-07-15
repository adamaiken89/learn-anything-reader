import { useTranslation } from 'react-i18next';

import { useQuizStore } from '../../stores/quizStore';

export default function QuizExplanation() {
  const { t } = useTranslation();
  const currentQuestion = useQuizStore((s) => s.currentQuestion);
  const hasAnswer = useQuizStore((s) => s.hasAnswer);

  return (
    <div className="min-h-[72px] rounded-[10px] overflow-hidden mb-5">
      {hasAnswer && currentQuestion ? (
        <div className="bg-gray-800/40 rounded-[10px] p-4 border border-gray-700/30 animate-fade-in-up">
          <p className="text-sm text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-[11px] text-gray-600 italic">
            {t('quiz.sidebar.revealHint', 'Answer to reveal explanation')}
          </p>
        </div>
      )}
    </div>
  );
}
