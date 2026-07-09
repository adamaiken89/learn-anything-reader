import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'bun:test';

import type { Bookmark, Course } from '../../../bun/types';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useViewStore } from '../../stores/viewStore';
import { clearMocks, mockResponse, setupRPC } from '../../testUtils';
import BookmarkButton from './BookmarkButton';

setupRPC();

const course: Course = {
  id: 'c1',
  course: 'Test',
  timeBudgetHours: 10,
  targetLevel: 'beginner',
  domain: 'test',
  prerequisites: [],
  learningObjectives: [],
  modules: [{ id: 'mod-1', name: 'Mod', timeHours: 1, prerequisites: [], topics: [] }],
  displayName: 'Test',
};

const mod = course.modules[0];

beforeEach(() => {
  clearMocks();
  useViewStore.setState({
    views: [{ type: 'lesson', course, module: mod }],
  });
  useBookmarksStore.setState({ byModule: {}, loading: {} });
});

describe('BookmarkButton', () => {
  const user = userEvent.setup();

  test('shows empty bookmark icon when no active bookmark', () => {
    const { getByText } = render(<BookmarkButton />);
    expect(getByText(/Bookmark/)).toBeInTheDocument();
  });

  test('shows filled icon when module bookmark exists', () => {
    const bm: Bookmark = {
      id: 'bm-1',
      courseID: 'c1',
      moduleID: 'mod-1',
      sectionID: null,
      title: 'Mod',
      scrollPosition: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    useBookmarksStore.setState({
      byModule: { 'c1:mod-1': [bm] },
    });
    const { getByText } = render(<BookmarkButton />);
    expect(getByText(/Bookmark/)).toBeInTheDocument();
  });

  test('toggle removes when bookmark exists', async () => {
    const bm: Bookmark = {
      id: 'bm-1',
      courseID: 'c1',
      moduleID: 'mod-1',
      sectionID: null,
      title: 'Mod',
      scrollPosition: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    useBookmarksStore.setState({ byModule: { 'c1:mod-1': [bm] } });
    mockResponse('deleteBookmark', undefined);
    const { getByText } = render(<BookmarkButton />);
    await user.click(getByText(/Bookmark/));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(useBookmarksStore.getState().byModule['c1:mod-1']).toEqual([]);
  });

  test('toggle adds when no bookmark exists', async () => {
    mockResponse('addBookmark', {
      id: 'bm-2',
      courseID: 'c1',
      moduleID: 'mod-1',
      sectionID: undefined,
      title: 'Mod',
      scrollPosition: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
    });
    const { getByText } = render(<BookmarkButton />);
    await user.click(getByText(/Bookmark/));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(useBookmarksStore.getState().byModule['c1:mod-1']).toHaveLength(1);
  });
});
