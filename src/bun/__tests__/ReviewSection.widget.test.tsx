import { describe, expect, test, afterEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import ReviewSection from '../../mainview/sections/ReviewSection';
import { mockFetch, restoreFetch } from './mock-fetch';

const mockCard = {
  id: 'test-1-q1',
  questionId: 'q1',
  moduleId: 1,
  courseId: 'test',
  question: 'What is 2+2?',
  answer: 'B. 4',
  explanation: 'Basic addition',
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: '2024-01-01T00:00:00.000Z',
  lastReviewed: null,
  isStarred: false,
};

const mockDeck = { cards: { 'test-1-q1': mockCard } };

const defaultProps = { courseId: 'test', onBack: () => {} };

afterEach(restoreFetch);

describe('ReviewSection snapshots', () => {
  test('loading state', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ReviewSection {...defaultProps} />));
    });
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('empty deck (no cards)', async () => {
    mockFetch({ '/srs': { cards: {} } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ReviewSection {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(container.textContent).toContain('No cards in deck'));
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('card question side (initial)', async () => {
    mockFetch({ '/srs': mockDeck, '/filter': [mockCard] });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ReviewSection {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(container.textContent).toContain('Show Answer'));
    expect(container.innerHTML).toMatchSnapshot();
  });
});
