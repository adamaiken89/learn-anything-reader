import { describe, expect, test } from 'bun:test';
import { render, fireEvent } from '@testing-library/react';
import { Button } from '../../mainview/components/ui/Button';
import '../../mainview/i18n';

describe('Button', () => {
  test('renders children', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.textContent).toContain('Click me');
  });

  test('applies variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('bg-indigo-600');
  });

  test('applies size classes', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('text-xs');
  });

  test('disabled state prevents click', () => {
    let clicked = false;
    const { container } = render(
      <Button
        disabled
        onClick={() => {
          clicked = true;
        }}
      >
        Disabled
      </Button>,
    );
    const btn = container.querySelector('button');
    fireEvent.click(btn!);
    expect(clicked).toBe(false);
    expect(btn?.disabled).toBe(true);
  });

  test('loading shows spinner', () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });
});
