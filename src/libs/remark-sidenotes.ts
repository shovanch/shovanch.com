import type { Blockquote, Root } from 'mdast';
import { visit } from 'unist-util-visit';

type HastData = {
  hName?: string;
  hProperties?: Record<string, string>;
};

/**
 * Remark plugin that transforms Obsidian-style callouts into sidenotes.
 *
 * Syntax:
 * > [!sidenote]
 * > Your sidenote content here.
 *
 * Transforms into an aside element with class "sidenote".
 */
export function remarkSidenotes() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;

      // Check if this blockquote starts with [!sidenote]
      const firstChild = node.children[0];
      if (firstChild?.type !== 'paragraph') return;

      const firstInlineChild = firstChild.children[0];
      if (firstInlineChild?.type !== 'text') return;

      const text = firstInlineChild.value;
      const sidenoteMatch = text.match(/^\[!sidenote\]\s*/i);
      if (!sidenoteMatch) return;

      // Remove the [!sidenote] marker from the text
      firstInlineChild.value = text.slice(sidenoteMatch[0].length);

      // If the first text node is now empty, remove it
      if (firstInlineChild.value === '') {
        firstChild.children.shift();
      }

      // If the first paragraph is now empty, remove it
      if (firstChild.children.length === 0) {
        node.children.shift();
      }

      // Transform the blockquote into an aside element
      // We use hProperties to add the class, which rehype will pick up
      const data = (node.data ??= {}) as HastData;
      data.hName = 'aside';
      data.hProperties = { className: 'sidenote' };
    });
  };
}
