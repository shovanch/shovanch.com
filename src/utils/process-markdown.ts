// Process Obsidian markdown syntax for Astro
export function processObsidianMarkdown(
  content: string,
  slugMapping?: Map<string, string>,
): string {
  let processed = content;

  // Convert Obsidian image references ![[image.jpg]] or ![[image.jpg|alt text]] to figure with caption
  processed = processed.replace(
    /!\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,
    (_match, imageName, altText) => {
      const alt = altText || imageName;
      let imagePath: string;

      // Check if it's a pasted image from assets folder or already has assets/ path
      if (imageName.includes('Pasted image') || imageName.includes('assets/')) {
        const fileName = imageName.replace('assets/', '');
        imagePath = `/notes/assets/${fileName}`;
      } else {
        // For all other images, assume they're in the assets folder
        imagePath = `/notes/assets/${imageName}`;
      }

      // Check if caption contains image extensions (indicates it's a default/automatic caption)
      const hasImageExtension =
        altText &&
        /\.(png|jpe?g|gif|webp|svg|avif|bmp|tiff?)$/i.test(altText.trim());

      // If there's meaningful alt text (not filename-like), wrap in figure with caption
      if (
        altText &&
        altText.trim() !== imageName &&
        altText.trim() !== '' &&
        !hasImageExtension
      ) {
        return `<figure class="obsidian-image">
  <img src="${imagePath}" alt="${alt}" />
  <figcaption>${altText}</figcaption>
</figure>`;
      }

      // Otherwise, just return regular markdown image
      return `![${alt}](${imagePath})`;
    },
  );

  // Convert Obsidian wikilinks [[Page Name]], [[Page Name|Custom Text]], or [[Page Name#heading]]
  processed = processed.replace(
    /\[\[([^#|\]]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]/g,
    (_match, linkText, heading, customText) => {
      const displayText = customText || linkText;

      let slug: string;
      if (slugMapping && slugMapping.has(linkText)) {
        // Use the actual slug from the mapping
        slug = slugMapping.get(linkText)!;
      } else {
        // Fallback to generating slug (for backwards compatibility)
        slug = linkText
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }

      let linkUrl = `/notes/${slug}`;
      if (heading) {
        const headingSlug = heading
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        linkUrl += `#${headingSlug}`;
      }

      return `[${displayText}](${linkUrl})`;
    },
  );

  // Convert regular markdown links to notes (ending with .md) to proper note links
  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+\.md)\)/g,
    (_match, linkText, href) => {
      // Decode URL-encoded href
      const decodedHref = decodeURIComponent(href);
      // Remove .md extension to get the note name
      const noteName = decodedHref.replace(/\.md$/, '');

      let slug: string;
      if (slugMapping && slugMapping.has(noteName)) {
        // Use the actual slug from the mapping
        slug = slugMapping.get(noteName)!;
      } else {
        // Fallback to generating slug (for backwards compatibility)
        slug = noteName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }

      return `[${linkText}](/notes/${slug})`;
    },
  );

  // Convert Obsidian highlighting ==text== to HTML <mark>text</mark>
  processed = processed.replace(/==([^=]+)==/g, (_match, highlightText) => {
    return `<mark>${highlightText}</mark>`;
  });

  // Also process regular markdown images that have meaningful alt text for figure/caption treatment
  processed = processed.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/g,
    (match, altText, imagePath) => {
      // Check if alt text contains image extensions (indicates it's a default/automatic caption)
      const hasImageExtension =
        /\.(png|jpe?g|gif|webp|svg|avif|bmp|tiff?)$/i.test(altText.trim());

      // Extract filename from path for comparison - handle both regular paths and Astro optimized URLs
      let filename = '';
      if (imagePath.includes('/_image?href=')) {
        // Extract from Astro optimized URL - decode the href parameter
        try {
          const urlParams = new URLSearchParams(imagePath.split('?')[1]);
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
      } else {
        // Regular image path
        filename =
          imagePath
            .split('/')
            .pop()
            ?.replace(/\.[^.]*$/, '') || '';
      }

      // If alt text is meaningful (not filename-like), mark it for client-side processing
      if (
        altText &&
        altText.trim() !== filename &&
        altText.trim() !== '' &&
        !hasImageExtension
      ) {
        // Return markdown but with a special prefix that will be detected client-side
        return `![🎯${altText}](${imagePath})`;
      }
      return match;
    },
  );

  return processed;
}
