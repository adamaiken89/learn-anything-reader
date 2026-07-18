import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';

import { useLessonViewStore } from '../../stores/lessonViewStore';
import { clearMocks, setupRPC } from '../../testUtils';

setupRPC();

import AITab from './AITab';

describe('AITab', () => {
  const user = userEvent.setup();
  let originalWriteText: typeof navigator.clipboard.writeText;

  beforeAll(() => {
    originalWriteText = navigator.clipboard.writeText;
  });

  beforeEach(() => {
    clearMocks();
    useLessonViewStore.setState({ content: 'lesson content' });
  });

  afterAll(() => {
    // nothing to restore
  });

  test('renders textarea and button', () => {
    const { getByPlaceholderText, getByText } = render(<AITab />);
    expect(getByPlaceholderText('Ask a question about this lesson...')).toBeInTheDocument();
    expect(getByText('Ask')).toBeInTheDocument();
  });

  test('button disabled when textarea empty', () => {
    const { getByText } = render(<AITab />);
    expect(getByText('Ask')).toBeDisabled();
  });

  test('copies prompt and opens browser on ask', async () => {
    let copiedText = '';
    Object.assign(navigator.clipboard, {
      writeText: (t: string) => {
        copiedText = t;
        return Promise.resolve();
      },
    });
    const { getByPlaceholderText, getByText } = render(<AITab />);
    const textarea = getByPlaceholderText('Ask a question about this lesson...');
    await user.type(textarea, 'What is X?');
    await user.click(getByText('Ask'));
    expect(copiedText).toContain('helpful tutor');
    expect(copiedText).toContain('What is X?');
    Object.assign(navigator.clipboard, { writeText: originalWriteText });
  });

  test('clears input after ask', async () => {
    Object.assign(navigator.clipboard, {
      writeText: () => Promise.resolve(),
    });
    const { getByPlaceholderText, getByText } = render(<AITab />);
    const textarea = getByPlaceholderText(
      'Ask a question about this lesson...',
    ) as HTMLTextAreaElement;
    await user.type(textarea, 'What is X?');
    await user.click(getByText('Ask'));
    expect(textarea.value).toBe('');
    Object.assign(navigator.clipboard, { writeText: originalWriteText });
  });
});
