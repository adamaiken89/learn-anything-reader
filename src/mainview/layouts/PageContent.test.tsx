import { render } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';

import PageContent from './PageContent';

describe('PageContent', () => {
  test('renders children', () => {
    const { getByText } = render(
      <PageContent>
        <p>hello world</p>
      </PageContent>,
    );
    expect(getByText('hello world')).toBeInTheDocument();
  });

  test('applies default classes', () => {
    const { container } = render(<PageContent>content</PageContent>);
    const main = container.querySelector('main');
    expect(main!.className).toContain('overflow-y-auto');
    expect(main!.className).toContain('flex-1');
    expect(main!.className).toContain('flex');
    expect(main!.className).toContain('flex-col');
  });

  test('merges custom className', () => {
    const { container } = render(<PageContent className="extra-class">content</PageContent>);
    const main = container.querySelector('main');
    expect(main!.className).toContain('extra-class');
    expect(main!.className).toContain('overflow-y-auto');
  });
});
