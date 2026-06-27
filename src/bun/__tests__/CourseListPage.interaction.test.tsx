import { describe, expect, test, afterEach, beforeEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import CourseListPage from '../../mainview/pages/CourseListPage';
import { useCourseStore } from '../../mainview/stores/courseStore';
import { mockFetch, restoreFetch } from './mock-fetch';
import '../../mainview/i18n';

const mockCourses = [
  {
    id: 'math-101',
    course: 'Mathematics 101',
    displayName: 'Mathematics 101',
    domain: 'mathematics',
    prerequisites: [],
    modules: [{ id: 1, name: 'Algebra Basics', timeHours: 3, prerequisites: [], topics: [] }],
    timeBudgetHours: 20,
    targetLevel: 'beginner',
    learningObjectives: ['Understand algebra'],
  },
];

const defaultProps = {
  onSelectCourse: () => {},
  onOpenSettings: () => {},
  onOpenBookmarks: () => {},
  onOpenDashboard: () => {},
};

beforeEach(() => {
  useCourseStore.getState().reset();
});

afterEach(restoreFetch);

describe('CourseListPage interaction', () => {
  test('renders loading state', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
    });
    expect(container.textContent).toMatch(/loading/i);
  });

  test('renders course cards when loaded', async () => {
    mockFetch({
      '/courses': mockCourses,
      '/storage/completed/modules': { moduleIDs: [] },
    });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toContain('Mathematics 101'));
  });

  test('renders empty state when no courses', async () => {
    mockFetch({ '/courses': [] });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toMatch(/no courses/i));
  });

  test('renders error state', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: 'Server down' }), {
        status: 500,
      })) as unknown as typeof globalThis.fetch;
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toMatch(/error/i));
  });
});
