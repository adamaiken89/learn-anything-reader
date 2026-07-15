import type { UserCard } from './types';
import { load, save } from './persistence';
import {
  retrievability,
  initStability,
  initDifficulty,
  shortTermStability,
  nextDifficulty,
  nextRecallStability,
  nextForgetStability,
  nextInterval,
} from './fsrs';

function _migrate(card: UserCard): void {
  if (card.stability !== undefined) return;
  card.stability = Math.max(1.0, card.interval);
  card.difficulty = Math.max(1, Math.min(10, 5 + (2.5 - card.easeFactor) * 2));
  card.lapses = 0;
  card.state = card.repetitions > 0 ? 'Review' : 'New';
}

export function addUserCard(
  courseId: string,
  moduleId: string,
  front: string,
  back: string,
): UserCard {
  const data = load();
  const card: UserCard = {
    id: crypto.randomUUID(),
    courseId,
    moduleId,
    front,
    back,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    lastReviewed: null,
    isStarred: false,
    createdAt: new Date().toISOString(),
    stability: undefined,
    difficulty: undefined,
    lapses: 0,
    state: 'New',
  };
  data.userCards.push(card);
  save(data);
  return card;
}

export function getUserCards(courseId?: string, moduleId?: string): UserCard[] {
  const data = load();
  let cards = data.userCards;
  if (courseId) cards = cards.filter((c) => c.courseId === courseId);
  if (moduleId !== undefined) cards = cards.filter((c) => c.moduleId === moduleId);
  return cards.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getAllUserCards(): UserCard[] {
  const data = load();
  return [...data.userCards].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function getUserCardById(id: string): UserCard | undefined {
  const data = load();
  const card = data.userCards.find((c) => c.id === id);
  return card;
}

export function deleteUserCard(id: string): void {
  const data = load();
  data.userCards = data.userCards.filter((c) => c.id !== id);
  save(data);
}

export function updateUserCard(
  id: string,
  updates: { front?: string; back?: string },
): UserCard | null {
  const data = load();
  const card = data.userCards.find((c) => c.id === id);
  if (!card) return null;
  if (updates.front !== undefined) card.front = updates.front;
  if (updates.back !== undefined) card.back = updates.back;
  save(data);
  return card;
}

export function reviewUserCard(id: string, correct: boolean, now?: Date): UserCard | null {
  const data = load();
  const card = data.userCards.find((c) => c.id === id);
  if (!card) return null;

  _migrate(card);

  const nowDate = now || new Date();
  const r = correct ? 3 : 1;
  const state = card.state || 'New';

  let elapsedDays = 0;
  if (card.lastReviewed) {
    const lr = new Date(card.lastReviewed);
    elapsedDays = Math.max(
      0,
      Math.floor((nowDate.getTime() - lr.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  if (state === 'New') {
    card.stability = initStability(r);
    card.difficulty = initDifficulty(r);
    card.lapses = 0;
    card.state = 'Review';
  } else if (elapsedDays < 1) {
    if (r >= 3) {
      card.stability = shortTermStability(card.stability!, r);
    } else {
      card.stability = nextForgetStability(card.difficulty!, card.stability!, 1.0);
    }
    card.difficulty = nextDifficulty(card.difficulty!, r);
    if (r < 3) {
      card.lapses = (card.lapses || 0) + 1;
      card.state = 'Relearning';
    }
  } else if (r >= 3) {
    const ret = retrievability(elapsedDays, card.stability!);
    card.stability = nextRecallStability(card.difficulty!, card.stability!, ret, r);
    card.difficulty = nextDifficulty(card.difficulty!, r);
  } else {
    const ret = retrievability(elapsedDays, card.stability!);
    card.lapses = (card.lapses || 0) + 1;
    card.stability = nextForgetStability(card.difficulty!, card.stability!, ret);
    card.difficulty = nextDifficulty(card.difficulty!, r);
    card.state = 'Relearning';
  }

  const interval = nextInterval(card.stability!);
  card.interval = interval;
  card.easeFactor =
    Math.round(Math.max(1.3, Math.min(5.0, 2.5 - (card.difficulty! - 5) * 0.15)) * 100) / 100;
  card.repetitions = r >= 3 ? (card.repetitions || 0) + 1 : 0;

  const nextDate = new Date(nowDate);
  nextDate.setDate(nextDate.getDate() + interval);
  card.nextReviewDate = nextDate.toISOString();
  card.lastReviewed = nowDate.toISOString();

  save(data);
  return card;
}

export function toggleUserCardStar(id: string): UserCard | null {
  const data = load();
  const card = data.userCards.find((c) => c.id === id);
  if (!card) return null;
  card.isStarred = !card.isStarred;
  save(data);
  return card;
}
