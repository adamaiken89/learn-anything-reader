import { Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from '../components/dashboard/ProgressBar';
import FilterBar from '../components/FilterBar';
import { useReviewState } from '../hooks/useReviewState';

interface Props {
  courseId: string;
}

export default function ReviewSection({ courseId }: Props) {
  const { t } = useTranslation();
  const {
    cards,
    loading,
    currentIndex,
    filter,
    currentCard,
    sessionReviewed,
    accuracy,
    setShowAnswer,
    setFilter,
    handleReview,
    handleToggleStar,
  } = useReviewState(courseId);

  const [tossClass, setTossClass] = useState('');
  const [flipped, setFlipped] = useState(false);
  const pendingReviewRef = useRef<boolean | null>(null);

  const handleFlip = useCallback(() => {
    setFlipped(true);
    setShowAnswer(true);
  }, [setShowAnswer]);

  const handleReviewWithToss = useCallback((correct: boolean) => {
    pendingReviewRef.current = correct;
    setTossClass(correct ? 'anim-card-toss-right' : 'anim-card-toss-left');
  }, []);

  const handleTossEnd = useCallback(() => {
    const correct = pendingReviewRef.current;
    pendingReviewRef.current = null;
    setTossClass('');
    setFlipped(false);
    if (correct !== null) void handleReview(correct);
  }, [handleReview]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentCard || tossClass) return;
      if (e.key === ' ' && !flipped) {
        e.preventDefault();
        handleFlip();
      } else if ((e.key === '1' || e.key === 'f') && flipped) {
        e.preventDefault();
        handleReviewWithToss(false);
      } else if ((e.key === '2' || e.key === 'r') && flipped) {
        e.preventDefault();
        handleReviewWithToss(true);
      } else if (e.key === 's') {
        e.preventDefault();
        void handleToggleStar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentCard, flipped, tossClass, handleFlip, handleReviewWithToss, handleToggleStar]);

  if (loading)
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="h-10 bg-gray-700/50 rounded-lg animate-pulse" />
        <div className="h-16 bg-gray-700/50 rounded-xl animate-pulse" />
        <div className="h-[260px] bg-gray-700/50 rounded-xl animate-pulse" />
      </div>
    );

  const progressPct = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto">
      <div className="anim-fade-in-up">
        <div className="bg-gray-800/30 rounded-lg px-4 py-3 flex items-baseline justify-between mb-4">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              {t('review.reviewed')}
            </p>
            <p className="text-2xl font-bold text-indigo-400">{sessionReviewed}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              {t('review.accuracy')}
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {sessionReviewed > 0 ? `${Math.round(accuracy * 100)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              {t('review.remaining')}
            </p>
            <p className="text-2xl font-bold text-amber-400">{cards.length - currentIndex}</p>
          </div>
        </div>
      </div>

      <div className="anim-fade-in-up" style={{ animationDelay: '80ms' }}>
        <ProgressBar pct={progressPct} />
      </div>

      <div className="anim-fade-in-up" style={{ animationDelay: '160ms' }}>
        <div className="mt-4">
          <FilterBar filter={filter} onFilter={setFilter} />
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              {filter === 'due'
                ? t('review.noDueCards')
                : filter === 'starred'
                  ? t('review.noStarredCards')
                  : t('review.noCards')}
            </p>
            <p className="text-sm text-gray-500">{t('review.completeQuiz')}</p>
          </div>
        ) : (
          currentCard && (
            <div>
              <div className="text-xs text-gray-500 mb-2 text-center">
                {t('review.cardOf', { current: currentIndex + 1, total: cards.length })}
                {currentCard.isStarred && (
                  <span className="ml-2 text-yellow-500">
                    <Star size={14} fill="currentColor" />
                  </span>
                )}
              </div>

              <div className={`flip-container ${tossClass}`} onAnimationEnd={handleTossEnd}>
                <div
                  className={`flip-inner bg-gray-800 rounded-xl min-h-[260px] ${flipped ? 'is-flipped' : ''}`}
                >
                  <div className="flip-front absolute inset-0 p-8 flex flex-col items-center justify-center text-center rounded-xl">
                    <h3 className="text-lg font-medium mb-6">{currentCard.question}</h3>
                    <button
                      onClick={handleFlip}
                      data-testid="show-answer"
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-sans"
                    >
                      {t('review.showAnswer')}
                    </button>
                    <p className="text-[10px] text-gray-600 mt-3 font-sans">
                      {t('review.flipHint')}
                    </p>
                  </div>
                  <div className="flip-back absolute inset-0 p-8 rounded-xl overflow-y-auto font-sans">
                    <div className="mb-3 pb-3 border-b border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">{t('review.question')}</p>
                      <p className="text-base font-medium">{currentCard.question}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-400 mb-1">{t('review.answer')}</p>
                      <p className="text-base">{currentCard.answer}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-1">{t('review.explanation')}</p>
                      <p className="text-sm text-gray-300">{currentCard.explanation}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleReviewWithToss(false)}
                        data-testid="btn-forgot"
                        className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        {t('review.forgot')}
                      </button>
                      <button
                        onClick={() => handleReviewWithToss(true)}
                        data-testid="btn-remembered"
                        className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors"
                      >
                        {t('review.remembered')}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2 text-center">
                      {t('review.forgotHint')} · {t('review.rememberedHint')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {currentCard.isStarred ? (
                  <button
                    onClick={() => void handleToggleStar()}
                    data-testid="btn-star"
                    className="text-xs text-yellow-500 hover:text-yellow-400"
                  >
                    {t('review.unstar')}
                  </button>
                ) : (
                  <button
                    onClick={() => void handleToggleStar()}
                    data-testid="btn-star"
                    className="text-xs text-gray-500 hover:text-gray-400"
                  >
                    {t('review.star')}
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
