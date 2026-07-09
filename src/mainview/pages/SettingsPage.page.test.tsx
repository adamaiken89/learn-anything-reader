import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'bun:test';

import i18n from '../i18n';
import { useSettingsStore } from '../stores/settingsStore';
import { useSyncStore } from '../stores/syncStore';
import { clearMocks, mockResponse, setupRPC } from '../testUtils';

setupRPC();

import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    void i18n.changeLanguage('en-US');
    clearMocks();
    mockResponse('geminiHasKey', { hasKey: false });
    mockResponse('getSyncStatus', {
      lastSyncTime: null,
      lastSyncedCommit: null,
      isSyncing: false,
      remoteRepoURL: '',
      error: null,
    });
    useSettingsStore.setState({
      hasApiKey: false,
      focusMode: false,
      fontSize: 16,
      theme: 'dark',
      contentWidth: 'standard',
      locale: 'en-US',
    });
    useSyncStore.setState({
      lastSyncTime: null,
      lastSyncedCommit: null,
      isSyncing: false,
      remoteRepoURL: '',
      error: null,
    });
  });

  test('renders settings sections', async () => {
    const { container } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      expect(container.textContent).toContain('Gemini API Key');
    });
    expect(container.textContent).toContain('Remote Content');
    expect(container.textContent).toContain('Language');
    expect(container.textContent).toContain('Danger Zone');
    expect(container.textContent).toContain('About');
  });

  test('shows API key input field', async () => {
    const { container } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      expect(container.querySelector('input[type="password"]')).toBeTruthy();
    });
  });

  test('shows configured indicator when hasApiKey is true', async () => {
    useSettingsStore.setState({ hasApiKey: true });
    const { container } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      expect(container.textContent).toContain('configured');
    });
  });

  test('calls onBack when back button clicked', async () => {
    let called = false;
    let renderResult!: ReturnType<typeof render>;
    await act(async () => {
      renderResult = render(
        <SettingsPage
          onBack={() => {
            called = true;
          }}
        />,
      );
      await new Promise((r) => setTimeout(r, 0));
    });
    act(() => renderResult.getByText('← Back').click());
    expect(called).toBe(true);
  });

  test('clear data button shows confirm on first click', async () => {
    const { getByText } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      expect(getByText('Clear All Data')).toBeInTheDocument();
    });
    await user.click(getByText('Clear All Data'));
    expect(getByText('Are you sure? Click again to confirm.')).toBeInTheDocument();
  });

  test('saves API key when save clicked', async () => {
    mockResponse('geminiSetKey', {});
    const { container, getByText } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      expect(container.querySelector('input[type="password"]')).toBeTruthy();
    });
    const input = container.querySelector('input[type="password"]')!;
    await user.type(input, 'test-key-123');
    await user.click(getByText('Save'));
    await waitFor(() => {
      expect(getByText('Saved!')).toBeInTheDocument();
    });
  });

  test('selects language when locale button clicked', async () => {
    const { getByText } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      expect(getByText('繁體中文')).toBeInTheDocument();
    });
    await user.click(getByText('繁體中文'));
    expect(useSettingsStore.getState().locale).toBe('zh-TW');
  });

  test('shows sync error when present', async () => {
    useSyncStore.setState({ error: 'Repository not found' });
    const { container } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      expect(container.textContent).toContain('Repository not found');
    });
  });

  test('pre-fills repo URL from sync store', async () => {
    useSyncStore.setState({ remoteRepoURL: 'https://github.com/user/repo' });
    const { container } = render(<SettingsPage onBack={() => {}} />);
    await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="text"]');
      const urlInput = Array.from(inputs).find((i) =>
        i.getAttribute('placeholder')?.includes('github'),
      );
      expect(urlInput).toHaveValue('https://github.com/user/repo');
    });
  });
});
