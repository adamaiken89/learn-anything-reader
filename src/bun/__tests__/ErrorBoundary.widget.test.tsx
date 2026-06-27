import { describe, expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '../../mainview/components/ErrorBoundary';

function GoodChild() {
  return <div>All good</div>;
}

function BadChild(): React.ReactNode {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  test('renders children when no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(container.textContent).toContain('All good');
  });

  test('renders fallback on error', () => {
    const err = console.error;
    console.error = () => {};
    const { container } = render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>,
    );
    expect(container.textContent).toContain('Something went wrong');
    console.error = err;
  });

  test('renders custom fallback', () => {
    const err = console.error;
    console.error = () => {};
    const { container } = render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <BadChild />
      </ErrorBoundary>,
    );
    expect(container.textContent).toContain('Custom error');
    console.error = err;
  });
});
