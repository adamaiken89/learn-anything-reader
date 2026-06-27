import { describe, expect, test, afterEach } from 'bun:test';
import { render, waitFor, act } from '@testing-library/react';
import SettingsPage from '../../mainview/pages/SettingsPage';
import { mockFetch, restoreFetch } from './mock-fetch';

const defaultProps = { onBack: () => {} };

afterEach(restoreFetch);

describe('SettingsPage snapshots', () => {
  test('initial render (checking key status)', async () => {
    mockFetch({ '/gemini/key': { hasKey: false } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<SettingsPage {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('no API key configured', async () => {
    mockFetch({ '/gemini/key': { hasKey: false } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<SettingsPage {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(container.textContent).toContain('Gemini API'));
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('API key configured', async () => {
    mockFetch({ '/gemini/key': { hasKey: true } });
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<SettingsPage {...defaultProps} />));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(container.textContent).toContain('API key is configured'));
    expect(container.innerHTML).toMatchSnapshot();
  });
});
