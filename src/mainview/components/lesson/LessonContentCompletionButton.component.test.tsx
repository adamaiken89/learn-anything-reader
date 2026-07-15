import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'bun:test';

import { clearMocks, mockResponse, setupRPC } from '../../testUtils';

setupRPC();

import { useCompletionStore } from '../../stores/completionStore';
import { useLessonViewStore } from '../../stores/lessonViewStore';
import LessonContentCompletionButton from './LessonContentCompletionButton';

describe('LessonContentCompletionButton', () => {
  beforeEach(() => {
    useLessonViewStore.setState({ courseId: 'math', moduleId: '01', content: '' });
    useCompletionStore.setState({ completed: {}, optimisticCompleted: {} });
    clearMocks();
  });

  test('renders Mark as Complete when not completed', () => {
    const { container } = render(<LessonContentCompletionButton />);
    expect(container.textContent).toContain('Mark as Complete');
  });

  test('renders Completed when already completed', () => {
    useCompletionStore.setState({ completed: { 'math:01': true } });
    const { container } = render(<LessonContentCompletionButton />);
    expect(container.textContent).toContain('Completed');
  });

  test('toggle calls API on click', async () => {
    mockResponse('toggleModuleCompleted', true);
    mockResponse('logSession', { ok: true });

    const { getByTestId } = render(<LessonContentCompletionButton />);
    await act(async () => {
      getByTestId('complete-btn').click();
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(useCompletionStore.getState().completed['math:01']).toBe(true);
  });
});
