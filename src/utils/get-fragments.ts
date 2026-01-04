import { getCollection, type CollectionEntry } from 'astro:content';
import { isDevEnv } from '~/utils/is-dev-env';

export type FragmentEntry = CollectionEntry<'fragments'>;

export async function getFragments(): Promise<FragmentEntry[]> {
  const fragments: FragmentEntry[] = await getCollection('fragments');

  return fragments
    .filter((fragment) => {
      // Filter out system/hidden files
      const isSystemFile =
        fragment.id.startsWith('.') || fragment.id.includes('/.');

      if (isSystemFile) return false;

      // In dev mode, show all non-system files
      if (isDevEnv) return true;

      // In production, only show published fragments
      return fragment.data.isPublished !== false;
    })
    .sort((a, b) => {
      // Sort by updatedAt, newest first
      const dateA = a.data.updatedAt
        ? new Date(a.data.updatedAt).getTime()
        : 0;
      const dateB = b.data.updatedAt
        ? new Date(b.data.updatedAt).getTime()
        : 0;
      return dateB - dateA;
    });
}

// Helper function to validate and format dates
export function getValidDate(dateValue: string | undefined): string | undefined {
  if (!dateValue) return undefined;

  // Check if it's a malformed date
  if (dateValue.startsWith('0002-') || dateValue.length < 8) {
    return undefined;
  }

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  } catch {
    return undefined;
  }
}
