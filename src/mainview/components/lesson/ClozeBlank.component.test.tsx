import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'bun:test';

import ClozeBlank from './ClozeBlank';

describe('ClozeBlank', () => {
  const user = userEvent.setup();

  test('renders text input without reveal button initially', () => {
    const { getByPlaceholderText, queryByText } = render(<ClozeBlank answer="discount" />);
    expect(getByPlaceholderText('Type your answer...')).toBeInTheDocument();
    expect(queryByText('Reveal')).toBeNull();
  });

  test('does not show reveal button when input is empty', () => {
    const { queryByText } = render(<ClozeBlank answer="discount" />);
    expect(queryByText('Reveal')).toBeNull();
  });

  test('shows reveal button after typing', async () => {
    const { getByPlaceholderText, getByText } = render(<ClozeBlank answer="discount" />);
    await user.type(getByPlaceholderText('Type your answer...'), 'disc');
    expect(getByText('Reveal')).toBeInTheDocument();
  });

  test('shows correct answer after reveal with correct input', async () => {
    const { getByPlaceholderText, getByText, queryByPlaceholderText } = render(
      <ClozeBlank answer="discount" />,
    );
    await user.type(getByPlaceholderText('Type your answer...'), 'discount');
    await user.click(getByText('Reveal'));
    expect(queryByPlaceholderText('Type your answer...')).toBeNull();
    expect(getByText('discount')).toBeInTheDocument();
  });

  test('shows incorrect feedback when answer is wrong', async () => {
    const { getByPlaceholderText, getByText } = render(<ClozeBlank answer="discount" />);
    await user.type(getByPlaceholderText('Type your answer...'), 'wrong');
    await user.click(getByText('Reveal'));
    expect(getByText('discount')).toBeInTheDocument();
  });
});
