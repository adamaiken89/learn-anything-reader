import { render } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';

import LessonContext, { useLessonContext } from './LessonContext';

function TestComponent() {
  const ctx = useLessonContext();
  return <div data-testid="ctx">{ctx.sections.length}</div>;
}

describe('LessonContext', () => {
  test('useLessonContext returns context value within provider', () => {
    const value = {
      contentRef: { current: null },
      scrollToSection: () => {},
      sections: [{ id: 's1', heading: 'S1', level: 2, parentID: null }],
      visibleSection: 's1',
      content: '# hello',
    };
    const { getByTestId } = render(
      <LessonContext.Provider value={value}>
        <TestComponent />
      </LessonContext.Provider>,
    );
    expect(getByTestId('ctx').textContent).toBe('1');
  });

  test('useLessonContext throws outside provider', () => {
    expect(() => render(<TestComponent />)).toThrow(
      'useLessonContext must be used within LessonContextProvider',
    );
  });
});
