import { render } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';

import { ErrorBoundary } from './ErrorBoundary';

const Throws = () => {
  throw new Error('test error');
};

describe('ErrorBoundary', () => {
  test('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    );
    expect(getByText('Hello')).toBeInTheDocument();
  });

  test('catches error and shows default fallback', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText('test error')).toBeInTheDocument();
  });

  test('renders custom fallback on error', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <Throws />
      </ErrorBoundary>,
    );
    expect(getByText('Custom Error UI')).toBeInTheDocument();
  });
});
