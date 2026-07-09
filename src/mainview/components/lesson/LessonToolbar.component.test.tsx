import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'bun:test';

import { useSettingsStore } from '../../stores/settingsStore';
import LessonToolbar from './LessonToolbar';

beforeEach(() => {
  useSettingsStore.setState({ focusMode: false });
});

describe('LessonToolbar', () => {
  test('returns null when focusMode is false', () => {
    const { container } = render(<LessonToolbar />);
    expect(container.innerHTML).toBe('');
  });

  test('renders toolbar when focusMode is true', () => {
    useSettingsStore.setState({ focusMode: true });
    const { getByTestId } = render(<LessonToolbar />);
    expect(getByTestId('lesson-toolbar')).toBeInTheDocument();
  });
});
