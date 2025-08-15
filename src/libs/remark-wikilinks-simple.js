import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

// Cache for slug mapping to avoid rebuilding on each call
let slugMappingCache = null;

// Helper function to generate slug from file ID (same logic as in [slug].astro)
function generateSlugFromId(id) {
  const filename = id.split('/').pop() || id;
  const nameWithoutExt = filename.replace(/\.md$/, '');

  return nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to extract title from file ID
function extractTitleFromId(id) {
  const filename = id.split('/').pop() || id;
  return filename.replace(/\.md$/, '');
}

// Build mapping from note titles/filenames to their actual slugs
function buildSlugMappingSync() {
  const notesDir = path.resolve('src/content/notes');
  const slugMapping = new Map();

  if (!fs.existsSync(notesDir)) {
    console.warn('Notes directory not found:', notesDir);
    return slugMapping;
  }

  function processDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativeFilePath = path
        .join(relativePath, entry.name)
        .replace(/\\/g, '/');

      if (entry.isDirectory()) {
        // Skip system directories
        if (
          entry.name.startsWith('.') ||
          entry.name === 'Excalidraw' ||
          entry.name === 'excalidraw' ||
          entry.name === 'note-template'
        ) {
          continue;
        }
        processDirectory(fullPath, relativeFilePath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Skip system files
        if (
          entry.name.startsWith('.') ||
          entry.name.includes('.excalidraw') ||
          entry.name.includes('Untitled') ||
          entry.name.includes('Drawing ')
        ) {
          continue;
        }

        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const { data } = matter(content);

          const actualSlug = data.slug || generateSlugFromId(relativeFilePath);
          const title = data.title || extractTitleFromId(relativeFilePath);
          const filename = extractTitleFromId(relativeFilePath);

          // Map both title and filename to the actual slug
          slugMapping.set(title, actualSlug);
          slugMapping.set(filename, actualSlug);

          // Also map the generated slug (for backwards compatibility)
          const generatedSlug = generateSlugFromId(relativeFilePath);
          slugMapping.set(generatedSlug, actualSlug);
        } catch (error) {
          console.warn(`Error processing ${fullPath}:`, error.message);
        }
      }
    }
  }

  processDirectory(notesDir);
  return slugMapping;
}

// Simple slugify function (matches generateSlugFromId logic)
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Get the actual slug for a note name
function getSlugForNote(noteName, slugMapping) {
  // First check if we have a mapping for this exact name
  if (slugMapping && slugMapping.has(noteName)) {
    return slugMapping.get(noteName);
  }

  // Fall back to basic slugification
  return slugify(noteName);
}

// Remark plugin to process wikilinks and markdown links ending in .md
export function remarkWikilinksSimple() {
  return (tree) => {
    // Build slug mapping if not cached
    if (!slugMappingCache) {
      try {
        slugMappingCache = buildSlugMappingSync();
        console.log(`Built slug mapping with ${slugMappingCache.size} entries`);
      } catch (error) {
        console.warn(
          'Failed to build slug mapping, falling back to basic slugification:',
          error,
        );
        slugMappingCache = new Map();
      }
    }

    // Handle regular markdown links ending with .md
    visit(tree, 'link', (node) => {
      // Skip absolute paths that don't end with .md (these are intentional web routes)
      if (node.url && node.url.startsWith('/') && !node.url.endsWith('.md')) {
        return;
      }

      if (node.url && node.url.endsWith('.md')) {
        const fullPath = decodeURIComponent(node.url).replace(/\.md$/, '');
        // Handle relative paths like "../notes/Principles I Believe In" by extracting just the filename
        const noteName = fullPath.includes('/')
          ? fullPath.split('/').pop()
          : fullPath;
        const slug = getSlugForNote(noteName, slugMappingCache);
        node.url = `/notes/${slug}`;
      }
    });

    // Handle wikilinks in text nodes
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || !node.value.includes('[[')) return;

      const newNodes = [];
      let lastIndex = 0;

      // Process wikilinks in the text
      node.value.replace(/\[\[([^\]]+)\]\]/g, (match, content, offset) => {
        // Add text before the link
        if (offset > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, offset),
          });
        }

        const [pageName, customText] = content.split('|').map((s) => s.trim());
        const [actualPage, heading] = pageName.split('#');
        const linkText = customText || actualPage;

        const slug = getSlugForNote(actualPage, slugMappingCache);
        let href = `/notes/${slug}`;

        if (heading) {
          const headingSlug = slugify(heading);
          href += `#${headingSlug}`;
        }

        // Create link node
        newNodes.push({
          type: 'link',
          url: href,
          children: [
            {
              type: 'text',
              value: linkText,
            },
          ],
        });

        lastIndex = offset + match.length;
        return match;
      });

      // Add remaining text
      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      // Replace the text node with new nodes if we found wikilinks
      if (newNodes.length > 1) {
        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
}
