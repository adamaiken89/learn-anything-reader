import { describe, expect, test } from 'bun:test';
import {
  clamp,
  retrievability,
  initStability,
  initDifficulty,
  shortTermStability,
  nextDifficulty,
  nextRecallStability,
  nextForgetStability,
  nextInterval,
  rating,
  W,
} from './fsrs';

describe('clamp', () => {
  test('returns value within range', () => expect(clamp(5)).toBe(5));
  test('clamps below min', () => expect(clamp(-1)).toBe(0.001));
  test('clamps above max', () => expect(clamp(100000)).toBe(36500));
  test('custom bounds', () => expect(clamp(50, 10, 20)).toBe(20));
});

describe('retrievability', () => {
  test('elapsed=0 returns 1.0', () => expect(retrievability(0, 100)).toBe(1));
  test('returns value in (0, 1]', () => {
    const r = retrievability(30, 10);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThanOrEqual(1);
  });
  test('decays with time', () => {
    const r1 = retrievability(10, 100);
    const r2 = retrievability(50, 100);
    expect(r2).toBeLessThan(r1);
  });
  test('more stable decays slower', () => {
    const r1 = retrievability(30, 10);
    const r2 = retrievability(30, 100);
    expect(r2).toBeGreaterThan(r1);
  });
});

describe('initStability', () => {
  test('monotonic with rating', () => {
    expect(initStability(4)).toBeGreaterThan(initStability(3));
    expect(initStability(3)).toBeGreaterThan(initStability(2));
    expect(initStability(2)).toBeGreaterThan(initStability(1));
  });
  test('uses correct W values', () => {
    expect(initStability(1)).toBe(W[0]);
    expect(initStability(3)).toBe(W[2]);
  });
});

describe('initDifficulty', () => {
  test('inverse with rating', () => {
    expect(initDifficulty(1)).toBeGreaterThan(initDifficulty(2));
    expect(initDifficulty(2)).toBeGreaterThan(initDifficulty(3));
    expect(initDifficulty(3)).toBeGreaterThan(initDifficulty(4));
  });
  test('clamped to [1, 10]', () => {
    for (let r = 1; r <= 4; r++) {
      const d = initDifficulty(r);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(10);
    }
  });
});

describe('shortTermStability', () => {
  test('correct > wrong on same stability', () => {
    const right = shortTermStability(5, 3);
    const wrong = shortTermStability(5, 1);
    expect(right).toBeGreaterThan(wrong);
  });
  test('grows with higher stability', () => {
    const s1 = shortTermStability(5, 3);
    const s2 = shortTermStability(10, 3);
    expect(s2).toBeGreaterThan(s1);
  });
});

describe('nextDifficulty', () => {
  test('correct decreases difficulty', () => {
    const d = 5;
    expect(nextDifficulty(d, 3)).toBeLessThan(d);
    expect(nextDifficulty(d, 4)).toBeLessThan(nextDifficulty(d, 3));
  });
  test('wrong increases difficulty', () => {
    const d = 5;
    expect(nextDifficulty(d, 1)).toBeGreaterThan(d);
  });
  test('clamped to [1, 10]', () => {
    for (let r = 1; r <= 4; r++) {
      const nd = nextDifficulty(5, r);
      expect(nd).toBeGreaterThanOrEqual(1);
      expect(nd).toBeLessThanOrEqual(10);
    }
  });
});

describe('nextRecallStability', () => {
  test('higher rating = more stability', () => {
    const r2 = nextRecallStability(5, 10, 0.9, 2);
    const r3 = nextRecallStability(5, 10, 0.9, 3);
    const r4 = nextRecallStability(5, 10, 0.9, 4);
    expect(r4).toBeGreaterThan(r3);
    expect(r3).toBeGreaterThan(r2);
  });
  test('lower retrievability = more gain', () => {
    const low = nextRecallStability(5, 10, 0.5, 3);
    const high = nextRecallStability(5, 10, 0.9, 3);
    expect(low).toBeGreaterThan(high);
  });
  test('more difficult = less gain', () => {
    const easy = nextRecallStability(3, 10, 0.9, 3);
    const hard = nextRecallStability(8, 10, 0.9, 3);
    expect(easy).toBeGreaterThan(hard);
  });
});

describe('nextForgetStability', () => {
  test('returns positive value', () => {
    expect(nextForgetStability(5, 10, 0.8)).toBeGreaterThan(0);
  });
  test('higher retrievability = bigger forgetting shock = lower stability', () => {
    const low = nextForgetStability(5, 10, 0.3);
    const high = nextForgetStability(5, 10, 0.8);
    expect(high).toBeLessThan(low);
  });
});

describe('nextInterval', () => {
  test('grows with stability', () => {
    expect(nextInterval(10)).toBeGreaterThanOrEqual(nextInterval(5));
  });
  test('minimum interval is 1', () => {
    expect(nextInterval(0.1)).toBe(1);
  });
  test('maximum interval clamped', () => {
    expect(nextInterval(1e9)).toBe(36500);
  });
  test('returns integer', () => {
    expect(Number.isInteger(nextInterval(10))).toBe(true);
  });
});

describe('rating', () => {
  test('correct maps to 3', () => expect(rating(true)).toBe(3));
  test('incorrect maps to 1', () => expect(rating(false)).toBe(1));
});
