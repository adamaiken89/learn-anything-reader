import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'bun:test';

import { useSettingsStore } from '../../stores/settingsStore';
import { useViewStore } from '../../stores/viewStore';
import AppearancePopover from './AppearancePopover';

beforeEach(() => {
  useSettingsStore.setState({
    fontSize: 16,
    theme: 'dark',
    contentWidth: 'standard',
    transitionStyle: 'none',
  });
  useViewStore.setState({ views: [] });
});

describe('AppearancePopover', () => {
  const user = userEvent.setup();

  test('renders trigger button', () => {
    const { getByRole } = render(<AppearancePopover />);
    expect(getByRole('button')).toBeInTheDocument();
  });

  test('opens popover on click', async () => {
    const { getByRole, getByText } = render(<AppearancePopover />);
    await user.click(getByRole('button'));
    expect(getByText(/fontSize|Font Size/i)).toBeInTheDocument();
  });

  test('closes popover on mousedown outside', async () => {
    const { getByRole, getByText, queryByText } = render(<AppearancePopover />);
    await user.click(getByRole('button'));
    expect(getByText(/fontSize|Font Size/i)).toBeInTheDocument();
    await user.click(document.body);
    expect(queryByText(/fontSize|Font Size/i)).not.toBeInTheDocument();
  });

  test('font size controls update store', async () => {
    const { getByRole, getByText } = render(<AppearancePopover />);
    await user.click(getByRole('button'));
    const incBtn = getByText('A⁺');
    await user.click(incBtn);
    expect(useSettingsStore.getState().fontSize).toBe(18);
  });

  test('content width pills update store', async () => {
    const { getByRole, getByText } = render(<AppearancePopover />);
    await user.click(getByRole('button'));
    await user.click(getByText(/narrow/i));
    expect(useSettingsStore.getState().contentWidth).toBe('narrow');
  });

  test('theme grid — click updates store', async () => {
    const { getByRole, getAllByText } = render(<AppearancePopover />);
    await user.click(getByRole('button'));
    // "Dark" matches both "Dark" and "One Dark" — take first exact match
    const darkBtns = getAllByText(/^Dark$/);
    await user.click(darkBtns[0].closest('button')!);
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  test('transition pills update store', async () => {
    const { getByRole, getByText } = render(<AppearancePopover />);
    await user.click(getByRole('button'));
    await user.click(getByText(/slide/i));
    expect(useSettingsStore.getState().transitionStyle).toBe('slide');
  });

  test('settings link navigates to settings', async () => {
    useViewStore.setState({ views: [] });
    const { getByRole, getByText } = render(<AppearancePopover />);
    await user.click(getByRole('button'));
    await user.click(getByText(/moreInSettings|More in Settings/i));
    const views = useViewStore.getState().views;
    expect(views).toHaveLength(1);
    expect(views[0]).toEqual({ type: 'settings' });
  });
});
