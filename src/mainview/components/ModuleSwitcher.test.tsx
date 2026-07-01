import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, mock, test } from 'bun:test';

import ModuleSwitcher from './ModuleSwitcher';

const mockModules = [
  { id: '01', name: 'Algebra', timeHours: 2, topics: ['equations'], prerequisites: [] },
  { id: '02', name: 'Geometry', timeHours: 3, topics: ['shapes', 'angles'], prerequisites: [] },
];

describe('ModuleSwitcher', () => {
  const user = userEvent.setup();

  test('renders trigger with current module', () => {
    const { getByText } = render(
      <ModuleSwitcher modules={mockModules} currentModuleId="01" onSelect={() => {}} />,
    );
    expect(getByText('01 Algebra')).toBeInTheDocument();
  });

  test('opens dropdown on click and shows modules', async () => {
    const { getByText, container } = render(
      <ModuleSwitcher modules={mockModules} currentModuleId="01" onSelect={() => {}} />,
    );
    await user.click(getByText('01 Algebra'));
    expect(container.querySelector('.anim-dropdown-in')).toBeTruthy();
    const items = container.querySelectorAll('.ring-1');
    expect(items.length).toBe(1);
  });

  test('selects module from dropdown', async () => {
    const onSelect = mock(() => {});
    const { getByText, container } = render(
      <ModuleSwitcher modules={mockModules} currentModuleId="01" onSelect={onSelect} />,
    );
    await user.click(getByText('01 Algebra'));
    const geometryBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Geometry'),
    );
    expect(geometryBtn).toBeTruthy();
    await user.click(geometryBtn!);
    expect(onSelect).toHaveBeenCalledWith(mockModules[1]);
  });

  test('closes dropdown on outside click', async () => {
    const { getByText, container } = render(
      <ModuleSwitcher modules={mockModules} currentModuleId="01" onSelect={() => {}} />,
    );
    await user.click(getByText('01 Algebra'));
    expect(container.querySelector('.anim-dropdown-in')).toBeTruthy();
    await user.click(document.body);
    expect(container.querySelector('.anim-dropdown-in')).toBeNull();
  });

  test('empty modules shows fallback text', () => {
    const { getByText } = render(
      <ModuleSwitcher modules={[]} currentModuleId="" onSelect={() => {}} />,
    );
    expect(getByText('Modules')).toBeInTheDocument();
  });
});
