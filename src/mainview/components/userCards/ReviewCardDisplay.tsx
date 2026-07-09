import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { UserCard } from '../../../bun/types';
import ClozeBlank from '../lesson/ClozeBlank';

function parseClozeText(
  text: string,
): Array<{ type: 'text'; value: string } | { type: 'blank'; answer: string }> {
  const regex = /\[\.\.\.([^\]]+)\]/g;
  const segments: Array<{ type: 'text'; value: string } | { type: 'blank'; answer: string }> = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: text.slice(last, match.index) });
    }
    segments.push({ type: 'blank', answer: match[1] });
    last = regex.lastIndex;
  }
  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) });
  }
  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}

function renderClozeFront(
  segments: Array<{ type: 'text'; value: string } | { type: 'blank'; answer: string }>,
) {
  return segments.map((seg, i) =>
    seg.type === 'blank' ? (
      <ClozeBlank key={i} answer={seg.answer} />
    ) : (
      <span key={i}>{seg.value}</span>
    ),
  );
}

interface ReviewCardDisplayProps {
  card: UserCard;
  currentIndex: number;
  totalCards: number;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onReview: (correct: boolean) => void | Promise<void>;
  onToggleStar: () => void | Promise<void>;
}

export default function ReviewCardDisplay({
  card,
  currentIndex,
  totalCards,
  showAnswer,
  onShowAnswer,
  onReview,
  onToggleStar,
}: ReviewCardDisplayProps) {
  const { t } = useTranslation();
  const segments = parseClozeText(card.front);
  const hasCloze = segments.some((s) => s.type === 'blank');

  return (
    <div>
      <div className="text-xs text-gray-500 mb-2 text-center">
        {t('userCardReview.cardCounter', { current: currentIndex + 1, total: totalCards })}
        {card.isStarred && (
          <span className="ml-2 text-yellow-500">
            <Star size={14} fill="currentColor" />
          </span>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center mb-6">
        {!showAnswer ? (
          <div>
            <h3 className="text-lg font-medium mb-6">
              {hasCloze ? renderClozeFront(segments) : card.front}
            </h3>
            <button
              onClick={onShowAnswer}
              data-testid="show-answer"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              {t('review.showAnswer')}
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-4 pb-4 border-b border-gray-700">
              <p className="text-sm text-gray-400 mb-1">{t('userCardReview.front')}</p>
              <p className="text-lg font-medium">
                {hasCloze ? renderClozeFront(segments) : card.front}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-1">{t('userCardReview.back')}</p>
              <p className="text-lg">{card.back}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => void onReview(false)}
                data-testid="btn-forgot"
                className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
              >
                {t('review.forgot')}
              </button>
              <button
                onClick={() => void onReview(true)}
                data-testid="btn-remembered"
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors"
              >
                {t('review.remembered')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {card.isStarred ? (
          <button
            onClick={() => void onToggleStar()}
            data-testid="btn-star"
            className="text-xs text-yellow-500 hover:text-yellow-400"
          >
            {t('review.unstar')}
          </button>
        ) : (
          <button
            onClick={() => void onToggleStar()}
            data-testid="btn-star"
            className="text-xs text-gray-500 hover:text-gray-400"
          >
            {t('review.star')}
          </button>
        )}
      </div>
    </div>
  );
}
