import { describe, expect, test, afterEach } from 'bun:test';
import { render, waitFor } from '@testing-library/react';
import LessonSection, {
  parseLessonMeta,
  parseH1,
  stripMetaLines,
} from '../../mainview/sections/LessonSection';
import { mockFetch, restoreFetch } from './mock-fetch';

const mockContent = `# Introduction

Welcome to the lesson.

## Chapter 1

First chapter content.

### Section 1.1

Details here.

## Chapter 2

Second chapter.`;

const defaultProps = {
  courseId: 'test',
  courseName: 'Test Course',
  module: { id: 1, name: 'Intro Module', timeHours: 2, prerequisites: [], topics: [] },
  content: '',
  loading: true,
  sections: [],
  visibleSection: null,
  isCompleted: false,
  contentRef: { current: null } as unknown as React.RefObject<HTMLDivElement>,
  scrollToSection: () => {},
  handleScroll: () => {},
  handleToggleCompleted: async () => {},
  bookmarks: [],
  highlights: [],
  addHighlight: async () => {},
  onToggleBookmark: async () => {},
  showTools: false,
  showPomodoro: false,
  setShowTools: () => {},
  showSections: false,
  onToggleSections: () => {},
};

afterEach(restoreFetch);

function mockAll(opts?: { content?: string }) {
  mockFetch({
    '/api/storage/bookmarks/module': [],
    '/api/storage/highlights': [],
    '/lesson': opts?.content ? { content: opts.content } : { content: '' },
    '/sections': [],
    '/notes': [],
  });
}

describe('LessonSection snapshots', () => {
  test('loading state', () => {
    mockAll();
    const { container } = render(<LessonSection {...defaultProps} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  test('content loaded', async () => {
    mockAll({ content: mockContent });
    const { container } = render(
      <LessonSection {...defaultProps} loading={false} content={mockContent} />,
    );
    await waitFor(() => expect(container.textContent).toContain('Introduction'));
    expect(container.innerHTML).toMatchSnapshot();
  });
});

describe('parseLessonMeta', () => {
  test('parses study time and language', () => {
    const md = `# Module 1\n\nEst. study time: 2h\nLanguage: en\n\n## Section`;
    const meta = parseLessonMeta(md);
    expect(meta).toEqual([
      { key: 'est. study time', icon: '⏱', label: 'Study Time', value: '2h' },
      { key: 'language', icon: '🌐', label: 'Language', value: 'en' },
    ]);
  });

  test('parses description and framework', () => {
    const md = `# Module 2\n\nEst. study time: 2.5h\nLanguage: en\nDescription: A deep dive\nFramework: TypeScript\n\n## Next`;
    const meta = parseLessonMeta(md);
    expect(meta).toHaveLength(4);
    expect(meta[2]).toEqual({
      key: 'description',
      icon: '📝',
      label: 'Description',
      value: 'A deep dive',
    });
    expect(meta[3]).toEqual({
      key: 'framework',
      icon: '🔧',
      label: 'Framework',
      value: 'TypeScript',
    });
  });

  test('returns empty for no metadata', () => {
    const md = `# Module\n\n## Section\n\nContent here.`;
    expect(parseLessonMeta(md)).toEqual([]);
  });

  test('stops at first ## heading', () => {
    const md = `# Module\n\nEst. study time: 1h\n\n## Section\n\nLanguage: en`;
    const meta = parseLessonMeta(md);
    expect(meta).toHaveLength(1);
    expect(meta[0].key).toBe('est. study time');
  });

  test('ignores unknown fields', () => {
    const md = `# Module\n\nEst. study time: 3h\nDifficulty: hard\n\n## Section`;
    const meta = parseLessonMeta(md);
    expect(meta).toHaveLength(1);
    expect(meta[0].key).toBe('est. study time');
  });

  test('handles blank lines between H1 and metadata', () => {
    const md = `# Module\n\n\nEst. study time: 2h\nLanguage: zh\n\n## Next`;
    const meta = parseLessonMeta(md);
    expect(meta).toHaveLength(2);
  });
});

describe('stripMetaLines', () => {
  test('removes H1 and metadata, keeps rest', () => {
    const md = `# Module 1\n\nEst. study time: 2h\nLanguage: en\n\n## Section\n\nContent`;
    const stripped = stripMetaLines(md);
    expect(stripped).toBe(`## Section\n\nContent`);
  });

  test('strips trailing blank lines after meta', () => {
    const md = `# Title\n\nEst. study time: 1h\n\n\n\n## Body`;
    const stripped = stripMetaLines(md);
    expect(stripped).toBe(`## Body`);
  });

  test('returns original when no metadata found', () => {
    const md = `# Title\n\n## Section\n\nContent`;
    expect(stripMetaLines(md)).toBe(md);
  });

  test('removes H1 when no metadata but meta present', () => {
    const md = `# Title\n\nEst. study time: 2h\nLanguage: en`;
    const stripped = stripMetaLines(md);
    expect(stripped).toBe('');
  });

  test('handles only description field', () => {
    const md = `# Title\n\nDescription: Foo bar\n\n## Next`;
    const stripped = stripMetaLines(md);
    expect(stripped).toBe(`## Next`);
  });
});

describe('parseH1', () => {
  test('extracts heading text', () => {
    expect(parseH1('# Module 1: React Overview')).toBe('Module 1: React Overview');
  });

  test('returns empty when no H1', () => {
    expect(parseH1('## Section\n\nContent')).toBe('');
  });

  test('ignores deeper headings', () => {
    expect(parseH1('## Not H1\n### Also not')).toBe('');
  });
});
