import { getCollection, type CollectionEntry } from 'astro:content';
import { isDevEnv } from '~/utils/is-dev-env';

export type ObsidianNote = {
  id: string;
  slug: string;
  data: {
    title?: string;
    publishedAt?: string;
    updatedAt?: string;
    tags?: string[];
    isPublished?: boolean;
    showToc?: boolean;
    type?: string[];
  };
  body?: string;
};

export async function getObsidianNotes(): Promise<ObsidianNote[]> {
  const notes: CollectionEntry<'notes'>[] = await getCollection('notes');

  return notes
    .filter((note) => {
      // Always filter out system files (dev and production)
      const isSystemFile =
        note.id.startsWith('.') ||
        note.id.includes('/.') ||
        note.id.includes('excalidraw/') ||
        note.id.startsWith('templates/') ||
        note.id.startsWith('texts/') ||
        note.id.includes('.excalidraw') ||
        note.id.includes('Untitled') ||
        note.id.includes('drawing '); // Excalidraw drawings

      if (isSystemFile) return false;

      // In dev mode, show all non-system files
      if (isDevEnv) return true;

      // In production, require publishedAt and isPublished !== false
      return note.data.publishedAt && note.data.isPublished !== false;
    })
    .map((note) => ({
      id: note.id,
      slug: note.data.slug || generateSlugFromId(note.id),
      data: {
        title: note.data.title || extractTitleFromId(note.id),
        publishedAt:
          getValidDate(note.data.publishedAt) || new Date().toISOString(),
        updatedAt: getValidDate(note.data.updatedAt),
        tags: note.data.tags || [],
        isPublished: note.data.isPublished,
        showToc: note.data.showToc ?? true,
        type: note.data.type,
      },
      body: note.body,
    }))
    .sort(
      (a, b) =>
        new Date(b.data.publishedAt).getTime() -
        new Date(a.data.publishedAt).getTime(),
    );
}

export async function getObsidianNoteBySlug(
  slug: string,
): Promise<ObsidianNote | null> {
  const notes = await getObsidianNotes();
  return notes.find((note) => note.slug === slug) || null;
}

// Helper function to generate slug from file ID
function generateSlugFromId(id: string): string {
  // Remove path prefix (e.g., "notes/Hello World.md" -> "Hello World.md")
  const filename = id.split('/').pop() || id;

  // Remove .md extension
  const nameWithoutExt = filename.replace(/\.md$/, '');

  // Convert to URL-friendly slug
  return nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Helper function to extract title from file ID
function extractTitleFromId(id: string): string {
  const filename = id.split('/').pop() || id;
  return filename.replace(/\.md$/, '');
}

// Helper function to validate and format dates
function getValidDate(dateValue: string | undefined): string | undefined {
  if (!dateValue) return undefined;

  // Check if it's a malformed date (like "0002-01-09")
  if (dateValue.startsWith('0002-') || dateValue.length < 8) {
    return undefined;
  }

  try {
    const date = new Date(dateValue);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  } catch {
    return undefined;
  }
}

// Function to process Obsidian-specific syntax
export function processObsidianContent(content: string): string {
  let processed = content;

  // Convert Obsidian image references ![[image.jpg]] to markdown ![](image.jpg)
  processed = processed.replace(/!\[\[([^\]]+)\]\]/g, (_match, imageName) => {
    // Check if it's in the assets folder
    if (imageName.includes('Pasted image')) {
      return `![${imageName}](/notes/assets/${imageName})`;
    }
    return `![${imageName}](${imageName})`;
  });

  // Convert Obsidian wikilinks [[Page Name]] to markdown [Page Name](/notes/page-name)
  processed = processed.replace(/\[\[([^\]]+)\]\]/g, (_match, linkText) => {
    const slug = linkText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `[${linkText}](/notes/${slug})`;
  });

  return processed;
}
