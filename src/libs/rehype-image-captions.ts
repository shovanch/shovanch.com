import type { Element, Parent } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to convert images with meaningful alt text to figures with captions
 */
export const rehypeImageCaptions: Plugin = () => {
  return (tree) => {
    visit(
      tree,
      'element',
      (node: Element, index: number | null, parent: Parent | null) => {
        // Only process img elements
        if (node.tagName !== 'img') return;

        // Get alt text
        const altText = node.properties?.alt;
        const imageSrc = node.properties?.src;
        if (!altText || typeof altText !== 'string') return;

        // Check for caption marker first (from processObsidianMarkdown)
        if (altText.startsWith('🎯')) {
          const captionText = altText.substring(2).trim();

          if (captionText) {
            // Create figure element
            const figure: Element = {
              type: 'element',
              tagName: 'figure',
              properties: {
                className: ['obsidian-image'],
              },
              children: [
                {
                  ...node,
                  properties: {
                    ...node.properties,
                    alt: captionText,
                  },
                },
                {
                  type: 'element',
                  tagName: 'figcaption',
                  properties: {},
                  children: [
                    {
                      type: 'text',
                      value: captionText,
                    },
                  ],
                },
              ],
            };

            // Replace the image with the figure
            if (parent && typeof index === 'number') {
              parent.children[index] = figure;
            }
          }
          return; // Early return if we processed the marker
        }

        // Fallback: Check if alt text is meaningful (not filename-like)
        if (imageSrc && typeof imageSrc === 'string') {
          // Extract filename from path for comparison - handle both regular paths and Astro optimized URLs
          let filename = '';
          if (imageSrc.includes('/_image?href=')) {
            // Extract from Astro optimized URL - decode the href parameter
            try {
              const urlParams = new URLSearchParams(imageSrc.split('?')[1]);
              const hrefParam = urlParams.get('href');
              if (hrefParam) {
                const decodedPath = decodeURIComponent(hrefParam);
                filename =
                  decodedPath
                    .split('/')
                    .pop()
                    ?.replace(/\.[^.]*$/, '') || '';
              }
            } catch (e) {
              // Fallback to empty string if URL parsing fails
              filename = '';
            }
          } else if (imageSrc.includes('/_astro/')) {
            // Handle Astro optimized images like /_astro/image-1.6IR3iDzl_15Jr6.webp
            // Extract the original filename from the optimized name
            const astroFilename = imageSrc.split('/').pop() || '';
            // Try to extract original name from pattern like "image-1.6IR3iDzl_15Jr6.webp"
            const match = astroFilename.match(/^([^.]+)/);
            filename = match ? match[1] : '';
          } else {
            // Regular image path
            filename =
              imageSrc
                .split('/')
                .pop()
                ?.replace(/\.[^.]*$/, '') || '';
          }

          // Check if alt text contains image extensions (indicates it's a default/automatic caption)
          const hasImageExtension =
            /\.(png|jpe?g|gif|webp|svg|avif|bmp|tiff?)$/i.test(altText.trim());

          // If alt text is meaningful (not filename-like), convert to figure with caption
          if (
            altText &&
            altText.trim() !== filename &&
            altText.trim() !== '' &&
            !hasImageExtension
          ) {
            // Create figure element
            const figure: Element = {
              type: 'element',
              tagName: 'figure',
              properties: {
                className: ['obsidian-image'],
              },
              children: [
                {
                  ...node,
                  properties: {
                    ...node.properties,
                    alt: altText,
                  },
                },
                {
                  type: 'element',
                  tagName: 'figcaption',
                  properties: {},
                  children: [
                    {
                      type: 'text',
                      value: altText,
                    },
                  ],
                },
              ],
            };

            // Replace the image with the figure
            if (parent && typeof index === 'number') {
              parent.children[index] = figure;
            }
          }
        }
      },
    );
  };
};
