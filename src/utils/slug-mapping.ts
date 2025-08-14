import { getCollection } from 'astro:content';

// Helper function to generate slug from file ID (same logic as in [slug].astro)
function generateSlugFromId(id: string): string {
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
function extractTitleFromId(id: string): string {
  const filename = id.split('/').pop() || id;
  return filename.replace(/\.md$/, '');
}

// Build mapping from note titles/filenames to their actual slugs
export async function buildSlugMapping(): Promise<Map<string, string>> {
  const notes = await getCollection('notes');
  const slugMapping = new Map<string, string>();

  for (const note of notes) {
    // Filter out system files (same logic as in [slug].astro)
    if (
      note.id.startsWith('.') ||
      note.id.includes('/.') ||
      note.id.startsWith('Excalidraw/') ||
      note.id.includes('excalidraw/') ||
      note.id.startsWith('note-template/') ||
      note.id.includes('.excalidraw') ||
      note.id.includes('Untitled') ||
      note.id.includes('templates/') ||
      note.id.includes('posts/')
    ) {
      continue;
    }

    const actualSlug = note.data.slug || generateSlugFromId(note.id);
    const title = note.data.title || extractTitleFromId(note.id);
    const filename = extractTitleFromId(note.id);

    // Map both title and filename to the actual slug
    slugMapping.set(title, actualSlug);
    slugMapping.set(filename, actualSlug);

    // Also map the generated slug (for backwards compatibility)
    const generatedSlug = generateSlugFromId(note.id);
    slugMapping.set(generatedSlug, actualSlug);
  }

  return slugMapping;
}

// Export the slug generation function for reuse
export { extractTitleFromId, generateSlugFromId };
