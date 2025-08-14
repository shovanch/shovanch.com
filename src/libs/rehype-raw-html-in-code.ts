import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypeRawHtmlInCode() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      // Target inline code elements
      if (node.tagName === 'code' && !node.properties?.className) {
        // Process text children
        if (node.children && node.children.length > 0) {
          node.children = node.children.map((child) => {
            if (child.type === 'text') {
              // Replace HTML entities with their actual characters
              child.value = child.value
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
            }
            return child;
          });
        }
      }
    });
  };
}
