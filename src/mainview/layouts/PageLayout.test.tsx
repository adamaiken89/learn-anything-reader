import { render } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';

import PageLayout from './PageLayout';

describe('PageLayout', () => {
  test('renders children', () => {
    const { getByText } = render(
      <PageLayout>
        <span>child content</span>
      </PageLayout>,
    );
    expect(getByText('child content')).toBeInTheDocument();
  });

  test('has h-screen flex flex-col bg-gray-900 classes', () => {
    const { container } = render(<PageLayout>content</PageLayout>);
    const div = container.querySelector('div');
    expect(div!.className).toContain('h-screen');
    expect(div!.className).toContain('flex');
    expect(div!.className).toContain('flex-col');
    expect(div!.className).toContain('bg-gray-900');
  });

  test('merges custom className', () => {
    const { container } = render(<PageLayout className="extra">content</PageLayout>);
    const div = container.querySelector('div');
    expect(div!.className).toContain('extra');
    expect(div!.className).toContain('bg-gray-900');
  });
});
