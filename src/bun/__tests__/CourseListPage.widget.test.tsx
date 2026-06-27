import { describe, expect, test, afterEach, beforeEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import CourseListPage from '../../mainview/pages/CourseListPage';
import { useCourseStore } from '../../mainview/stores/courseStore';
import { mockFetch, restoreFetch } from './mock-fetch';

beforeEach(() => {
  useCourseStore.getState().reset();
});

const mockCourses = [
  {
    id: 'math-101',
    course: 'Mathematics 101',
    displayName: 'Mathematics 101',
    domain: 'mathematics',
    prerequisites: [],
    modules: [
      { id: 1, name: 'Algebra Basics', timeHours: 3, prerequisites: [], topics: [] },
      { id: 2, name: 'Geometry', timeHours: 2, prerequisites: [], topics: [] },
    ],
    timeBudgetHours: 20,
    targetLevel: 'beginner',
    learningObjectives: ['Understand algebra', 'Solve equations'],
  },
  {
    id: 'physics',
    course: 'Physics',
    displayName: 'Physics',
    domain: 'physics',
    prerequisites: [],
    modules: [{ id: 1, name: 'Mechanics', timeHours: 5, prerequisites: [], topics: [] }],
    timeBudgetHours: 30,
    targetLevel: 'intermediate',
    learningObjectives: [],
  },
];

const defaultProps = {
  onSelectCourse: () => {},
  onOpenSettings: () => {},
  onOpenBookmarks: () => {},
  onOpenDashboard: () => {},
};

afterEach(restoreFetch);

describe('CourseListPage snapshots', () => {
  test('loading state', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
    });
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('error state', async () => {
    (globalThis as Record<string, unknown>).fetch = async () =>
      new Response(JSON.stringify({ error: 'Server down' }), { status: 500 });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(container.textContent).toContain('Error'));
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('content state with courses', async () => {
    mockFetch({ '/courses': mockCourses });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(container.textContent).toContain('Mathematics 101'));
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('empty state (no courses)', async () => {
    mockFetch({ '/courses': [] });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<CourseListPage {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(container.textContent).toContain('No courses found'));
    expect(container.innerHTML).toMatchSnapshot();
  });
});
