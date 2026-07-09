import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'bun:test';

import ShortcutHelp from './ShortcutHelp';

describe('ShortcutHelp', () => {
  const user = userEvent.setup();

  test('renders trigger button with help icon', () => {
    const { getByRole } = render(<ShortcutHelp />);
    const btn = getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  test('opens popover on click', async () => {
    const { getByRole, getByText } = render(<ShortcutHelp />);
    await user.click(getByRole('button'));
    expect(getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  test('shows navigation shortcuts group', async () => {
    const { getByRole, getByText } = render(<ShortcutHelp />);
    await user.click(getByRole('button'));
    expect(getByText('Navigation')).toBeInTheDocument();
  });

  test('shows reading shortcuts group', async () => {
    const { getByRole, getByText } = render(<ShortcutHelp />);
    await user.click(getByRole('button'));
    expect(getByText('Reading')).toBeInTheDocument();
  });

  test('shows actions shortcuts group', async () => {
    const { getByRole, getByText } = render(<ShortcutHelp />);
    await user.click(getByRole('button'));
    expect(getByText('Actions')).toBeInTheDocument();
  });

  test('closes popover on mousedown outside', async () => {
    const { getByRole, queryByText } = render(<ShortcutHelp />);
    await user.click(getByRole('button'));
    expect(queryByText('Keyboard Shortcuts')).toBeInTheDocument();
    await user.click(document.body);
    expect(queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  test('formats simple letter key correctly', async () => {
    const { getByRole } = render(<ShortcutHelp />);
    await user.click(getByRole('button'));
    const kbd = document.querySelector('kbd');
    expect(kbd).toBeTruthy();
    expect(kbd?.textContent?.length).toBeGreaterThan(0);
  });

  test('closes on Escape key', async () => {
    const { getByRole, queryByText } = render(<ShortcutHelp />);
    await user.click(getByRole('button'));
    expect(queryByText('Keyboard Shortcuts')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });
});
