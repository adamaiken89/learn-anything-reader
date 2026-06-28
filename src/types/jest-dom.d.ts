import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

type JestDomMatchers = TestingLibraryMatchers<unknown, void>;

declare module 'bun:test' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Matchers<T> extends JestDomMatchers {}
}
