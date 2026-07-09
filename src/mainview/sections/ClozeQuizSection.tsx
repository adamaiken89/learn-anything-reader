import type { DragEndEvent } from '@dnd-kit/dom';
import { DragDropProvider, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/react';
import { Check, CornerDownLeft, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Course, ModuleMeta, QuizQuestion, StudySession } from '../../bun/types';
import { api } from '../api';
import { useViewStore } from '../stores/viewStore';

const CONFETTI_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'];
const CIRCUMFERENCE = 2 * Math.PI * 54;

interface Props {
  courseId: string;
  moduleId: string;
  course: Course;
  module: ModuleMeta;
}

// Parse question text: supports both {term} and {blank} patterns
// Returns segments + extracted answers
function parseClozeText(text: string): {
  segments: Array<{ type: 'text' | 'blank'; value: string }>;
  answers: string[];
} {
  const regex = /\{([^}]+)\}/g;
  const segments: Array<{ type: 'text' | 'blank'; value: string }> = [];
  const answers: string[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: text.slice(last, match.index) });
    }
    const term = match[1];
    if (term.toLowerCase() === 'blank') {
      // {blank} — answer comes from question.answer field
      segments.push({ type: 'blank', value: '' });
    } else {
      // {term} — the term IS the answer
      segments.push({ type: 'blank', value: term });
      answers.push(term);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) });
  }
  return { segments, answers };
}

// Draggable token component
function DragToken({ id, label, isUsed }: { id: string; label: string; isUsed: boolean }) {
  const { ref, isDragging } = useDraggable({ id });
  if (isUsed) return null;
  return (
    <span
      ref={ref}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border cursor-grab transition-all select-none ${
        isDragging
          ? 'opacity-40 border-indigo-500/50 bg-indigo-600/20 text-indigo-300'
          : 'border-gray-600/50 bg-gray-800/60 text-gray-300 hover:border-indigo-500/40 hover:text-indigo-200 hover:bg-gray-700/60'
      }`}
    >
      {label}
    </span>
  );
}

// Droppable blank component
function DropBlank({
  blankId,
  filledValue,
  isCorrect,
  isWrong,
}: {
  blankId: string;
  filledValue: string | undefined;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const { ref, isDropTarget } = useDroppable({ id: blankId });
  const isFilled = filledValue !== undefined;

  return (
    <span
      ref={ref}
      className={`inline-flex items-center min-w-[8em] mx-0.5 px-2 py-0.5 rounded border-b-2 transition-all font-medium ${
        isDropTarget && !isFilled
          ? 'border-emerald-400 bg-emerald-500/10'
          : isFilled && isCorrect
            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
            : isFilled && isWrong
              ? 'border-red-500 bg-red-500/10 text-red-300'
              : 'border-indigo-500/40 bg-indigo-500/5'
      }`}
    >
      {isFilled ? <span>{filledValue}</span> : <span>&nbsp;</span>}
    </span>
  );
}

export default function ClozeQuizSection({ courseId, moduleId, course, module }: Props) {
  const { t } = useTranslation();
  const push = useViewStore((s) => s.push);
  const currentIdx = course.modules.findIndex((m) => m.id === module.id);
  const hasNext = currentIdx < course.modules.length - 1;
  const nextModule = hasNext ? course.modules[currentIdx + 1] : null;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'completed'>('loading');
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [wrongBlankIdx, setWrongBlankIdx] = useState<number | null>(null);
  const [previousSession, setPreviousSession] = useState<StudySession | null>(null);

  useEffect(() => {
    api.stats.lastQuizSession(courseId, moduleId).then(setPreviousSession).catch(() => {});
  }, [courseId, moduleId]);

  useEffect(() => {
    api.quiz
      .cloze(courseId, moduleId)
      .then((qs) => {
        setQuestions(qs);
        setStatus('ready');
      })
      .catch(() => {
        setQuestions([]);
        setStatus('ready');
      });
  }, [courseId, moduleId]);

  // Reset on question change
  useEffect(() => {
    setFilledBlanks({});
    setWrongBlankIdx(null);
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];

  // Parse question into segments + extract inline answers
  const { segments, answers: inlineAnswers } = useMemo(
    () =>
      currentQuestion ? parseClozeText(currentQuestion.question) : { segments: [], answers: [] },
    [currentQuestion],
  );

  // Determine which answers to use for token pool
  // If {term} patterns exist → use inline answers; if {blank} → use answer field
  const questionAnswers = useMemo(() => {
    if (inlineAnswers.length > 0) return inlineAnswers;
    if (currentQuestion?.answer) return [currentQuestion.answer];
    return [];
  }, [inlineAnswers, currentQuestion]);

  // Build token pool: correct answers + distractors from other questions
  const tokenPool = useMemo(() => {
    if (!currentQuestion || questionAnswers.length === 0) return [];
    const distractors = questions.map((q) => q.answer).filter((a) => !questionAnswers.includes(a));
    const pool = [...questionAnswers, ...distractors.slice(0, 3)];
    return pool.sort(() => Math.random() - 0.5);
  }, [questions, currentQuestion, questionAnswers]);

  // Check if all blanks are filled
  const allBlanksFilled = questionAnswers.every((_, i) => filledBlanks[i] !== undefined);
  const hasAnswer = allBlanksFilled;

  const selectAnswer = useCallback(
    (answer: string) => {
      const q = questions[currentIndex];
      if (!q) return;
      setSelectedAnswers((prev) => ({ ...prev, [q.id]: answer }));
    },
    [questions, currentIndex],
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStatus('completed');
    }
  }, [currentIndex, questions.length]);

  const retry = useCallback(() => {
    setStatus('ready');
    setCurrentIndex(0);
    setSelectedAnswers({});
    setFilledBlanks({});
    setWrongBlankIdx(null);
  }, []);

  const score = questions.filter((q) => {
    const ua = selectedAnswers[q.id];
    if (ua === undefined) return false;
    return ua.trim().toLowerCase() === q.answer.trim().toLowerCase();
  }).length;

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const questionResults = useMemo(() => {
    return questions.map((q) => {
      const ua = selectedAnswers[q.id];
      return {
        question: q,
        isCorrect: ua?.trim().toLowerCase() === q.answer.trim().toLowerCase(),
        userAnswer: ua,
      };
    });
  }, [questions, selectedAnswers]);

  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const wrongCount = questions.length - correctCount;
  const filteredResults = useMemo(() => {
    if (filter === 'correct') return questionResults.filter((r) => r.isCorrect);
    if (filter === 'wrong') return questionResults.filter((r) => !r.isCorrect);
    return questionResults;
  }, [questionResults, filter]);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { source, target } = event.operation;
      if (!source || !target || !currentQuestion) return;

      const draggedToken = String(source.id);
      const targetId = String(target.id);

      // Parse blank index from target id: "blank-{index}"
      const blankIdxMatch = targetId.match(/^blank-(\d+)$/);
      if (!blankIdxMatch) return;
      const blankIdx = Number(blankIdxMatch[1]);

      const expectedAnswer = questionAnswers[blankIdx];
      if (expectedAnswer === undefined) return;

      if (draggedToken === expectedAnswer) {
        // Correct! Fill this blank
        const newFilled = { ...filledBlanks, [blankIdx]: draggedToken };
        setFilledBlanks(newFilled);

        // Build combined answer for scoring
        const fullAnswer = questionAnswers.map((a, i) => newFilled[i] || a).join(', ');
        selectAnswer(fullAnswer);
      } else {
        // Wrong — shake the blank
        setWrongBlankIdx(blankIdx);
        setTimeout(() => setWrongBlankIdx(null), 600);
      }
    },
    [currentQuestion, questionAnswers, filledBlanks, selectAnswer],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (status !== 'ready' || !currentQuestion) return;

      if ((e.key === 'Enter' || e.key === ' ') && hasAnswer) {
        e.preventDefault();
        nextQuestion();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setStatus('completed');
        }
      }
    },
    [status, currentQuestion, hasAnswer, nextQuestion, currentIndex, questions.length],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (status === 'loading') {
    return <div className="p-8 text-center text-gray-400">{t('quiz.loadingQuiz')}</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">{t('quiz.noQuestions')}</p>
      </div>
    );
  }

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
          <div className="flex gap-2 mb-6 justify-center">
            {(['all', 'wrong', 'correct'] as const).map((f) => {
              const count =
                f === 'all' ? questions.length : f === 'wrong' ? wrongCount : correctCount;
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
                  {t(`quiz.filter${f.charAt(0).toUpperCase() + f.slice(1)}`, {
                    count,
                    defaultValue: `${f.charAt(0).toUpperCase() + f.slice(1)} (${count})`,
                  })}
                </button>
              );
            })}
          </div>
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
                <p className="font-medium text-sm text-gray-100 mb-3">{q.question}</p>
                {q.explanation && (
                  <div className="pt-3 border-t border-gray-700/50 text-sm text-gray-400 leading-relaxed">
                    <span className="font-medium text-gray-300 inline-flex items-center gap-1">
                      <Check size={14} /> {t('quiz.explanation', 'Explanation')}:
                    </span>{' '}
                    {q.explanation}
                  </div>
                )}
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col justify-center">
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="quiz-container-card p-6">
          <div className="flex justify-end mb-3">
            <span className="text-xs text-gray-500 font-medium tabular-nums">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="flex gap-1.5 mb-5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i < currentIndex
                    ? 'bg-indigo-500'
                    : i === currentIndex
                      ? 'bg-indigo-400 progress-pill-active'
                      : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          <div key={currentIndex} className="question-entrance">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-medium bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-md">
                  Q{currentQuestion?.id}
                </span>
                <span className="text-[11px] text-gray-500">
                  {t('quiz.difficulty', { level: currentQuestion?.difficulty })}
                </span>
              </div>
              {/* Question text with droppable blanks */}
              <h2 className="text-[20px] font-semibold text-white leading-relaxed tracking-tight">
                {segments.map((seg, i) =>
                  seg.type === 'text' ? (
                    <span key={i}>{seg.value}</span>
                  ) : (
                    (() => {
                      // Find blank index (count blanks up to this position)
                      const blankIdx =
                        segments.slice(0, i + 1).filter((s) => s.type === 'blank').length - 1;
                      const answer = questionAnswers[blankIdx];
                      const filledValue = filledBlanks[blankIdx];
                      return (
                        <DropBlank
                          key={`blank-${blankIdx}`}
                          blankId={`blank-${blankIdx}`}
                          filledValue={filledValue}
                          isCorrect={filledValue !== undefined && filledValue === answer}
                          isWrong={wrongBlankIdx === blankIdx}
                        />
                      );
                    })()
                  ),
                )}
              </h2>
            </div>

            {/* Token pool */}
            {tokenPool.length > 0 && (
              <div className="mb-5">
                <div className="flex flex-wrap gap-2 items-center">
                  {tokenPool.map((token) => (
                    <DragToken
                      key={token}
                      id={token}
                      label={token}
                      isUsed={Object.values(filledBlanks).includes(token)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explanation — only after answering */}
          {hasAnswer && currentQuestion?.explanation && (
            <div className="mb-5 animate-fade-in-up">
              <div className="bg-gray-800/40 rounded-[10px] p-4 border border-gray-700/30">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex((i) => i + 1);
                } else {
                  setStatus('completed');
                }
              }}
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
        <DragOverlay>
          <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-indigo-500 bg-gray-900/90 text-indigo-200 shadow-lg">
            dragging
          </span>
        </DragOverlay>
      </DragDropProvider>
    </div>
  );
}
