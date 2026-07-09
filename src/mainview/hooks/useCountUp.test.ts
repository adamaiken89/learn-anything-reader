import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';

import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  test('returns 0 for target 0', () => {
    const { result } = renderHook(() => useCountUp(0));
    expect(result.current).toBe(0);
  });

  test('starts at 0 for positive target', () => {
    const { result } = renderHook(() => useCountUp(100, 800));
    expect(result.current).toBe(0);
  });
});
