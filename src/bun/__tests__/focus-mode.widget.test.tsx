import { describe, expect, test, afterEach } from 'bun:test';
import { render, act } from '@testing-library/react';
import LessonSection from '../../mainview/sections/LessonSection';
import { useSettingsStore } from '../../mainview/stores/settingsStore';
import { mockFetch, restoreFetch } from './mock-fetch';
import { processLessonMarkdown } from '../lesson-markdown';

const mockContent = `# Introduction

Welcome to the lesson.

Est. study time: 2h
Language: en

## Chapter 1

First chapter content.`;

const processed = processLessonMarkdown(mockContent);

const defaultProps = {
  courseId: 'test',
  courseName: 'Test Course',
  module: { id: 1, name: 'Intro Module', timeHours: 2, prerequisites: [], topics: [] },
  content: mockContent,
  h1: processed.h1,
  meta: processed.meta,
  bodyContent: processed.bodyContent,
  loading: false,
  sections: processed.sections,
  visibleSection: null,
  isCompleted: false,
  contentRef: { current: null } as unknown as React.RefObject<HTMLDivElement>,
  scrollToSection: () => {},
  handleScroll: () => {},
  handleToggleCompleted: async () => {},
  bookmarks: [],
  highlights: [],
  addHighlight: async () => {},
  deleteHighlight: async () => {},
  onToggleBookmark: async () => {},
  showTools: false,
  showPomodoro: false,
  setShowTools: () => {},
  showSections: false,
  onToggleSections: () => {},
};

afterEach(() => {
  restoreFetch();
});

function mockAll() {
  mockFetch({
    '/api/storage/bookmarks/module': [],
    '/api/storage/highlights': [],
    '/api/storage/notes': [],
    '/courses/test/srs': { cards: {} },
    '/srs': { cards: {} },
    '/api/storage/completed': { completed: false },
    '/api/courses/test/modules/1/lesson': {
      content: '',
      h1: '',
      meta: [],
      sections: [],
      bodyContent: '',
    },
    '/api/storage/bookmarks/module/test/1': [],
    '/api/storage/highlights?courseID=test&moduleID=1': [],
    '/api/storage/notes?courseID=test&moduleID=1': [],
    '/api/storage/check-bookmark': false,
    '/api/courses/test/modules': [],
    '/api/storage/completed/count': { count: 0 },
  });
}

describe('Focus mode', () => {
  test('hides meta block when enabled', async () => {
    mockAll();
    let container!: HTMLElement;
    useSettingsStore.setState({ focusMode: true });
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} />));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('.lesson-meta')).toBeNull();
  });

  test('shows meta block when disabled', async () => {
    mockAll();
    let container!: HTMLElement;
    useSettingsStore.setState({ focusMode: false });
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} />));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('.lesson-meta')).not.toBeNull();
  });

  test('hides mark as complete button when enabled', async () => {
    mockAll();
    let container!: HTMLElement;
    useSettingsStore.setState({ focusMode: true });
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} />));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('button.w-full')).toBeNull();
  });

  test('shows mark as complete button when disabled', async () => {
    mockAll();
    let container!: HTMLElement;
    useSettingsStore.setState({ focusMode: false });
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} />));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('button.w-full')).not.toBeNull();
  });

  test('hides study tools sidebar when enabled', async () => {
    mockAll();
    let container!: HTMLElement;
    useSettingsStore.setState({ focusMode: true });
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} showTools={true} />));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('[class*="study-tools"]')).toBeNull();
  });

  test('hides sections panel when enabled', async () => {
    mockAll();
    let container!: HTMLElement;
    useSettingsStore.setState({ focusMode: true });
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} showSections={true} />));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('[class*="sections-panel"]')).toBeNull();
  });

  test('hides sections toggle button when enabled', async () => {
    mockAll();
    let container!: HTMLElement;
    useSettingsStore.setState({ focusMode: true });
    await act(async () => {
      ({ container } = render(<LessonSection {...defaultProps} showSections={false} />));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('button[title="Toggle sections panel"]')).toBeNull();
  });
});
