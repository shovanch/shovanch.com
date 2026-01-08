/**
 * Notes Manifest Builder
 *
 * Scans the Obsidian vault notes directory, parses frontmatter,
 * computes canonical and alias routes, and validates for collisions.
 */

import matter from 'gray-matter';
import { glob } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  NoteEntry,
  NoteManifest,
  NoteFrontmatter,
  ManifestError,
  CanonicalPathParams,
  AliasPathParams,
} from './types';

/** Default path to the vault notes directory relative to project root */
const VAULT_NOTES_PATH = 'src/content/vault/notes';

/**
 * Normalize a string into a URL-safe slug.
 *
 * Rules:
 * - Lowercase
 * - Spaces → hyphens
 * - Remove unsafe URL characters
 * - Collapse repeated hyphens
 * - Trim leading/trailing hyphens
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove unsafe chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
    .trim();
}

/**
 * Compute the slug for a note.
 *
 * Priority:
 * 1. frontmatter.slug (if present)
 * 2. filename (without extension)
 */
export function computeSlug(
  frontmatter: NoteFrontmatter,
  filename: string
): string {
  if (frontmatter.slug && frontmatter.slug.trim()) {
    return normalizeSlug(frontmatter.slug);
  }
  // Remove .md extension and normalize
  const nameWithoutExt = filename.replace(/\.md$/i, '');
  return normalizeSlug(nameWithoutExt);
}

/**
 * Compute the canonical route from the filesystem path.
 *
 * Rules:
 * - index.md maps to its parent folder path (no /index segment)
 * - Other files map to dir/slug
 * - Root level files map to just slug
 * - Directory names are normalized
 */
export function computeCanonicalRoute(
  relativePath: string,
  slug: string
): string {
  const dir = path.dirname(relativePath);
  const filename = path.basename(relativePath, '.md');

  // Handle index.md → folder path (no /index segment)
  if (filename.toLowerCase() === 'index') {
    if (dir === '.') {
      // index.md at root of notes/ - this would be /notes itself
      return '';
    }
    // Normalize each directory segment
    return dir
      .split(path.sep)
      .map(normalizeSlug)
      .filter((s) => s.length > 0)
      .join('/');
  }

  // Normal file at root level
  if (dir === '.') {
    return slug;
  }

  // Nested file: normalize directory + slug
  const normalizedDir = dir
    .split(path.sep)
    .map(normalizeSlug)
    .filter((s) => s.length > 0)
    .join('/');

  return `${normalizedDir}/${slug}`;
}

/**
 * Compute alias routes from the surfaces field.
 *
 * If the note is promoted to the 'notes' surface, it gets an alias
 * route using the frontmatter.id (or slug if no id).
 *
 * Returns empty array if not promoted or if alias would equal canonical.
 */
export function computeAliasRoutes(
  frontmatter: NoteFrontmatter,
  slug: string,
  canonicalRoute: string
): string[] {
  // Check if promoted to 'notes' surface
  if (!frontmatter.surfaces?.includes('notes')) {
    return [];
  }

  // Use id as alias slug, fallback to regular slug
  const aliasSlug = frontmatter.id
    ? normalizeSlug(frontmatter.id)
    : slug;

  // Don't create alias if it would equal canonical
  if (aliasSlug === canonicalRoute) {
    return [];
  }

  return [aliasSlug];
}

/**
 * Check if a file path should be excluded from processing.
 */
function isSystemFile(relativePath: string): boolean {
  return (
    // Dotfiles and hidden directories
    relativePath.startsWith('.') ||
    relativePath.includes('/.') ||
    // Excalidraw files and directories
    relativePath.includes('Excalidraw/') ||
    relativePath.includes('excalidraw/') ||
    relativePath.includes('.excalidraw') ||
    // Untitled and drawing files
    relativePath.includes('Untitled') ||
    relativePath.includes('Drawing ') ||
    // Templates
    relativePath.includes('templates/') ||
    relativePath.includes('_templates/') ||
    // Asset directories (we want md files, not images)
    relativePath.startsWith('assets/') ||
    relativePath.includes('/assets/')
  );
}

/**
 * Extract title from frontmatter or filename.
 */
function extractTitle(
  frontmatter: NoteFrontmatter,
  filename: string
): string | null {
  if (frontmatter.title && frontmatter.title.trim()) {
    return frontmatter.title.trim();
  }
  // Use filename without extension as fallback
  const nameWithoutExt = filename.replace(/\.md$/i, '');
  return nameWithoutExt || null;
}

/**
 * Generate a stable ID from frontmatter or filepath.
 */
function generateId(
  frontmatter: NoteFrontmatter,
  relativePath: string
): string {
  if (frontmatter.id && frontmatter.id.trim()) {
    return frontmatter.id.trim();
  }
  // Derive from filepath: remove .md, normalize
  return normalizeSlug(relativePath.replace(/\.md$/i, ''));
}

/**
 * Build the notes manifest by scanning all markdown files.
 *
 * @param basePath - Optional override for the vault notes directory path
 * @returns The complete manifest with entries and any validation errors
 */
export async function buildNoteManifest(
  basePath?: string
): Promise<NoteManifest> {
  const vaultPath = basePath || path.resolve(process.cwd(), VAULT_NOTES_PATH);

  // Find all markdown files
  const files = await glob('**/*.md', { cwd: vaultPath });

  const entries: NoteEntry[] = [];
  const errors: ManifestError[] = [];

  // Maps for collision detection
  const canonicalMap = new Map<string, NoteEntry>();
  const aliasMap = new Map<string, NoteEntry>();

  // First pass: parse all files and compute routes
  for (const relativePath of files) {
    if (isSystemFile(relativePath)) {
      continue;
    }

    const fullPath = path.join(vaultPath, relativePath);

    let content: string;
    try {
      content = await fs.readFile(fullPath, 'utf-8');
    } catch {
      // Skip files that can't be read
      continue;
    }

    const { data: rawFrontmatter, content: body } = matter(content);
    const frontmatter = rawFrontmatter as NoteFrontmatter;

    const filename = path.basename(relativePath);
    const slug = computeSlug(frontmatter, filename);
    const canonicalRoute = computeCanonicalRoute(relativePath, slug);
    const aliasRoutes = computeAliasRoutes(frontmatter, slug, canonicalRoute);
    const id = generateId(frontmatter, relativePath);
    const title = extractTitle(frontmatter, filename);

    const entry: NoteEntry = {
      id,
      sourcePath: fullPath,
      title,
      slug,
      canonicalRoute,
      aliasRoutes,
      frontmatter,
      body,
    };

    entries.push(entry);
  }

  // Second pass: build canonical map and check for collisions
  for (const entry of entries) {
    const existingCanonical = canonicalMap.get(entry.canonicalRoute);
    // Use sourcePath for comparison since id might not be unique
    if (existingCanonical && existingCanonical.sourcePath !== entry.sourcePath) {
      errors.push({
        type: 'canonical_collision',
        message: `Canonical route collision: '${entry.canonicalRoute}'`,
        files: [existingCanonical.id, entry.id],
        route: entry.canonicalRoute,
      });
    } else {
      canonicalMap.set(entry.canonicalRoute, entry);
    }
  }

  // Third pass: check aliases against the complete canonical map
  for (const entry of entries) {
    for (const alias of entry.aliasRoutes) {
      // Check alias vs canonical conflict (different note)
      // Use sourcePath for comparison since id might not be unique
      const conflictingCanonical = canonicalMap.get(alias);
      if (conflictingCanonical && conflictingCanonical.sourcePath !== entry.sourcePath) {
        errors.push({
          type: 'alias_canonical_conflict',
          message: `Alias '${alias}' conflicts with canonical route of another note`,
          files: [entry.id, conflictingCanonical.id],
          route: alias,
        });
        continue;
      }

      // Check alias collision (different note)
      // Use sourcePath for comparison since id might not be unique
      const existingAlias = aliasMap.get(alias);
      if (existingAlias && existingAlias.sourcePath !== entry.sourcePath) {
        errors.push({
          type: 'alias_collision',
          message: `Alias collision: '${alias}'`,
          files: [entry.id, existingAlias.id],
          route: alias,
        });
        continue;
      }

      aliasMap.set(alias, entry);
    }
  }

  return { entries, errors };
}

/**
 * Validate the manifest and throw if there are any errors.
 *
 * Call this during build to fail fast on routing conflicts.
 */
export function validateManifest(manifest: NoteManifest): void {
  if (manifest.errors.length === 0) {
    return;
  }

  const errorMessages = manifest.errors
    .map(
      (e) =>
        `[${e.type}] ${e.message}\n  Files: ${e.files.join(', ')}\n  Route: ${e.route}`
    )
    .join('\n\n');

  throw new Error(`Notes manifest validation failed:\n\n${errorMessages}`);
}

/**
 * Get static paths for canonical routes ([...path].astro).
 *
 * Used in getStaticPaths to generate all canonical note pages.
 */
export function getCanonicalPaths(manifest: NoteManifest): CanonicalPathParams[] {
  return manifest.entries.map((entry) => ({
    params: {
      // Empty string becomes undefined for the root path
      path: entry.canonicalRoute || undefined,
    },
    props: { entry },
  }));
}

/**
 * Get static paths for alias redirects ([slug].astro).
 *
 * Only returns aliases that are different from their canonical routes.
 */
export function getAliasPaths(manifest: NoteManifest): AliasPathParams[] {
  const paths: AliasPathParams[] = [];

  for (const entry of manifest.entries) {
    for (const alias of entry.aliasRoutes) {
      // Only include if alias differs from canonical
      if (alias !== entry.canonicalRoute) {
        paths.push({
          params: { slug: alias },
          props: { canonicalRoute: entry.canonicalRoute },
        });
      }
    }
  }

  return paths;
}

/**
 * Get entries promoted to a specific surface.
 *
 * Used to filter notes for index pages.
 */
export function getEntriesBySurface(
  manifest: NoteManifest,
  surface: string
): NoteEntry[] {
  return manifest.entries.filter((entry) =>
    entry.frontmatter.surfaces?.includes(surface)
  );
}

/**
 * Find an entry by its canonical route.
 */
export function getEntryByCanonicalRoute(
  manifest: NoteManifest,
  route: string
): NoteEntry | undefined {
  return manifest.entries.find((entry) => entry.canonicalRoute === route);
}

/**
 * Find an entry by its ID.
 */
export function getEntryById(
  manifest: NoteManifest,
  id: string
): NoteEntry | undefined {
  return manifest.entries.find((entry) => entry.id === id);
}
