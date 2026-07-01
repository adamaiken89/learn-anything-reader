import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, mock, test } from 'bun:test';

import { ColorPickerRow } from './ColorPickerRow';

describe('ColorPickerRow', () => {
  const user = userEvent.setup();

  test('renders color buttons excluding note', () => {
    const { container } = render(<ColorPickerRow onSelectColor={() => {}} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('button[title="note"]')).toBeNull();
  });

  test('clicking inactive color calls onSelectColor', async () => {
    const onSelectColor = mock(() => {});
    const { container } = render(<ColorPickerRow onSelectColor={onSelectColor} />);
    const btn = container.querySelector('button[title="yellow"]')!;
    await user.click(btn);
    expect(onSelectColor).toHaveBeenCalledWith('yellow');
  });

  test('clicking active color calls onDeleteHighlight', async () => {
    const onDeleteHighlight = mock(() => {});
    const { container } = render(
      <ColorPickerRow
        activeHighlightColor="yellow"
        onSelectColor={() => {}}
        onDeleteHighlight={onDeleteHighlight}
      />,
    );
    const btn = container.querySelector('button[title="yellow"]')!;
    await user.click(btn);
    expect(onDeleteHighlight).toHaveBeenCalledTimes(1);
  });

  test('active color button shows scale class', () => {
    const { container } = render(
      <ColorPickerRow activeHighlightColor="yellow" onSelectColor={() => {}} />,
    );
    const btn = container.querySelector('button[title="yellow"]')!;
    expect(btn.className).toContain('scale-125');
  });
});
