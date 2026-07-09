import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'bun:test';

import type { Course } from '../../../bun/types';
import { useViewStore } from '../../stores/viewStore';
import { clearMocks, mockResponse, renderAndSettle, setupRPC } from '../../testUtils';

setupRPC();
import QuizOverlay from './QuizOverlay';

const course: Course = {
  id: 'cs101',
  course: 'CS 101',
  displayName: 'Intro to CS',
  timeBudgetHours: 40,
  targetLevel: 'beginner',
  domain: 'Computer Science',
  prerequisites: [],
  learningObjectives: [],
  modules: [
    { id: '01', name: 'Intro', timeHours: 2, prerequisites: [], topics: [] },
    { id: '02', name: 'Variables', timeHours: 3, prerequisites: ['01'], topics: [] },
    { id: '03', name: 'Functions', timeHours: 3, prerequisites: ['02'], topics: [] },
  ],
};

function setup() {
  useViewStore.setState({
    views: [{ type: 'lesson', course, module: course.modules[0] }],
  });
  mockResponse('quizIndex', {
    modules: {
      '01-intro': { mcq: true, cloze: false },
      '02-variables': { mcq: true, cloze: true },
      '03-functions': { mcq: false, cloze: true },
    },
    cumulativeQuizzes: [{ id: 'cumulative_quiz_03.yaml', milestone: 3 }],
  });
}

describe('QuizOverlay', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    useViewStore.setState({ views: [] });
    clearMocks();
  });

  test('renders module quiz buttons', async () => {
    setup();
    const { getAllByText, getByText } = await renderAndSettle(<QuizOverlay onClose={() => {}} />);
    expect(getAllByText('MCQ').length).toBeGreaterThan(0);
    expect(getByText('Intro')).toBeInTheDocument();
    expect(getByText('Variables')).toBeInTheDocument();
    expect(getByText('Functions')).toBeInTheDocument();
  });

  test('shows cloze buttons only for modules with cloze quiz', async () => {
    setup();
    const { getAllByText } = await renderAndSettle(<QuizOverlay onClose={() => {}} />);
    const btns = getAllByText('Cloze');
    expect(btns).toHaveLength(2);
  });

  test('shows cumulative START button', async () => {
    setup();
    const { getByText } = await renderAndSettle(<QuizOverlay onClose={() => {}} />);
    expect(getByText('START')).toBeInTheDocument();
  });

  test('MCQ click pushes quiz view and closes overlay', async () => {
    setup();
    let closed = false;
    const { getAllByText } = await renderAndSettle(
      <QuizOverlay
        onClose={() => {
          closed = true;
        }}
      />,
    );
    await user.click(getAllByText('MCQ')[0]);
    const views = useViewStore.getState().views;
    expect(views[views.length - 1].type).toBe('quiz');
    expect(closed).toBe(true);
  });

  test('Cloze click pushes clozeQuiz view and closes overlay', async () => {
    setup();
    let closed = false;
    const { getAllByText } = await renderAndSettle(
      <QuizOverlay
        onClose={() => {
          closed = true;
        }}
      />,
    );
    await user.click(getAllByText('Cloze')[0]);
    const views = useViewStore.getState().views;
    expect(views[views.length - 1].type).toBe('clozeQuiz');
    expect(closed).toBe(true);
  });

  test('START click pushes cumulativeQuiz view with milestone', async () => {
    setup();
    const { getByText } = await renderAndSettle(<QuizOverlay onClose={() => {}} />);
    await user.click(getByText('START'));
    const views = useViewStore.getState().views;
    expect(views[views.length - 1].type).toBe('cumulativeQuiz');
  });

  test('Escape key calls onClose', async () => {
    setup();
    let closed = false;
    const { container } = await renderAndSettle(
      <QuizOverlay
        onClose={() => {
          closed = true;
        }}
      />,
    );
    const overlay = container.querySelector('[data-testid="overlay-backdrop"]')!.parentElement!;
    expect(overlay).toBeTruthy();
    fireEvent.keyDown(overlay, { key: 'Escape' });
    expect(closed).toBe(true);
  });

  test('backdrop click calls onClose', async () => {
    setup();
    let closed = false;
    const { getByTestId } = await renderAndSettle(
      <QuizOverlay
        onClose={() => {
          closed = true;
        }}
      />,
    );
    expect(getByTestId('overlay-backdrop')).toBeTruthy();
    await user.click(getByTestId('overlay-backdrop'));
    expect(closed).toBe(true);
  });

  test('shows empty state when no quizzes', async () => {
    useViewStore.setState({
      views: [{ type: 'lesson', course, module: course.modules[0] }],
    });
    mockResponse('quizIndex', { modules: {}, cumulativeQuizzes: [] });
    const { getByText } = await renderAndSettle(<QuizOverlay onClose={() => {}} />);
    expect(getByText(/No quizzes available/i)).toBeInTheDocument();
  });
});
