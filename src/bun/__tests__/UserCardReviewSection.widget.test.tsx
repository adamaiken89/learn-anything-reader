import { describe, expect, test, afterEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import UserCardReviewSection from '../../mainview/sections/UserCardReviewSection';
import { mockFetch, restoreFetch } from './mock-fetch';
import '../../mainview/i18n';

afterEach(restoreFetch);

describe('UserCardReviewSection snapshots', () => {
  test('loading state', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<UserCardReviewSection courseId="test" />));
    });
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('empty deck', async () => {
    mockFetch({ '/usercards': [] });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<UserCardReviewSection courseId="test" />));
    });
    await waitFor(() => expect(container.textContent).toMatch(/no card|noCards/i));
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('card front side', async () => {
    mockFetch({
      '/usercards': [
        {
          id: 'uc1',
          courseId: 'test',
          moduleId: 1,
          front: 'What is 2+2?',
          back: '4',
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date().toISOString(),
          lastReviewed: null,
          isStarred: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<UserCardReviewSection courseId="test" />));
    });
    await waitFor(() => expect(container.textContent).toContain('What is 2+2?'));
    expect(container.innerHTML).toMatchSnapshot();
  });
});
