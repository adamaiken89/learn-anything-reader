import { describe, expect, test, afterEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import DashboardPage from '../../mainview/pages/DashboardPage';
import { mockFetch, restoreFetch } from './mock-fetch';
import '../../mainview/i18n';

const defaultProps = { onBack: () => {} };
afterEach(restoreFetch);

describe('DashboardPage snapshots', () => {
  test('loading state', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<DashboardPage {...defaultProps} courseID="math" />));
    });
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('course stats', async () => {
    mockFetch({
      '/stats/math': {
        completedModules: 5,
        totalModules: 10,
        avgQuizScore: 85,
        srsDueCount: 3,
        srsTotalCards: 20,
        streak: 4,
        totalStudyMinutes: 1200,
        recentSessions: [],
      },
    });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<DashboardPage {...defaultProps} courseID="math" />));
    });
    await waitFor(() => expect(container.textContent).toContain('5/10'));
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('global stats', async () => {
    mockFetch({
      '/stats/global': {
        totalCompletedModules: 10,
        totalModules: 25,
        streak: 3,
        totalStudyMinutes: 3000,
        totalCourses: 2,
        courseSummaries: [
          { courseID: 'math', courseName: 'Math', completed: 5, total: 10 },
          { courseID: 'physics', courseName: 'Physics', completed: 5, total: 15 },
        ],
      },
    });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<DashboardPage {...defaultProps} />));
    });
    await waitFor(() => expect(container.textContent).toContain('10/25'));
    expect(container.innerHTML).toMatchSnapshot();
  });
});
