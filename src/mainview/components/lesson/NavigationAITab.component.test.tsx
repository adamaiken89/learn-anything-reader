import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';

import { useLessonViewStore } from '../../stores/lessonViewStore';
import { clearMocks, setupRPC } from '../../testUtils';
import NavigationAITab from './NavigationAITab';

setupRPC();

describe('NavigationAITab', () => {
  const user = userEvent.setup();
  let originalWriteText: typeof navigator.clipboard.writeText;

  beforeAll(() => {
    originalWriteText = navigator.clipboard.writeText;
  });

  beforeEach(() => {
    clearMocks();
    useLessonViewStore.setState({ content: 'Lesson content about physics' });
  });

  afterAll(() => {
    // nothing to restore
  });

  test('renders two skill buttons', () => {
    const { getByText } = render(<NavigationAITab />);
    expect(getByText('Feynman Explain')).toBeInTheDocument();
    expect(getByText('Reframe')).toBeInTheDocument();
  });

  test('renders textarea', () => {
    const { getByPlaceholderText } = render(<NavigationAITab />);
    expect(getByPlaceholderText('Ask a question about this lesson...')).toBeInTheDocument();
  });

  test('click skill copies prompt and opens browser', async () => {
    let copiedText = '';
    Object.assign(navigator.clipboard, {
      writeText: (t: string) => {
        copiedText = t;
        return Promise.resolve();
      },
    });
    const { getByText } = render(<NavigationAITab />);
    await user.click(getByText('Feynman Explain'));
    expect(copiedText).toContain('curious 12-year-old');
    expect(copiedText).toContain('clarifying questions');
    Object.assign(navigator.clipboard, { writeText: originalWriteText });
  });
});
