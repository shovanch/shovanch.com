/**
 * Types for the notes routing system
 *
 * This module defines the core types for managing canonical routes
 * and surface-based promotions in the Obsidian-to-Astro notes system.
 */

/**
 * Frontmatter fields specific to the notes routing system.
 * Other frontmatter fields are preserved but not typed here.
 */
export interface NoteFrontmatter {
  id?: string;
  title?: string;
  slug?: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  isPublished?: boolean;
  tags?: string[];
  showToc?: boolean;
  type?: string[];
  coverImage?: string;
  surfaces?: string[];
}

/**
 * A processed note entry with computed routing information.
 */
export interface NoteEntry {
  /** Stable identifier from frontmatter.id or derived from filepath */
  id: string;
  /** Full filesystem path to the source markdown file */
  sourcePath: string;
  /** Note title from frontmatter or derived from filename */
  title: string | null;
  /** Normalized URL-safe slug */
  slug: string;
  /** Canonical route path (without /notes/ prefix), e.g., "ddia/concurrency" */
  canonicalRoute: string;
  /** Alias routes that should 301 redirect to canonical, e.g., ["ddia-concurrency"] */
  aliasRoutes: string[];
  /** Raw frontmatter data (all fields preserved) */
  frontmatter: NoteFrontmatter;
  /** Markdown body content */
  body: string;
}

/**
 * Types of validation errors that can occur during manifest building.
 */
export type ManifestErrorType =
  | 'canonical_collision'
  | 'alias_collision'
  | 'alias_canonical_conflict';

/**
 * A validation error detected during manifest building.
 */
export interface ManifestError {
  /** Type of collision/conflict */
  type: ManifestErrorType;
  /** Human-readable error message */
  message: string;
  /** Source file paths involved in the conflict */
  files: string[];
  /** The route that caused the conflict */
  route: string;
}

/**
 * The complete notes manifest containing all entries and validation results.
 */
export interface NoteManifest {
  /** All processed note entries */
  entries: NoteEntry[];
  /** Validation errors (empty if manifest is valid) */
  errors: ManifestError[];
}

/**
 * Static path params for canonical routes ([...path].astro)
 */
export interface CanonicalPathParams {
  params: { path: string | undefined };
  props: { entry: NoteEntry };
}

/**
 * Static path params for alias redirects ([slug].astro)
 */
export interface AliasPathParams {
  params: { slug: string };
  props: { canonicalRoute: string };
}
