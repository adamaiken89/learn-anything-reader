import type { SRSCard, SRSDeck, QuizQuestion } from './types';

// FSRS-5 default parameters (21 params, from py-fsrs v6)
const W = [
  0.212, 1.2931, 2.3065, 8.2956, 8.2956, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835,
  0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
];

const DECAY = -W[20];
const FACTOR = 0.9 ** (1 / DECAY) - 1;
const MAX_INTERVAL = 36500;

function clamp(v: number, lo = 0.001, hi = MAX_INTERVAL): number {
  return Math.max(lo, Math.min(hi, v));
}

function retrievability(elapsedDays: number, stability: number): number {
  return (1 + (FACTOR * elapsedDays) / stability) ** DECAY;
}

function initStability(rating: number): number {
  return clamp(W[rating - 1]);
}

function initDifficulty(rating: number): number {
  const d = W[4] - Math.exp(W[5] * (rating - 1)) + 1;
  return Math.max(1, Math.min(10, d));
}

function shortTermStability(stability: number, rating: number): number {
  let increase = Math.exp(W[17] * (rating - 3 + W[18])) * stability ** -W[19];
  if (rating >= 3) increase = Math.max(increase, 1.0);
  return clamp(stability * increase);
}

function linearDamping(deltaD: number, d: number): number {
  return ((10 - d) * deltaD) / 9;
}

function meanReversion(arg1: number, arg2: number): number {
  return W[7] * arg1 + (1 - W[7]) * arg2;
}

function nextDifficulty(difficulty: number, rating: number): number {
  const arg1 = W[4] - Math.exp(W[5] * (4 - 1)) + 1;
  const deltaD = -W[6] * (rating - 3);
  const arg2 = difficulty + linearDamping(deltaD, difficulty);
  const nd = meanReversion(arg1, arg2);
  return Math.max(1, Math.min(10, nd));
}

function nextRecallStability(
  difficulty: number,
  stability: number,
  retriev: number,
  rating: number,
): number {
  const hardPenalty = rating === 2 ? W[15] : 1;
  const easyBonus = rating === 4 ? W[16] : 1;
  const delta =
    Math.exp(W[8]) *
    (11 - difficulty) *
    stability ** -W[9] *
    (Math.exp((1 - retriev) * W[10]) - 1) *
    hardPenalty *
    easyBonus;
  return clamp(stability * (1 + delta));
}

function nextForgetStability(difficulty: number, stability: number, retriev: number): number {
  const longTerm =
    W[11] * difficulty ** -W[12] * ((stability + 1) ** W[13] - 1) * Math.exp((1 - retriev) * W[14]);
  const shortTerm = stability / Math.exp(W[17] * W[18]);
  return clamp(Math.min(longTerm, shortTerm));
}

function nextInterval(stability: number): number {
  const interval = (stability / FACTOR) * (0.9 ** (1 / DECAY) - 1);
  return Math.max(1, Math.min(MAX_INTERVAL, Math.round(interval)));
}

function rating(correct: boolean): number {
  return correct ? 3 : 1;
}

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
