import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'bun:test';

import { useLessonViewStore } from '../../stores/lessonViewStore';
import { clearMocks, mockResponse, setupRPC } from '../../testUtils';
import NavigationAITab from './NavigationAITab';

setupRPC();

beforeEach(() => {
  clearMocks();
  useLessonViewStore.setState({ content: 'Lesson content about physics' });
  mockResponse('geminiAsk', 'AI response text');
});

describe('NavigationAITab', () => {
  const user = userEvent.setup();

  test('renders three skill buttons', () => {
    const { getByText } = render(<NavigationAITab />);
    expect(getByText('Feynman Explain')).toBeInTheDocument();
    expect(getByText('Reframe')).toBeInTheDocument();
    expect(getByText('Drill')).toBeInTheDocument();
  });

  test('renders textarea', () => {
    const { getByPlaceholderText } = render(<NavigationAITab />);
    expect(getByPlaceholderText('Ask a question about this lesson...')).toBeInTheDocument();
  });

  test('happy path — click skill shows response', async () => {
    const { getByText } = render(<NavigationAITab />);
    await user.click(getByText('Feynman Explain'));
    await waitFor(() => {
      expect(getByText('AI response text')).toBeInTheDocument();
    });
  });

  test('error path — shows error on failure', async () => {
    mockResponse('geminiAsk', new Error('Network error'));
    const { getByText } = render(<NavigationAITab />);
    await user.click(getByText('Feynman Explain'));
    await waitFor(() => {
      expect(getByText(/aiError|error/i)).toBeInTheDocument();
    });
  });

  test('toggle off — click same skill clears response', async () => {
    const { getByText, queryByText } = render(<NavigationAITab />);
    await user.click(getByText('Feynman Explain'));
    await waitFor(() => {
      expect(getByText('AI response text')).toBeInTheDocument();
    });
    await user.click(getByText('Feynman Explain'));
    expect(queryByText('AI response text')).not.toBeInTheDocument();
  });

  test('loading state shown while waiting', async () => {
    let resolvePromise!: (value: unknown) => void;
    mockResponse(
      'geminiAsk',
      new Promise((r) => {
        resolvePromise = r;
      }),
    );
    const { getByText } = render(<NavigationAITab />);
    await user.click(getByText('Feynman Explain'));
    await waitFor(() => {
      expect(getByText(/thinking/i)).toBeInTheDocument();
    });
    resolvePromise('done');
    await waitFor(() => {
      expect(getByText('done')).toBeInTheDocument();
    });
  });
});
