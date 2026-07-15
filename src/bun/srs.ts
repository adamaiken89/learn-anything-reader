import {
  rating,
  retrievability,
  initStability,
  initDifficulty,
  shortTermStability,
  nextDifficulty,
  nextRecallStability,
  nextForgetStability,
  nextInterval,
} from './fsrs';
import type { SRSCard, SRSDeck, QuizQuestion } from './types';

function migrateSM2Card(card: SRSCard): void {
  if (card.stability !== undefined) return;
  card.stability = Math.max(1.0, card.interval);
  card.difficulty = Math.max(1, Math.min(10, 5 + (2.5 - card.easeFactor) * 2));
  card.lapses = 0;
  card.state = card.repetitions > 0 ? 'Review' : 'New';
}

export function getDueCards(deck: SRSDeck, now?: Date): SRSCard[] {
  const nowDate = now || new Date();
  return Object.values(deck.cards)
    .filter((c) => new Date(c.nextReviewDate) <= nowDate)
    .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
}

export function getStarredCards(deck: SRSDeck): SRSCard[] {
  return Object.values(deck.cards)
    .filter((c) => c.isStarred)
    .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
}

export function getAllCards(deck: SRSDeck): SRSCard[] {
  return Object.values(deck.cards).sort(
    (a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime(),
  );
}

export function getCardsForCourse(deck: SRSDeck, courseId: string): SRSCard[] {
  return getAllCards(deck).filter((c) => c.courseId === courseId);
}

export function getDueCardsForCourse(deck: SRSDeck, courseId: string, now?: Date): SRSCard[] {
  return getDueCards(deck, now).filter((c) => c.courseId === courseId);
}

export function getStarredCardsForCourse(deck: SRSDeck, courseId: string): SRSCard[] {
  return getStarredCards(deck).filter((c) => c.courseId === courseId);
}

export function createSRSCard(
  question: QuizQuestion,
  moduleId: string,
  courseId: string,
  now?: Date,
): SRSCard {
  const nowISO = (now || new Date()).toISOString();
  return {
    id: `${courseId}-${moduleId}-${question.id}`,
    questionId: question.id,
    moduleId,
    courseId,
    question: question.question,
    answer: `${question.answer}. ${question.options[question.answer] || ''}`,
    explanation: question.explanation,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: nowISO,
    lastReviewed: null,
    isStarred: false,
  };
}

export function performReview(card: SRSCard, correct: boolean, now?: Date): SRSCard {
  migrateSM2Card(card);

  const nowDate = now || new Date();
  const updated = { ...card };
  const r = rating(correct);
  const state = updated.state || 'New';

  // Calculate elapsed days
  let elapsedDays = 0;
  if (updated.lastReviewed) {
    const lr = new Date(updated.lastReviewed);
    elapsedDays = Math.max(
      0,
      Math.floor((nowDate.getTime() - lr.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  if (state === 'New') {
    updated.stability = initStability(r);
    updated.difficulty = initDifficulty(r);
    updated.lapses = 0;
    updated.state = 'Review';
  } else if (elapsedDays < 1) {
    // Short-term (< 1 day)
    if (r >= 3) {
      updated.stability = shortTermStability(updated.stability!, r);
    } else {
      updated.stability = nextForgetStability(updated.difficulty!, updated.stability!, 1.0);
    }
    updated.difficulty = nextDifficulty(updated.difficulty!, r);
    if (r < 3) {
      updated.lapses = (updated.lapses || 0) + 1;
      updated.state = 'Relearning';
    }
  } else if (r >= 3) {
    const ret = retrievability(elapsedDays, updated.stability!);
    updated.stability = nextRecallStability(updated.difficulty!, updated.stability!, ret, r);
    updated.difficulty = nextDifficulty(updated.difficulty!, r);
  } else {
    const ret = retrievability(elapsedDays, updated.stability!);
    updated.lapses = (updated.lapses || 0) + 1;
    updated.stability = nextForgetStability(updated.difficulty!, updated.stability!, ret);
    updated.difficulty = nextDifficulty(updated.difficulty!, r);
    updated.state = 'Relearning';
  }

  const interval = nextInterval(updated.stability!);
  updated.interval = interval;
  updated.easeFactor =
    Math.round(Math.max(1.3, Math.min(5.0, 2.5 - (updated.difficulty! - 5) * 0.15)) * 100) / 100;
  updated.repetitions = r >= 3 ? (updated.repetitions || 0) + 1 : 0;

  const nextDate = new Date(nowDate);
  nextDate.setDate(nextDate.getDate() + interval);
  updated.nextReviewDate = nextDate.toISOString();
  updated.lastReviewed = nowDate.toISOString();

  return updated;
}

export function toggleStar(deck: SRSDeck, cardId: string): SRSDeck {
  const card = deck.cards[cardId];
  if (!card) return deck;
  return {
    ...deck,
    cards: {
      ...deck.cards,
      [cardId]: { ...card, isStarred: !card.isStarred },
    },
  };
}
