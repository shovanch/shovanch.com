import type { CollectionEntry } from 'astro:content';
import { isDevEnv } from '~/utils/is-dev-env';

// Types for content items
export type PostEntry = CollectionEntry<'posts'>;
export type NoteEntry = {
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

export type ContentEntry = PostEntry | NoteEntry;

// Interface for content with required publication data
export type PublishableContent = {
  data: {
    isPublished?: boolean;
    publishedAt?: string;
    updatedAt?: string;
  };
};

/**
 * Get the most recent date for sorting - prioritizes updatedAt over publishedAt
 */
export function getDateForSorting(item: PublishableContent): number {
  const updatedAt = item.data.updatedAt;
  const publishedAt = item.data.publishedAt;

  // Use updatedAt if available and valid
  if (updatedAt && !updatedAt.startsWith('0002-') && updatedAt.length >= 8) {
    try {
      const date = new Date(updatedAt);
      const time = date.getTime();
      if (!isNaN(time)) return time;
    } catch {
      // Fall through to publishedAt
    }
  }

  // Fall back to publishedAt
  if (
    publishedAt &&
    !publishedAt.startsWith('0002-') &&
    publishedAt.length >= 8
  ) {
    try {
      const date = new Date(publishedAt);
      const time = date.getTime();
      if (!isNaN(time)) return time;
    } catch {
      // Return 0 for invalid dates (puts them at the end)
    }
  }

  return 0; // Put items with no valid date at the end
}

/**
 * Filter content by publication status
 * In dev mode, returns all content
 * In production, only returns published content
 */
export function filterPublishedContent<T extends PublishableContent>(
  content: T[],
  options: { respectDevMode?: boolean } = { respectDevMode: true },
): T[] {
  return content.filter((item) => {
    // In dev mode, show all content if respectDevMode is true
    if (options.respectDevMode && isDevEnv) {
      return true;
    }

    // In production, only show published content
    return item.data.isPublished !== false;
  });
}

/**
 * Sort content by date with updatedAt preference over publishedAt
 * Both in descending order (newest first)
 */
export function sortContentByDate<T extends PublishableContent>(
  content: T[],
): T[] {
  return [...content].sort((a, b) => {
    const timeB = getDateForSorting(b);
    const timeA = getDateForSorting(a);
    return timeB - timeA;
  });
}

/**
 * Combined filter and sort operation
 * Filters by publication status, then sorts by date
 */
export function filterAndSortContent<T extends PublishableContent>(
  content: T[],
  options: { respectDevMode?: boolean } = { respectDevMode: true },
): T[] {
  const filtered = filterPublishedContent(content, options);
  return sortContentByDate(filtered);
}

/**
 * Validate if content should be accessible in the current environment
 * Throws an error if content is not accessible
 */
export function validateContentAccess(item: PublishableContent): void {
  // In dev mode, allow access to all content
  if (isDevEnv) {
    return;
  }

  // In production, only allow access to published content
  if (item.data.isPublished === false) {
    throw new Error('Content not found');
  }
}

/**
 * Check if content should be included in static generation
 * Used in getStaticPaths to determine which pages to pre-generate
 */
export function shouldGenerateStaticPath(item: PublishableContent): boolean {
  // In dev mode, generate paths for all content
  if (isDevEnv) {
    return true;
  }

  // In production, only generate paths for content with explicit isPublished: true
  return item.data.isPublished === true;
}
