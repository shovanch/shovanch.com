import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to mark external links with a CSS class for styling
 * External links get target="_blank" and rel="noopener noreferrer" for security
 */
export const rehypeExternalLinks: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a' || !node.properties?.href) return;

      const href = String(node.properties.href);

      // External links start with http:// or https:// and are not on the same domain
      const isExternal =
        /^https?:\/\//.test(href) && !href.includes('shovanch.com');

      if (isExternal) {
        // Add class for styling
        const existingClass = node.properties.className;
        const classes = Array.isArray(existingClass)
          ? existingClass
          : existingClass
            ? [existingClass]
            : [];

        node.properties.className = [...classes, 'external-link'];

        // Add accessibility attributes
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
    });
  };
};
