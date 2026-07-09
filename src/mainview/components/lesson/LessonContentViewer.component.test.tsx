import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'bun:test';

import type { UseLessonSearchReturn } from '../../hooks/useLessonSearch';
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
    rightPanel: false,
  });
  mockResponse('getNotes', []);
  mockResponse('getHighlights', []);
});

function createMockSearch(overrides?: Partial<UseLessonSearchReturn>): UseLessonSearchReturn {
  return {
    searchActive: false,
    searchQuery: '',
    currentMatchIndex: 0,
    totalMatches: 0,
    caseSensitive: false,
    setSearchActive: () => {},
    handleSearchQueryChange: () => {},
    handleSearchPrev: () => {},
    handleSearchNext: () => {},
    handleSearchClose: () => {},
    toggleCaseSensitive: () => {},
    ...overrides,
  };
}

describe('LessonContentViewer', () => {
  test('does not render search bar (handled by LessonSection)', () => {
    useLessonViewStore.setState({ searchTrigger: 1 });

    const { container } = render(
      <LessonContentViewer
        search={createMockSearch({ searchActive: true, searchQuery: 'test' })}
      />,
    );

    const scrollContainer = container.querySelector('[data-testid="lesson-content"]');
    expect(scrollContainer).toBeInTheDocument();

    expect(container.querySelector('[data-testid="viewer-search"]')).not.toBeInTheDocument();
  });

  test('does not render search bar when search inactive', () => {
    const { container } = render(<LessonContentViewer search={createMockSearch()} />);
    expect(container.querySelector('[data-testid="viewer-search"]')).not.toBeInTheDocument();
  });

  test('renders lesson content with markdown', () => {
    const { container } = render(<LessonContentViewer search={createMockSearch()} />);
    expect(container.querySelector('[data-testid="lesson-content"]')).toBeInTheDocument();
    // markdown content rendered
    expect(container.textContent).toContain('Content here');
  });

  // ClozeBlank rendering tested separately in ClozeBlank.component.test.tsx
  // and rehypeCloze.test.ts — react-markdown is mocked here so rehype plugins don't run

  test('handleScroll no-ops when contentRef.current is null', () => {
    useLessonViewStore.setState({ contentRef: { current: null } });
    // Should not throw
    const { container } = render(<LessonContentViewer search={createMockSearch()} />);
    expect(container.querySelector('[data-testid="lesson-content"]')).toBeInTheDocument();
  });
});
