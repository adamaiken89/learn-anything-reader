import clsx from 'clsx';
import { Check, CornerDownLeft, Lightbulb, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Course, ModuleMeta, StudySession } from '../../bun/types';
import { api } from '../api';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { useViewStore } from '../stores/viewStore';

const CONFETTI_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'];
const CIRCUMFERENCE = 2 * Math.PI * 54;

interface Props {
  courseId: string;
  moduleId: string;
  course: Course;
  module: ModuleMeta;
}

export default function QuizSection({ courseId, moduleId, course, module }: Props) {
  const { t } = useTranslation();
  const push = useViewStore((s) => s.push);
  const currentIdx = course.modules.findIndex((m) => m.id === module.id);
  const hasNext = currentIdx < course.modules.length - 1;
  const nextModule = hasNext ? course.modules[currentIdx + 1] : null;
  const {
    status,
    questions,
    currentIndex,
    selectedAnswers,
    currentQuestion,
    hasAnswer,
    score,
    percentage,
    selectAnswer,
    nextQuestion,
    skipQuestion,
    retry,
  } = useQuizEngine(courseId, moduleId);

  const [textInput, setTextInput] = useState('');
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [previousSession, setPreviousSession] = useState<StudySession | null>(null);

  useEffect(() => {
    api.stats.lastQuizSession(courseId, moduleId).then(setPreviousSession).catch(() => {});
  }, [courseId, moduleId]);

  useEffect(() => {
    setTextInput('');
    setHighlightedIdx(-1);
  }, [currentIndex]);

  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const questionResults = useMemo(() => {
    return questions.map((q) => {
      const ua = selectedAnswers[q.id];
      const correct =
        q.type === 'cloze'
          ? ua?.trim().toLowerCase() === q.answer.trim().toLowerCase()
          : ua === q.answer;
      return { question: q, isCorrect: correct, userAnswer: ua };
    });
  }, [questions, selectedAnswers]);
  const filteredResults = useMemo(() => {
    if (filter === 'correct') return questionResults.filter((r) => r.isCorrect);
    if (filter === 'wrong') return questionResults.filter((r) => !r.isCorrect);
    return questionResults;
  }, [questionResults, filter]);
  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const wrongCount = questions.length - correctCount;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (status !== 'ready' || !currentQuestion) return;

      if (currentQuestion.type !== 'cloze') {
        const optionKeys = Object.keys(currentQuestion.options);
        const GRID_COLS = 2;

        const isForward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
        const isBackward = e.key === 'ArrowUp' || e.key === 'ArrowLeft';

        if (isForward) {
          e.preventDefault();
          setHighlightedIdx((i) => {
            if (i < 0) return 0;
            if (e.key === 'ArrowRight') {
              const col = i % GRID_COLS;
              if (col + 1 >= GRID_COLS || i + 1 >= optionKeys.length) return i;
              return i + 1;
            }
            return i + GRID_COLS < optionKeys.length ? i + GRID_COLS : i;
          });
          return;
        }

        if (isBackward) {
          e.preventDefault();
          setHighlightedIdx((i) => {
            if (i < 0) return e.key === 'ArrowLeft' ? GRID_COLS - 1 : optionKeys.length - 1;
            if (e.key === 'ArrowLeft') {
              const col = i % GRID_COLS;
              if (col === 0) return i;
              return i - 1;
            }
            return i - GRID_COLS >= 0 ? i - GRID_COLS : i;
          });
          return;
        }

        if ((e.key === 'Enter' || e.key === ' ') && !hasAnswer && highlightedIdx >= 0) {
          e.preventDefault();
          selectAnswer(optionKeys[highlightedIdx]);
          return;
        }

        if (e.key.length === 1 && /^[A-D a-d]$/i.test(e.key)) {
          e.preventDefault();
          const key = e.key.toUpperCase();
          const idx = optionKeys.indexOf(key);
          if (idx >= 0) {
            setHighlightedIdx(idx);
            selectAnswer(key);
          }
          return;
        }
      }

      if ((e.key === 'Enter' || e.key === ' ') && hasAnswer) {
        e.preventDefault();
        nextQuestion();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        skipQuestion();
      }
    },
    [status, currentQuestion, hasAnswer, highlightedIdx, selectAnswer, nextQuestion, skipQuestion],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (status === 'loading')
    return <div className="p-8 text-center text-gray-400">{t('quiz.loadingQuiz')}</div>;
  if (questions.length === 0)
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">{t('quiz.noQuestions')}</p>
      </div>
    );

  const isPerfect = percentage === 100;

  if (status === 'completed') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        {isPerfect && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="anim-confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  width: `${6 + Math.random() * 6}px`,
                  height: `${6 + Math.random() * 6}px`,
                  backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  animationDuration: `${0.8 + Math.random() * 0.7}s`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}
          </div>
        )}
        <div className="quiz-container-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{t('quiz.quizComplete')}!</h2>
          <div className="flex justify-center mb-2">
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(99,102,241,0.15)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#6366f1"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE}
                className="score-ring"
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="60"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e0e7ff"
                fontSize="28"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                {percentage}%
              </text>
            </svg>
          </div>
          <p className="text-gray-400 mb-4">
            {t('quiz.correct', { score, total: questions.length })}
          </p>
          {previousSession?.score !== undefined && previousSession.total && (
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                previousSession.score / previousSession.total >= 0.8
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-rose-400 bg-rose-500/10'
              }`}>
                {previousSession.score / previousSession.total >= 0.8 ? `✓ ${t('quiz.previousPassed')}` : `✗ ${t('quiz.previousFailed')}`}
              </span>
            </div>
          )}
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 justify-center">
            {(['all', 'wrong', 'correct'] as const).map((f) => {
              const count =
                f === 'all' ? questions.length : f === 'wrong' ? wrongCount : correctCount;
              const label =
                f === 'all'
                  ? t('quiz.filterAll', { count, defaultValue: `All (${count})` })
                  : f === 'wrong'
                    ? t('quiz.filterWrong', { count, defaultValue: `Wrong (${count})` })
                    : t('quiz.filterCorrect', { count, defaultValue: `Correct (${count})` });
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    filter === f
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      : 'text-gray-500 hover:text-gray-300 border border-gray-700/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {/* Question cards */}
          <div className="space-y-3">
            {filteredResults.map(({ question: q, isCorrect, userAnswer }) => (
              <div
                key={q.id}
                className={`text-left p-4 rounded-[10px] text-sm border ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                    : 'border-rose-500/30 bg-rose-500/[0.04]'
                }`}
              >
                {/* Status badge row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {isCorrect ? <Check size={12} /> : <X size={12} />}
                    {isCorrect
                      ? t('quiz.correctLabel', 'Correct')
                      : t('quiz.incorrectLabel', 'Incorrect')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t('quiz.yourAnswer')} {userAnswer}. {t('quiz.correctAnswer')} {q.answer}
                  </span>
                </div>
                {/* Question */}
                <p className="font-medium text-sm text-gray-100 mb-3">{q.question}</p>
                {/* Explanation */}
                <div className="pt-3 border-t border-gray-700/50 text-sm text-gray-400 leading-relaxed">
                  <span className="font-medium text-gray-300 inline-flex items-center gap-1">
                    <Lightbulb size={14} /> {t('quiz.explanation', 'Explanation')}:
                  </span>{' '}
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6 justify-center flex-wrap">
            <button
              onClick={retry}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-[10px] text-sm font-medium transition-colors"
            >
              {t('quiz.retry')}
            </button>

            <button
              onClick={() => push({ type: 'lesson', course, module })}
              className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 rounded-[10px] text-sm font-medium transition-colors"
            >
              {t('quiz.backToLesson')}
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
        </div>
      </div>
    );
  }

  const isMCQ = currentQuestion?.type !== 'cloze';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col justify-center">
      {/* Container card */}
      <div className="quiz-container-card p-6">
        {/* Counter */}
        <div className="flex justify-end mb-3">
          <span className="text-xs text-gray-500 font-medium tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-1.5 mb-5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={clsx(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                i < currentIndex
                  ? 'bg-indigo-500'
                  : i === currentIndex
                    ? 'bg-indigo-400 progress-pill-active'
                    : 'bg-gray-700',
              )}
            />
          ))}
        </div>

        {/* Animated question content */}
        <div key={currentIndex} className="question-entrance">
          {/* Question — badge + difficulty + text on same left edge */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-medium bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-md">
                Q{currentQuestion?.id}
              </span>
              <span className="text-[11px] text-gray-500">
                {t('quiz.difficulty', { level: currentQuestion?.difficulty })}
              </span>
            </div>
            <h2 className="text-[24px] font-semibold text-white leading-snug tracking-tight">
              {currentQuestion?.question}
            </h2>
          </div>

          {/* Options — 2x2 grid for MCQ */}
          {isMCQ && currentQuestion && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {Object.entries(currentQuestion.options).map(([key, value], idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === key;
                const isHighlighted = idx === highlightedIdx && !hasAnswer;
                const showCorrect = hasAnswer && key === currentQuestion.answer;
                const showWrong = hasAnswer && isSelected && key !== currentQuestion.answer;

                return (
                  <button
                    key={key}
                    onClick={() => !hasAnswer && selectAnswer(key)}
                    disabled={hasAnswer}
                    className={clsx(
                      'group w-full text-left px-4 py-3.5 rounded-[10px] border-2 transition-all duration-200 flex items-center gap-4',
                      'text-[15px] font-medium',
                      showCorrect
                        ? 'bg-emerald-500/8 border-emerald-500/30 text-emerald-100'
                        : showWrong
                          ? 'bg-red-500/8 border-red-500/30 text-red-100 animate-[shake_0.3s_ease-in-out]'
                          : isSelected
                            ? 'bg-indigo-500/10 border-indigo-400/40 text-indigo-100'
                            : isHighlighted
                              ? 'bg-indigo-500/15 border-indigo-400/70 text-indigo-100 ring-2 ring-indigo-400/50 hover:bg-indigo-500/20'
                              : 'bg-gray-800/50 border-gray-600/40 text-gray-200 hover:border-gray-400 hover:bg-gray-700/40',
                      !hasAnswer ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    {/* Radio indicator */}
                    <span
                      className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-all',
                        showCorrect
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : showWrong
                            ? 'border-red-400 bg-red-500/20 text-red-300'
                            : isSelected
                              ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                              : isHighlighted
                                ? 'border-indigo-400'
                                : 'border-gray-500 group-hover:border-indigo-300 group-hover:bg-indigo-500/10',
                      )}
                    >
                      {showCorrect && <Check size={12} />}
                      {showWrong && <X size={12} />}
                    </span>
                    <span className="text-gray-400">{key}.</span>
                    <span>{String(value)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cloze input */}
          {currentQuestion?.type === 'cloze' && (
            <div className="mb-5">
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
                  className="flex-1 bg-gray-800/50 border-2 border-gray-600/40 rounded-[10px] px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 text-[15px] font-medium"
                />
                {!hasAnswer && (
                  <button
                    onClick={() => textInput.trim() && selectAnswer(textInput.trim())}
                    disabled={!textInput.trim()}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-[10px] text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Check
                  </button>
                )}
              </div>
              {hasAnswer && (
                <div className="mt-3">
                  {textInput.trim().toLowerCase() ===
                  currentQuestion.answer.trim().toLowerCase() ? (
                    <p className="text-emerald-400 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full border-2 border-emerald-400 bg-emerald-500/20 flex items-center justify-center">
                        <Check size={12} />
                      </span>
                      Correct!
                    </p>
                  ) : (
                    <p className="text-red-400 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full border-2 border-red-400 bg-red-500/20 flex items-center justify-center">
                        <X size={12} />
                      </span>
                      Your answer: {textInput} — Correct answer: {currentQuestion.answer}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Explanation — pre-allocated slot, no layout drift */}
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

        {/* Bottom bar — Z-pattern */}
        <div className="flex justify-between items-center">
          <button
            onClick={skipQuestion}
            className="px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {t('quiz.skip')} <span className="text-[10px] text-gray-600 ml-0.5">[Esc]</span>
          </button>
          <button
            onClick={nextQuestion}
            disabled={!hasAnswer}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentIndex < questions.length - 1 ? t('quiz.nextQuestion') : t('quiz.finishQuiz')}{' '}
            <span className="text-[10px] opacity-60 ml-1 inline-flex items-center">
              <CornerDownLeft size={10} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
