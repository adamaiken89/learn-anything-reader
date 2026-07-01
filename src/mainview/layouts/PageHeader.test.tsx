import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { useSettingsStore } from '../stores/settingsStore';
import { useViewStore } from '../stores/viewStore';

describe('PageHeader', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    useViewStore.setState(useViewStore.getInitialState());
    useSettingsStore.setState(useSettingsStore.getInitialState());
  });

  test('renders title when provided', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader title="My Page" />);
    expect(getByText('My Page')).toBeInTheDocument();
  });

  test('renders back button with default label when onBack provided', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader onBack={() => {}} />);
    expect(getByText('← Back')).toBeInTheDocument();
  });

  test('renders custom backLabel', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader onBack={() => {}} backLabel="Go Back" />);
    expect(getByText('Go Back')).toBeInTheDocument();
  });

  test('renders CourseReader button', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader />);
    expect(getByText('CourseReader')).toBeInTheDocument();
  });

  test('renders bookmarks and settings buttons when no actions and not hidden', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader />);
    expect(getByText('Bookmarks')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();
  });

  test('hides default actions when hideHeaderActions', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { queryByText } = render(<PageHeader hideHeaderActions />);
    expect(queryByText('Bookmarks')).toBeNull();
    expect(queryByText('Settings')).toBeNull();
  });

  test('hides default actions when actions prop provided', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { queryByText } = render(<PageHeader actions={<button>Custom</button>} />);
    expect(queryByText('Bookmarks')).toBeNull();
    expect(queryByText('Settings')).toBeNull();
  });

  test('renders custom actions instead of defaults', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText, queryByText } = render(
      <PageHeader actions={<button>Custom Action</button>} />,
    );
    expect(getByText('Custom Action')).toBeInTheDocument();
    expect(queryByText('Bookmarks')).toBeNull();
  });

  test('renders center content', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader center={<span>Center Piece</span>} />);
    expect(getByText('Center Piece')).toBeInTheDocument();
  });

  test('clicking bookmarks pushes bookmarks view', async () => {
    const push = mock(() => {});
    useViewStore.setState({ push } as Partial<ReturnType<typeof useViewStore.getState>>);
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader />);
    await user.click(getByText('Bookmarks'));
    expect(push).toHaveBeenCalledWith({ type: 'bookmarks' });
  });

  test('clicking settings pushes settings view', async () => {
    const push = mock(() => {});
    useViewStore.setState({ push } as Partial<ReturnType<typeof useViewStore.getState>>);
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader />);
    await user.click(getByText('Settings'));
    expect(push).toHaveBeenCalledWith({ type: 'settings' });
  });

  test('clicking back calls onBack', async () => {
    const onBack = mock(() => {});
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader onBack={onBack} />);
    await user.click(getByText('← Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('renders toolbar when provided', async () => {
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader toolbar={<div>Toolbar</div>} />);
    expect(getByText('Toolbar')).toBeInTheDocument();
  });

  test('hides entire header in focus mode', async () => {
    useSettingsStore.setState({ focusMode: true } as Partial<
      ReturnType<typeof useSettingsStore.getState>
    >);
    const { default: PageHeader } = await import('./PageHeader');
    const { queryByText } = render(<PageHeader title="Should Hide" />);
    expect(queryByText('Should Hide')).toBeNull();
    expect(queryByText('CourseReader')).toBeNull();
  });

  test('still shows toolbar in focus mode', async () => {
    useSettingsStore.setState({ focusMode: true } as Partial<
      ReturnType<typeof useSettingsStore.getState>
    >);
    const { default: PageHeader } = await import('./PageHeader');
    const { getByText } = render(<PageHeader toolbar={<div>Toolbar Visible</div>} />);
    expect(getByText('Toolbar Visible')).toBeInTheDocument();
  });
});
