import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import type { UserCard } from '../../bun/types';
import { filterVariants } from '../components/ui';

type FilterMode = 'all' | 'due' | 'starred';

interface Props {
  courseId: string;
}

export default function UserCardReviewSection({ courseId }: Props) {
  const { t } = useTranslation();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filter, setFilter] = useState<FilterMode>('all');

  const loadCards = useCallback((f: FilterMode) => {
    setLoading(true);
    const p = f === 'due'
      ? api.usercards.list(courseId).then((all) => all.filter((c) => new Date(c.nextReviewDate) <= new Date()))
      : f === 'starred'
        ? api.usercards.list(courseId).then((all) => all.filter((c) => c.isStarred))
        : api.usercards.list(courseId);
    p.then((result) => {
      setCards(result);
      setLoading(false);
      setCurrentIndex(0);
      setShowAnswer(false);
    });
  }, [courseId]);

  useEffect(() => {
    loadCards('due');
  }, [loadCards]);

  const handleReview = async (correct: boolean) => {
    const card = cards[currentIndex];
    if (!card) return;
    await api.usercards.review(card.id, correct);
    setShowAnswer(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      loadCards(filter);
    }
  };

  const handleToggleStar = async () => {
    const card = cards[currentIndex];
    if (!card) return;
    const updated = await api.usercards.toggleStar(card.id);
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleFilterChange = (f: FilterMode) => {
    setFilter(f);
    loadCards(f);
  };

  const currentCard = cards[currentIndex];

  if (loading)
    return <div className="p-8 text-center text-gray-400">{t('review.loadingCards')}</div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6">
        {(['all', 'due', 'starred'] as const).map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={filterVariants({ active: filter === f })}
          >
            {f === 'all' ? t('review.all') : f === 'due' ? t('review.due') : t('review.starred')}
          </button>
        ))}
      </div>
      {cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">
            {filter === 'due'
              ? t('review.noDueCards')
              : filter === 'starred'
                ? t('review.noStarredCards')
                : t('userCardReview.noCards')}
          </p>
          <p className="text-sm text-gray-500">{t('userCardReview.noCardsHint')}</p>
        </div>
      ) : (
        currentCard && (
          <div>
            <div className="text-xs text-gray-500 mb-2 text-center">
              {t('userCardReview.cardCounter', { current: currentIndex + 1, total: cards.length })}
              {currentCard.isStarred && <span className="ml-2 text-yellow-500">{t('icons.starFilled')}</span>}
            </div>

            <div className="bg-gray-800 rounded-xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center mb-6">
              {!showAnswer ? (
                <div>
                  <h3 className="text-lg font-medium mb-6">{currentCard.front}</h3>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                  >
                    {t('review.showAnswer')}
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-4 pb-4 border-b border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">{t('userCardReview.front')}</p>
                    <p className="text-lg font-medium">{currentCard.front}</p>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-1">{t('userCardReview.back')}</p>
                    <p className="text-lg">{currentCard.back}</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => handleReview(false)}
                      className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      {t('review.forgot')}
                    </button>
                    <button
                      onClick={() => handleReview(true)}
                      className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors"
                    >
                      {t('review.remembered')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              {currentCard.isStarred ? (
                <button
                  onClick={handleToggleStar}
                  className="text-xs text-yellow-500 hover:text-yellow-400"
                >
                  {t('review.unstar')}
                </button>
              ) : (
                <button
                  onClick={handleToggleStar}
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
  );
}