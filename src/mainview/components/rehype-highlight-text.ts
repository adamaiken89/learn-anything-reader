import type { Highlight } from './sidebar-types';

export const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#facc15',
  green: '#4ade80',
  blue: '#60a5fa',
  pink: '#f472b6',
};

function splitText(text: string, highlights: Highlight[]): any[] {
  for (const h of highlights) {
    const idx = text.indexOf(h.selectedText);
    if (idx === -1) continue;

    const nodes: any[] = [];
    if (idx > 0) nodes.push(...splitText(text.slice(0, idx), highlights));
    nodes.push({
      type: 'element',
      tagName: 'mark',
      properties: {
        style: `background-color: ${HIGHLIGHT_COLORS[h.color] || h.color}; color: #1f2937; border-radius: 2px; padding: 0 2px`,
        dataHighlightId: h.id,
      },
      children: [{ type: 'text', value: h.selectedText }],
    });
    const remaining = text.slice(idx + h.selectedText.length);
    if (remaining) nodes.push(...splitText(remaining, highlights));
    return nodes;
  }
  return [{ type: 'text', value: text }];
}

function transformTree(node: any, highlights: Highlight[], skip = false): void {
  if (!node.children) return;

  const newChildren: any[] = [];
  for (const child of node.children) {
    if (child.type === 'text' && typeof child.value === 'string' && !skip) {
      const parts = splitText(child.value, highlights);
      newChildren.push(...parts);
    } else {
      const deeper =
        skip || child.tagName === 'mark' || child.tagName === 'pre' || child.tagName === 'code';
      transformTree(child, highlights, deeper);
      newChildren.push(child);
    }
  }
  node.children = newChildren;
}

export function rehypeHighlightText(highlights: Highlight[]) {
  return (tree: any) => {
    if (highlights.length === 0) return;
    transformTree(tree, highlights);
  };
}
