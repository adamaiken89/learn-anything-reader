import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { useViewStore } from '../stores/viewStore';

describe('BackToCourseList', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    useViewStore.setState(useViewStore.getInitialState());
  });

  test('renders course reader button', async () => {
    const { default: BackToCourseList } = await import('./BackToCourseList');
    const { getByText } = render(<BackToCourseList />);
    expect(getByText('CourseReader')).toBeInTheDocument();
  });

  test('calls replace with courseList on click', async () => {
    const replace = mock(() => {});
    useViewStore.setState({ replace } as Partial<ReturnType<typeof useViewStore.getState>>);
    const { default: BackToCourseList } = await import('./BackToCourseList');
    const { getByText } = render(<BackToCourseList />);
    await user.click(getByText('CourseReader'));
    expect(replace).toHaveBeenCalledWith({ type: 'courseList' });
  });
});
