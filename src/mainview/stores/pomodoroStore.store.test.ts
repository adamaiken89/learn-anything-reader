import { beforeEach, describe, expect, test } from 'bun:test';

import { usePomodoroStore } from './pomodoroStore';

beforeEach(() => {
  localStorage.clear();
  usePomodoroStore.setState(usePomodoroStore.getInitialState());
});

describe('pomodoroStore', () => {
  test('default state', () => {
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('idle');
    expect(s.mode).toBe('focus');
    expect(s.remaining).toBe(25 * 60);
    expect(s.completedSessions).toBe(0);
  });

  test('start sets running status and remaining for focus mode', () => {
    usePomodoroStore.getState().start('focus');
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('running');
    expect(s.mode).toBe('focus');
    expect(s.remaining).toBe(25 * 60);
    expect(s.intervalId).not.toBeNull();
    clearInterval(s.intervalId!);
  });

  test('start sets remaining for short break', () => {
    usePomodoroStore.getState().start('shortBreak');
    const s = usePomodoroStore.getState();
    expect(s.remaining).toBe(5 * 60);
    clearInterval(s.intervalId!);
  });

  test('start sets remaining for long break', () => {
    usePomodoroStore.getState().start('longBreak');
    const s = usePomodoroStore.getState();
    expect(s.remaining).toBe(15 * 60);
    clearInterval(s.intervalId!);
  });

  test('pause sets status to paused and clears interval', () => {
    usePomodoroStore.getState().start('focus');
    usePomodoroStore.getState().pause();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('paused');
    expect(s.intervalId).toBeNull();
  });

  test('stop resets to idle', () => {
    usePomodoroStore.getState().start('focus');
    usePomodoroStore.getState().stop();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('idle');
    expect(s.mode).toBe('focus');
    expect(s.remaining).toBe(25 * 60);
  });

  test('reset clears interval and resets state', () => {
    usePomodoroStore.getState().start('focus');
    usePomodoroStore.getState().reset();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('idle');
    expect(s.intervalId).toBeNull();
  });

  test('resume sets status to running with interval', () => {
    const origSetInterval = globalThis.setInterval;
    let tickFn: (() => void) | null = null;
    globalThis.setInterval = ((fn: () => void) => {
      tickFn = fn;
      return 42 as unknown as ReturnType<typeof setInterval>;
    }) as typeof globalThis.setInterval;

    usePomodoroStore.getState().start('focus');
    usePomodoroStore.getState().pause();
    expect(usePomodoroStore.getState().status).toBe('paused');

    usePomodoroStore.getState().resume();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('running');
    expect(s.intervalId).not.toBeNull();

    // tick still works after resume
    tickFn!();
    expect(usePomodoroStore.getState().remaining).toBe(25 * 60 - 1);

    globalThis.setInterval = origSetInterval;
  });

  test('tick decreases remaining by 1', async () => {
    const origSetInterval = globalThis.setInterval;
    let tickFn: (() => void) | null = null;
    globalThis.setInterval = ((fn: () => void) => {
      tickFn = fn;
      return 42 as unknown as ReturnType<typeof setInterval>;
    }) as typeof globalThis.setInterval;

    usePomodoroStore.getState().start('focus');
    expect(usePomodoroStore.getState().remaining).toBe(25 * 60);

    tickFn!();
    expect(usePomodoroStore.getState().remaining).toBe(25 * 60 - 1);

    clearInterval(usePomodoroStore.getState().intervalId!);
    globalThis.setInterval = origSetInterval;
  });

  test('tick at remaining=1 sets status to finished', async () => {
    const origSetInterval = globalThis.setInterval;
    let tickFn: (() => void) | null = null;
    globalThis.setInterval = ((fn: () => void) => {
      tickFn = fn;
      return 42 as unknown as ReturnType<typeof setInterval>;
    }) as typeof globalThis.setInterval;

    usePomodoroStore.setState({ remaining: 1 });
    usePomodoroStore.getState().start('focus');
    usePomodoroStore.setState({ remaining: 1 });

    tickFn!();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('finished');
    expect(s.remaining).toBe(0);
    expect(s.intervalId).toBeNull();

    globalThis.setInterval = origSetInterval;
  });
});
