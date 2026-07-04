import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'bun:test';

import { useLessonViewStore } from '../../stores/lessonViewStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { mockResponse, setupRPC } from '../../testUtils';
import LessonContentViewer from './LessonContentViewer';

setupRPC();

beforeEach(() => {
  useLessonViewStore.setState({
    courseId: 'test-course',
    moduleId: 'test-module',
    bodyContent: '# Test\n\nContent here\n\n'.repeat(50),
    sections: [],
    contentRef: { current: document.createElement('div') },
    loading: false,
    searchTrigger: 0,
  });
  useSettingsStore.setState({
    contentWidth: 'standard',
    fontSize: 16,
    theme: 'dark' as const,
    focusMode: false,
    showSections: false,
  });
  mockResponse('getNotes', []);
  mockResponse('getHighlights', []);
});

describe('LessonContentViewer', () => {
  test('renders search bar as sibling before scroll container when search active', () => {
    useLessonViewStore.setState({ searchTrigger: 1 });

    const { container } = render(<LessonContentViewer />);

    const scrollContainer = container.querySelector('[data-testid="lesson-content"]');
    expect(scrollContainer).toBeInTheDocument();

    const searchBar = container.querySelector('[data-testid="viewer-search"]');
    expect(searchBar).toBeInTheDocument();

    expect(scrollContainer?.contains(searchBar)).toBe(false);
    expect(scrollContainer?.previousElementSibling).toBe(searchBar);
  });

  test('does not render search bar when search inactive', () => {
    const { container } = render(<LessonContentViewer />);
    expect(container.querySelector('[data-testid="viewer-search"]')).not.toBeInTheDocument();
  });
});
