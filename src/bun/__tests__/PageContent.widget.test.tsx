import { describe, expect, test } from 'bun:test';
import { render, act } from '@testing-library/react';
import PageContent from '../../mainview/layouts/PageContent';

describe('PageContent', () => {
  test('renders as flex column container', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<PageContent>content</PageContent>));
    });
    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    expect(main!.className).toContain('flex');
    expect(main!.className).toContain('flex-col');
  });

  test('renders overflow-y-auto for scrolling', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<PageContent>content</PageContent>));
    });
    const main = container.querySelector('main');
    expect(main!.className).toContain('overflow-y-auto');
  });

  test('applies custom className', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<PageContent className="px-0 py-0">content</PageContent>));
    });
    const main = container.querySelector('main');
    expect(main!.className).toContain('px-0');
    expect(main!.className).toContain('py-0');
  });

  test('wraps children inside main', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(
        <PageContent>
          <div data-testid="child">hello</div>
        </PageContent>,
      ));
    });
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
  });
});
