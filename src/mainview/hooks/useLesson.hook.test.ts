import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'bun:test';

import { clearMocks, mockResponse, setupRPC } from '../test-utils';
import { useLesson } from './useLesson';

setupRPC();

beforeEach(() => {
  clearMocks();
});

const lessonData = {
  content: '# Test\n\nHello world',
  h1: 'Test Lesson',
  meta: [{ key: 'author', value: 'Test', icon: '👤', label: 'Author' }],
  bodyContent: 'Hello world',
  sections: [{ id: 'sec1', heading: 'Section 1', level: 2, parentID: null }],
};

const defaultCompletion = {
  isCompleted: false,
  completedCount: 0,
  totalModules: 5,
  toggle: async () => {},
};

describe('useLesson', () => {
  test('initial state has loading true', () => {
    mockResponse('loadLesson', lessonData);
    const { result } = renderHook(() => useLesson('math', '01', defaultCompletion));
    expect(result.current.loading).toBe(true);
    expect(result.current.content).toBe('');
    expect(result.current.h1).toBe('');
    expect(result.current.sections).toEqual([]);
  });

  test('load populates content and sections', async () => {
    mockResponse('loadLesson', lessonData);
    const { result } = renderHook(() => useLesson('math', '01', defaultCompletion));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.content).toBe(lessonData.content);
    expect(result.current.h1).toBe(lessonData.h1);
    expect(result.current.meta).toEqual(lessonData.meta);
    expect(result.current.bodyContent).toBe(lessonData.bodyContent);
    expect(result.current.sections).toEqual(lessonData.sections);
  });

  test('load failure sets loading false', async () => {
    mockResponse('loadLesson', undefined);
    const { result } = renderHook(() => useLesson('math', '01', defaultCompletion));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.content).toBe('');
  });

  test('isCompleted reads from completion prop', async () => {
    mockResponse('loadLesson', lessonData);
    const { result } = renderHook(() => useLesson('math', '01', defaultCompletion));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isCompleted).toBe(false);
  });

  test('handleToggleCompleted calls toggle', async () => {
    let toggleCalled = false;
    const toggle = async () => {
      toggleCalled = true;
    };
    mockResponse('loadLesson', lessonData);
    const { result } = renderHook(() => useLesson('math', '01', { ...defaultCompletion, toggle }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isCompleted).toBe(false);
    await act(async () => {
      await result.current.handleToggleCompleted();
    });
    expect(toggleCalled).toBe(true);
  });

  test('scrollToSection no-ops when contentRef is null', () => {
    mockResponse('loadLesson', lessonData);
    const { result } = renderHook(() => useLesson('math', '01', defaultCompletion));
    expect(() => result.current.scrollToSection('sec1')).not.toThrow();
  });

  test('handleScroll no-ops when contentRef is null', () => {
    mockResponse('loadLesson', lessonData);
    const { result } = renderHook(() => useLesson('math', '01', defaultCompletion));
    expect(() => result.current.handleScroll()).not.toThrow();
  });

  test('initialSectionID sets visibleSection', async () => {
    mockResponse('loadLesson', lessonData);
    const { result } = renderHook(() => useLesson('math', '01', defaultCompletion, 'sec1'));
    expect(result.current.visibleSection).toBe('sec1');
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
