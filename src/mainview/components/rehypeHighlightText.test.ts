import { describe, expect, test } from 'bun:test';

import type { Highlight } from '../../bun/types';
import type { HastElement, HastNode, HastRoot } from './rehypeHighlightText';
import { rehypeHighlightText } from './rehypeHighlightText';
function mkHighlight(id: string, text: string, color: string): Highlight {
  return {
    id,
    courseID: 'test',
    moduleID: '01',
    selectedText: text,
    startOffset: 0,
    endOffset: 0,
    color,
    createdAt: new Date().toISOString(),
  };
}

function mkOffsetHighlight(
  id: string,
  text: string,
  startOffset: number,
  endOffset: number,
  color: string,
): Highlight {
  return {
    id,
    courseID: 'test',
    moduleID: '01',
    selectedText: text,
    startOffset,
    endOffset,
    color,
    createdAt: new Date().toISOString(),
  };
}

function textNode(value: string) {
  return { type: 'text' as const, value };
}

function element(
  tagName: string,
  children: HastNode[],
  props?: Record<string, string>,
): HastElement {
  return { type: 'element' as const, tagName, children, properties: props };
}

function rootNode(children: HastNode[]): HastRoot {
  return { type: 'root' as const, children };
}

function asEl(node: HastNode): HastElement {
  return node as HastElement;
}

function textVal(node: HastNode): string {
  return (node as { value: string }).value;
}

function callPlugin(tree: HastRoot, highlights: Highlight[]) {
  const fn = rehypeHighlightText(highlights);
  fn(tree);
}

describe('rehypeHighlightText', () => {
  test('no highlights leaves tree unchanged', () => {
    const tree = rootNode([element('p', [textNode('Hello world')])]);
    callPlugin(tree, []);
    expect(textVal(asEl(tree.children[0]).children[0])).toBe('Hello world');
  });

  test('highlights matching text wraps in mark', () => {
    const tree = rootNode([element('p', [textNode('Hello world')])]);
    callPlugin(tree, [mkHighlight('1', 'world', 'yellow')]);
    const pChildren = asEl(tree.children[0]).children;
    expect(pChildren.length).toBe(2);
    expect(textVal(pChildren[0])).toBe('Hello ');
    expect(asEl(pChildren[1]).tagName).toBe('mark');
    expect(textVal(asEl(pChildren[1]).children[0])).toBe('world');
  });

  test('highlight with no match leaves text unchanged', () => {
    const tree = rootNode([element('p', [textNode('Hello world')])]);
    callPlugin(tree, [mkHighlight('1', 'nomatch', 'blue')]);
    expect(textVal(asEl(tree.children[0]).children[0])).toBe('Hello world');
  });

  test('highlights inside code blocks', () => {
    const tree = rootNode([element('pre', [element('code', [textNode('code here')])])]);
    callPlugin(tree, [mkOffsetHighlight('1', 'code', 0, 4, 'yellow')]);
    const code = asEl(asEl(tree.children[0]).children[0]);
    const first = code.children[0];
    expect(first.type).toBe('element');
    expect((first as HastElement).tagName).toBe('mark');
    expect(textVal((first as HastElement).children[0])).toBe('code');
  });

  test('skips mermaid code blocks in offset mode', () => {
    const tree = rootNode([
      element('p', [textNode('before')]),
      element('pre', [
        element('code', [textNode('graph TD\nCA-->CB')], { className: 'language-mermaid' }),
      ]),
      element('p', [textNode('after')]),
    ]);
    // Without mermaid skip, pos after 'before' (6) would advance past mermaid text (19 chars)
    //   making 'after' positioned at offset 25 (6+19). But DOM skips mermaid text,
    //   so user-observed offset for 'after' is 6.
    // With fix: mermaid text skipped, 'after' at offset 6.
    callPlugin(tree, [mkOffsetHighlight('1', 'after', 6, 11, 'yellow')]);
    // mermaid code unchanged
    const mermaid = asEl(asEl(tree.children[1]).children[0]);
    expect(mermaid.tagName).toBe('code');
    expect(mermaid.properties?.className).toBe('language-mermaid');
    expect(textVal(mermaid.children[0])).toBe('graph TD\nCA-->CB');
    // after paragraph highlighted
    const afterP = asEl(tree.children[2]).children;
    expect(afterP).toHaveLength(1);
    expect(asEl(afterP[0]).tagName).toBe('mark');
    expect(textVal(asEl(afterP[0]).children[0])).toBe('after');
  });

  test('skips mermaid code in text-based mode', () => {
    const tree = rootNode([
      element('p', [textNode('before')]),
      element('pre', [element('code', [textNode('graph TD')], { className: 'language-mermaid' })]),
      element('p', [textNode('after')]),
    ]);
    callPlugin(tree, [mkHighlight('1', 'after', 'yellow')]);
    const afterP = asEl(tree.children[2]).children;
    expect(afterP).toHaveLength(1);
    expect(asEl(afterP[0]).tagName).toBe('mark');
    expect(textVal(asEl(afterP[0]).children[0])).toBe('after');
  });

  test('regular code block still highlighted after mermaid', () => {
    const tree = rootNode([
      element('pre', [
        element('code', [textNode('var x = 1;')], { className: 'language-mermaid' }),
      ]),
      element('pre', [element('code', [textNode('var y = 2;')])]),
    ]);
    callPlugin(tree, [mkOffsetHighlight('1', 'var y = 2;', 0, 10, 'yellow')]);
    const regularCode = asEl(asEl(tree.children[1]).children[0]);
    expect(asEl(regularCode.children[0]).tagName).toBe('mark');
    expect(textVal(asEl(regularCode.children[0]).children[0])).toBe('var y = 2;');
  });

  test('multiple highlights in same text node', () => {
    const tree = rootNode([element('p', [textNode('Hello beautiful world')])]);
    callPlugin(tree, [mkHighlight('1', 'Hello', 'yellow'), mkHighlight('2', 'world', 'blue')]);
    const pChildren = asEl(tree.children[0]).children;
    expect(pChildren.length).toBeGreaterThanOrEqual(3);
  });

  test('handles empty tree gracefully', () => {
    const tree = rootNode([]);
    callPlugin(tree, [mkHighlight('1', 'test', 'yellow')]);
    expect(tree.children).toHaveLength(0);
  });

  test('handles tree with no children property', () => {
    const fn = rehypeHighlightText([mkHighlight('1', 'test', 'yellow')]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fn(null as any)).not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fn(undefined as any)).not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fn('string' as any)).not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fn(42 as any)).not.toThrow();
  });

  test('preserves existing mark elements', () => {
    const tree = rootNode([
      element('p', [element('mark', [textNode('existing')]), textNode(' test')]),
    ]);
    callPlugin(tree, [mkHighlight('1', 'test', 'yellow')]);
    const pChildren = asEl(tree.children[0]).children;
    expect(asEl(pChildren[0]).tagName).toBe('mark');
    expect(textVal(asEl(pChildren[0]).children[0])).toBe('existing');
  });

  test('nested elements recurse correctly', () => {
    const tree = rootNode([
      element('p', [element('strong', [textNode('bold text')]), textNode(' here')]),
    ]);
    callPlugin(tree, [mkHighlight('1', 'bold text', 'green')]);
    const strong = asEl(asEl(tree.children[0]).children[0]);
    expect(strong.tagName).toBe('strong');
    expect(strong.children.length).toBe(1);
    expect(asEl(strong.children[0]).tagName).toBe('mark');
  });

  test('highlight at start of text', () => {
    const tree = rootNode([element('p', [textNode('Hello world')])]);
    callPlugin(tree, [mkHighlight('1', 'Hello', 'yellow')]);
    const pChildren = asEl(tree.children[0]).children;
    expect(asEl(pChildren[0]).tagName).toBe('mark');
    expect(textVal(asEl(pChildren[0]).children[0])).toBe('Hello');
  });

  test('highlight at end of text', () => {
    const tree = rootNode([element('p', [textNode('Hello world')])]);
    callPlugin(tree, [mkHighlight('1', 'world', 'yellow')]);
    const pChildren = asEl(tree.children[0]).children;
    expect(asEl(pChildren[1]).tagName).toBe('mark');
    expect(textVal(asEl(pChildren[1]).children[0])).toBe('world');
  });

  describe('offset-based highlights', () => {
    test('highlights at exact offset within text node', () => {
      const tree = rootNode([element('p', [textNode('Hello beautiful world')])]);
      callPlugin(tree, [mkOffsetHighlight('1', 'beautiful', 6, 15, 'yellow')]);
      const p = asEl(tree.children[0]).children;
      expect(p).toHaveLength(3);
      expect(textVal(p[0])).toBe('Hello ');
      expect(asEl(p[1]).tagName).toBe('mark');
      expect(textVal(asEl(p[1]).children[0])).toBe('beautiful');
      expect(textVal(p[2])).toBe(' world');
    });

    test('highlight spanning multiple text nodes across elements', () => {
      const tree = rootNode([
        element('strong', [textNode('Hello')]),
        textNode(' beautiful '),
        element('em', [textNode('world')]),
      ]);
      callPlugin(tree, [mkOffsetHighlight('1', 'Hello beautiful world', 0, 21, 'blue')]);
      const strongMarks = asEl(tree.children[0]).children;
      expect(strongMarks).toHaveLength(1);
      expect(asEl(strongMarks[0]).tagName).toBe('mark');
      expect(textVal(asEl(strongMarks[0]).children[0])).toBe('Hello');
      const textMark = asEl(tree.children[1]);
      expect(textMark.tagName).toBe('mark');
      expect(textVal(textMark.children[0])).toBe(' beautiful ');
      const emMarks = asEl(tree.children[2]).children;
      expect(asEl(emMarks[0]).tagName).toBe('mark');
      expect(textVal(asEl(emMarks[0]).children[0])).toBe('world');
    });

    test('offset highlight at start of text', () => {
      const tree = rootNode([element('p', [textNode('Hello world')])]);
      callPlugin(tree, [mkOffsetHighlight('1', 'Hello', 0, 5, 'yellow')]);
      const p = asEl(tree.children[0]).children;
      expect(p).toHaveLength(2);
      expect(asEl(p[0]).tagName).toBe('mark');
      expect(textVal(asEl(p[0]).children[0])).toBe('Hello');
    });

    test('offset highlight in middle of text', () => {
      const tree = rootNode([element('p', [textNode('Hello big world')])]);
      callPlugin(tree, [mkOffsetHighlight('1', 'big', 6, 9, 'green')]);
      const p = asEl(tree.children[0]).children;
      expect(p).toHaveLength(3);
      expect(textVal(p[0])).toBe('Hello ');
      expect(asEl(p[1]).tagName).toBe('mark');
      expect(textVal(asEl(p[1]).children[0])).toBe('big');
      expect(textVal(p[2])).toBe(' world');
    });

    test('multiple offset highlights in same text node', () => {
      const tree = rootNode([element('p', [textNode('Hello beautiful world')])]);
      callPlugin(tree, [
        mkOffsetHighlight('1', 'Hello', 0, 5, 'yellow'),
        mkOffsetHighlight('2', 'world', 16, 21, 'blue'),
      ]);
      const p = asEl(tree.children[0]).children;
      expect(p).toHaveLength(3);
      const p0 = asEl(p[0]);
      const p2 = asEl(p[2]);
      expect(p0.tagName).toBe('mark');
      expect(textVal(p0.children[0])).toBe('Hello');
      expect(textVal(p[1])).toBe(' beautiful ');
      expect(p2.tagName).toBe('mark');
      expect(textVal(p2.children[0])).toBe('world');
    });

    test('offset highlight with no match does nothing', () => {
      const tree = rootNode([element('p', [textNode('Hello')])]);
      callPlugin(tree, [mkOffsetHighlight('1', 'nope', 100, 105, 'yellow')]);
      expect(textVal(asEl(tree.children[0]).children[0])).toBe('Hello');
    });
  });
});
