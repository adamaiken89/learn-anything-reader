type HastText = { type: 'text'; value: string };
type HastElement = {
  type: 'element';
  tagName: string;
  properties?: Record<string, string>;
  children: HastNode[];
};
type HastNode = HastText | HastElement | { type: string; [key: string]: unknown };

const SEARCH_HIGHLIGHT_COLOR = '#f97316';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitText(text: string, query: string, caseSensitive: boolean): HastNode[] {
  const escaped = escapeRegExp(query);
  const regex = new RegExp(`(${escaped})`, caseSensitive ? 'g' : 'gi');
  const parts = text.split(regex);
  if (parts.length <= 1) return [{ type: 'text', value: text }];

  const compare = caseSensitive
    ? (p: string) => p === query
    : (p: string) => p.toLowerCase() === query.toLowerCase();

  return parts.map((part) => {
    if (compare(part)) {
      return {
        type: 'element',
        tagName: 'mark',
        properties: {
          'data-search-match': '',
          style: `background-color: ${SEARCH_HIGHLIGHT_COLOR}33; border: 2px solid ${SEARCH_HIGHLIGHT_COLOR}; border-radius: 2px; padding: 0 1px; color: inherit;`,
        },
        children: [{ type: 'text', value: part }],
      };
    }
    return { type: 'text', value: part };
  });
}

function transformTree(
  node: HastElement,
  query: string,
  caseSensitive: boolean,
  skip = false,
): void {
  if (!node?.children || !Array.isArray(node.children)) return;

  const newChildren: HastNode[] = [];
  for (const child of node.children) {
    if (child == null || typeof child !== 'object') {
      newChildren.push(child);
      continue;
    }
    if (child.type === 'text' && 'value' in child && typeof child.value === 'string' && !skip) {
      const parts = splitText(child.value, query, caseSensitive);
      newChildren.push(...parts);
    } else {
      const deeper =
        skip ||
        (child as HastElement).tagName === 'mark' ||
        (child as HastElement).tagName === 'pre' ||
        (child as HastElement).tagName === 'code' ||
        (child as HastElement).tagName === 'svg' ||
        (child as HastElement).tagName === 'math';
      if ('children' in child && child.children != null) {
        transformTree(child as HastElement, query, caseSensitive, deeper);
      }
      newChildren.push(child);
    }
  }
  node.children = newChildren;
}

export function rehypeSearchText(query: string, caseSensitive = false) {
  const q = query.trim();
  if (!q) return () => {};
  return (tree: HastNode) => {
    if (tree && typeof tree === 'object' && 'children' in tree) {
      transformTree(tree as HastElement, q, caseSensitive);
    }
  };
}
