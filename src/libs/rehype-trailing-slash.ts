/**
 * Rehype plugin to add trailing slashes to internal links
 * Ensures consistency with Astro's trailingSlash: 'always' config
 */
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypeTrailingSlash() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;

      const href = node.properties?.href;
      if (typeof href !== 'string') return;

      // Skip external links, anchors, mailto, tel, and already-slashed paths
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.endsWith('/') ||
        href.includes('.')  // Skip files like /file.pdf, /image.png
      ) {
        return;
      }

      // Add trailing slash to internal links
      // Handle links with anchors: /about#section -> /about/#section
      const [path, hash] = href.split('#');
      node.properties.href = hash ? `${path}/#${hash}` : `${path}/`;
    });
  };
}
