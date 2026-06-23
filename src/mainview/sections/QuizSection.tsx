import { useTranslation } from 'react-i18next';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { answerVariants } from '../components/ui';
import clsx from 'clsx';

interface Props {
  courseId: string;
  moduleId: number;
}

export default function QuizSection({ courseId, moduleId }: Props) {
  const { t } = useTranslation();
  const {
    status, questions, currentIndex, selectedAnswers,
    currentQuestion, hasAnswer, score, percentage,
    selectAnswer, nextQuestion, skipQuestion, retry,
  } = useQuizEngine(courseId, moduleId);

  if (status === 'loading')
    return <div className="p-8 text-center text-gray-400">{t('quiz.loadingQuiz')}</div>;
  if (questions.length === 0)
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">{t('quiz.noQuestions')}</p>
      </div>
    );

  if (status === 'completed') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{t('quiz.quizComplete')}!</h2>
          <div className="text-5xl font-bold text-indigo-400 mb-2">{percentage}%</div>
          <p className="text-gray-400 mb-6">
            {t('quiz.correct', { score, total: questions.length })}
          </p>
          <div className="space-y-3">
            {questions.map((q) => {
              const correct = selectedAnswers[q.id] === q.answer;
              return (
                <div
                  key={q.id}
                  className={clsx(
                    'text-left p-3 rounded-lg text-sm',
                    correct
                      ? 'bg-emerald-900/30 border border-emerald-700'
                      : 'bg-red-900/30 border border-red-700',
                  )}
                >
                  <p className="font-medium mb-1">{q.question}</p>
                  <p className="text-gray-400 text-xs">
                    {t('quiz.yourAnswer')} {selectedAnswers[q.id]}. {t('quiz.correctAnswer')}{' '}
                    {q.answer}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{q.explanation}</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={retry}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg"
            >
              {t('quiz.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-end mb-4">
        <span className="text-sm text-gray-400">
          {t('quiz.questionOf', { current: currentIndex + 1, total: questions.length })}
        </span>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded">Q{currentQuestion?.id}</span>
          <span className="text-xs text-gray-400">
            {t('quiz.difficulty', { level: currentQuestion?.difficulty })}
          </span>
        </div>
        <h2 className="text-lg font-medium mb-6">{currentQuestion?.question}</h2>

        <div className="space-y-3">
          {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => {
            const isSelected = selectedAnswers[currentQuestion.id] === key;
            const showCorrect = hasAnswer && key === currentQuestion.answer;
            const showWrong = hasAnswer && isSelected && key !== currentQuestion.answer;
            return (
              <button
                key={key}
                onClick={() => !hasAnswer && selectAnswer(key)}
                disabled={hasAnswer}
                className={clsx(
                  answerVariants({
                    state: showCorrect
                      ? 'correct'
                      : showWrong
                        ? 'wrong'
                        : isSelected
                          ? 'selected'
                          : 'neutral',
                  }),
                  !hasAnswer ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <span className="font-mono text-indigo-400 mr-2">{key}.</span>
                {String(value)}
              </button>
            );
          })}
        </div>

        {hasAnswer && currentQuestion && (
          <div className="mt-4 p-3 bg-gray-750 rounded-lg">
            <p className="text-sm text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={skipQuestion}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          {t('quiz.skip')}
        </button>
        <button
          onClick={nextQuestion}
          disabled={!hasAnswer}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
        >
          {currentIndex < questions.length - 1 ? t('quiz.nextQuestion') : t('quiz.finishQuiz')}
        </button>
      </div>
    </div>
  );
}
