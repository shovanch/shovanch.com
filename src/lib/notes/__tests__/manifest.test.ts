/**
 * Tests for the notes manifest builder
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizeSlug,
  computeSlug,
  computeCanonicalRoute,
  computeAliasRoutes,
  buildNoteManifest,
  validateManifest,
  getCanonicalPaths,
  getAliasPaths,
  getEntriesBySurface,
} from '../manifest';
import type { NoteFrontmatter } from '../types';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// ============================================================
// Unit Tests: Slug Normalization
// ============================================================

describe('normalizeSlug', () => {
  it('lowercases input', () => {
    expect(normalizeSlug('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(normalizeSlug('hello world')).toBe('hello-world');
  });

  it('removes unsafe URL characters', () => {
    expect(normalizeSlug("hello's world!")).toBe('hellos-world');
  });

  it('collapses multiple hyphens', () => {
    expect(normalizeSlug('hello---world')).toBe('hello-world');
  });

  it('trims leading and trailing hyphens', () => {
    expect(normalizeSlug('-hello-world-')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(normalizeSlug('Go: Understanding & Learning')).toBe(
      'go-understanding-learning'
    );
  });

  it('handles already normalized slugs', () => {
    expect(normalizeSlug('already-normalized')).toBe('already-normalized');
  });

  it('handles numbers', () => {
    expect(normalizeSlug('Part 1 of 10')).toBe('part-1-of-10');
  });
});

// ============================================================
// Unit Tests: Slug Computation
// ============================================================

describe('computeSlug', () => {
  it('uses frontmatter slug when present', () => {
    const frontmatter: NoteFrontmatter = { slug: 'custom-slug' };
    expect(computeSlug(frontmatter, 'Original File.md')).toBe('custom-slug');
  });

  it('normalizes frontmatter slug', () => {
    const frontmatter: NoteFrontmatter = { slug: 'Custom Slug!' };
    expect(computeSlug(frontmatter, 'file.md')).toBe('custom-slug');
  });

  it('falls back to filename when no frontmatter slug', () => {
    const frontmatter: NoteFrontmatter = {};
    expect(computeSlug(frontmatter, 'My Note.md')).toBe('my-note');
  });

  it('falls back to filename when frontmatter slug is empty', () => {
    const frontmatter: NoteFrontmatter = { slug: '' };
    expect(computeSlug(frontmatter, 'My Note.md')).toBe('my-note');
  });

  it('falls back to filename when frontmatter slug is whitespace', () => {
    const frontmatter: NoteFrontmatter = { slug: '   ' };
    expect(computeSlug(frontmatter, 'My Note.md')).toBe('my-note');
  });
});

// ============================================================
// Unit Tests: Canonical Route Computation
// ============================================================

describe('computeCanonicalRoute', () => {
  it('handles index.md at root level', () => {
    expect(computeCanonicalRoute('index.md', 'index')).toBe('');
  });

  it('handles index.md in nested folder', () => {
    expect(computeCanonicalRoute('DDIA/index.md', 'index')).toBe('ddia');
  });

  it('handles deeply nested index.md', () => {
    expect(computeCanonicalRoute('Go/Advanced/index.md', 'index')).toBe(
      'go/advanced'
    );
  });

  it('handles regular file at root level', () => {
    expect(computeCanonicalRoute('hello-world.md', 'hello-world')).toBe(
      'hello-world'
    );
  });

  it('handles nested file paths', () => {
    expect(computeCanonicalRoute('DDIA/Concurrency.md', 'concurrency')).toBe(
      'ddia/concurrency'
    );
  });

  it('normalizes directory names', () => {
    expect(computeCanonicalRoute('Go Notes/My File.md', 'my-file')).toBe(
      'go-notes/my-file'
    );
  });

  it('handles spaces in directory names', () => {
    expect(
      computeCanonicalRoute('Hello World/Test File.md', 'test-file')
    ).toBe('hello-world/test-file');
  });
});

// ============================================================
// Unit Tests: Alias Routes Computation
// ============================================================

describe('computeAliasRoutes', () => {
  it('returns empty array when no surfaces field', () => {
    const frontmatter: NoteFrontmatter = {};
    expect(computeAliasRoutes(frontmatter, 'my-note', 'folder/my-note')).toEqual(
      []
    );
  });

  it('returns empty array when surfaces is empty', () => {
    const frontmatter: NoteFrontmatter = { surfaces: [] };
    expect(computeAliasRoutes(frontmatter, 'my-note', 'folder/my-note')).toEqual(
      []
    );
  });

  it('returns empty array when notes surface not included', () => {
    const frontmatter: NoteFrontmatter = { surfaces: ['home'] };
    expect(computeAliasRoutes(frontmatter, 'my-note', 'folder/my-note')).toEqual(
      []
    );
  });

  it('returns id as alias when notes surface is promoted', () => {
    const frontmatter: NoteFrontmatter = {
      id: 'ddia-concurrency',
      surfaces: ['notes'],
    };
    expect(
      computeAliasRoutes(frontmatter, 'concurrency', 'ddia/concurrency')
    ).toEqual(['ddia-concurrency']);
  });

  it('falls back to slug when no id', () => {
    const frontmatter: NoteFrontmatter = { surfaces: ['notes'] };
    expect(
      computeAliasRoutes(frontmatter, 'concurrency', 'ddia/concurrency')
    ).toEqual(['concurrency']);
  });

  it('returns empty when alias would equal canonical', () => {
    const frontmatter: NoteFrontmatter = { surfaces: ['notes'] };
    expect(computeAliasRoutes(frontmatter, 'my-note', 'my-note')).toEqual([]);
  });

  it('returns empty when id equals canonical', () => {
    const frontmatter: NoteFrontmatter = {
      id: 'my-note',
      surfaces: ['notes'],
    };
    expect(computeAliasRoutes(frontmatter, 'my-note', 'my-note')).toEqual([]);
  });
});

// ============================================================
// Integration Tests: Manifest Building with Fixtures
// ============================================================

describe('buildNoteManifest', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create temp directory for test fixtures
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'notes-test-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  async function createNote(relativePath: string, content: string) {
    const fullPath = path.join(tempDir, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  it('handles index.md canonical mapping', async () => {
    await createNote(
      'DDIA/index.md',
      `---
title: DDIA Notes
---
Content here`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.errors).toHaveLength(0);
    expect(manifest.entries).toHaveLength(1);
    expect(manifest.entries[0].canonicalRoute).toBe('ddia');
  });

  it('handles nested canonical mapping', async () => {
    await createNote(
      'DDIA/Concurrency.md',
      `---
title: Concurrency
---
Content`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.errors).toHaveLength(0);
    expect(manifest.entries).toHaveLength(1);
    expect(manifest.entries[0].canonicalRoute).toBe('ddia/concurrency');
  });

  it('creates alias routes for promoted notes', async () => {
    await createNote(
      'DDIA/Concurrency.md',
      `---
id: ddia-concurrency
title: Concurrency
surfaces:
  - notes
---
Content`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.errors).toHaveLength(0);
    expect(manifest.entries[0].canonicalRoute).toBe('ddia/concurrency');
    expect(manifest.entries[0].aliasRoutes).toEqual(['ddia-concurrency']);
  });

  it('detects canonical route collisions', async () => {
    // Two files with same slug at same level
    await createNote(
      'note-a.md',
      `---
slug: duplicate
---
Content A`
    );
    await createNote(
      'note-b.md',
      `---
slug: duplicate
---
Content B`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.errors).toHaveLength(1);
    expect(manifest.errors[0].type).toBe('canonical_collision');
    expect(manifest.errors[0].route).toBe('duplicate');
  });

  it('detects alias collisions', async () => {
    // Two notes promoted with same alias
    await createNote(
      'folder-a/note.md',
      `---
id: my-alias
surfaces:
  - notes
---
Content A`
    );
    await createNote(
      'folder-b/note.md',
      `---
id: my-alias
surfaces:
  - notes
---
Content B`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.errors).toHaveLength(1);
    expect(manifest.errors[0].type).toBe('alias_collision');
    expect(manifest.errors[0].route).toBe('my-alias');
  });

  it('detects alias vs canonical conflict', async () => {
    // One note has canonical 'foo', another has alias 'foo'
    await createNote(
      'foo.md',
      `---
title: Foo
---
Canonical foo`
    );
    await createNote(
      'nested/bar.md',
      `---
id: foo
surfaces:
  - notes
---
Bar with alias foo`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.errors).toHaveLength(1);
    expect(manifest.errors[0].type).toBe('alias_canonical_conflict');
    expect(manifest.errors[0].route).toBe('foo');
  });

  it('allows alias matching own canonical', async () => {
    // This should NOT produce an error
    await createNote(
      'my-note.md',
      `---
id: my-note
surfaces:
  - notes
---
Content`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.errors).toHaveLength(0);
    // But no alias route should be created since it equals canonical
    expect(manifest.entries[0].aliasRoutes).toEqual([]);
  });

  it('skips system files', async () => {
    await createNote('.hidden.md', '---\n---\nHidden');
    await createNote('Excalidraw/drawing.md', '---\n---\nDrawing');
    await createNote('_templates/template.md', '---\n---\nTemplate');
    await createNote('assets/readme.md', '---\n---\nAsset');
    await createNote('valid-note.md', '---\n---\nValid');

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.entries).toHaveLength(1);
    expect(manifest.entries[0].id).toBe('valid-note');
  });

  it('extracts title from frontmatter', async () => {
    await createNote(
      'note.md',
      `---
title: My Custom Title
---
Content`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.entries[0].title).toBe('My Custom Title');
  });

  it('falls back to filename for title', async () => {
    await createNote(
      'My Great Note.md',
      `---
---
Content`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.entries[0].title).toBe('My Great Note');
  });

  it('uses frontmatter id for entry id', async () => {
    await createNote(
      'note.md',
      `---
id: custom-id
---
Content`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.entries[0].id).toBe('custom-id');
  });

  it('derives id from filepath when not in frontmatter', async () => {
    await createNote(
      'folder/My Note.md',
      `---
---
Content`
    );

    const manifest = await buildNoteManifest(tempDir);

    expect(manifest.entries[0].id).toBe('foldermy-note');
  });
});

// ============================================================
// Unit Tests: Validate Manifest
// ============================================================

describe('validateManifest', () => {
  it('does not throw when no errors', () => {
    const manifest = { entries: [], errors: [] };
    expect(() => validateManifest(manifest)).not.toThrow();
  });

  it('throws with formatted error message', () => {
    const manifest = {
      entries: [],
      errors: [
        {
          type: 'canonical_collision' as const,
          message: "Canonical route collision: 'test'",
          files: ['file-a.md', 'file-b.md'],
          route: 'test',
        },
      ],
    };

    expect(() => validateManifest(manifest)).toThrow(
      /Notes manifest validation failed/
    );
    expect(() => validateManifest(manifest)).toThrow(/canonical_collision/);
    expect(() => validateManifest(manifest)).toThrow(/file-a.md/);
    expect(() => validateManifest(manifest)).toThrow(/file-b.md/);
  });
});

// ============================================================
// Unit Tests: Path Generation Helpers
// ============================================================

describe('getCanonicalPaths', () => {
  it('returns paths for all entries', () => {
    const manifest = {
      entries: [
        {
          id: 'note-1',
          sourcePath: '/path/note-1.md',
          title: 'Note 1',
          slug: 'note-1',
          canonicalRoute: 'note-1',
          aliasRoutes: [],
          frontmatter: {},
          body: '',
        },
        {
          id: 'note-2',
          sourcePath: '/path/folder/note-2.md',
          title: 'Note 2',
          slug: 'note-2',
          canonicalRoute: 'folder/note-2',
          aliasRoutes: [],
          frontmatter: {},
          body: '',
        },
      ],
      errors: [],
    };

    const paths = getCanonicalPaths(manifest);

    expect(paths).toHaveLength(2);
    expect(paths[0].params.path).toBe('note-1');
    expect(paths[1].params.path).toBe('folder/note-2');
  });

  it('returns undefined path for root index', () => {
    const manifest = {
      entries: [
        {
          id: 'index',
          sourcePath: '/path/index.md',
          title: 'Index',
          slug: 'index',
          canonicalRoute: '',
          aliasRoutes: [],
          frontmatter: {},
          body: '',
        },
      ],
      errors: [],
    };

    const paths = getCanonicalPaths(manifest);

    expect(paths[0].params.path).toBeUndefined();
  });
});

describe('getAliasPaths', () => {
  it('returns only alias routes different from canonical', () => {
    const manifest = {
      entries: [
        {
          id: 'note-1',
          sourcePath: '/path/note-1.md',
          title: 'Note 1',
          slug: 'note-1',
          canonicalRoute: 'folder/note-1',
          aliasRoutes: ['note-1-alias'],
          frontmatter: {},
          body: '',
        },
        {
          id: 'note-2',
          sourcePath: '/path/note-2.md',
          title: 'Note 2',
          slug: 'note-2',
          canonicalRoute: 'note-2',
          aliasRoutes: [], // No alias
          frontmatter: {},
          body: '',
        },
      ],
      errors: [],
    };

    const paths = getAliasPaths(manifest);

    expect(paths).toHaveLength(1);
    expect(paths[0].params.slug).toBe('note-1-alias');
    expect(paths[0].props.canonicalRoute).toBe('folder/note-1');
  });
});

describe('getEntriesBySurface', () => {
  it('filters entries by surface', () => {
    const manifest = {
      entries: [
        {
          id: 'note-1',
          sourcePath: '/path/note-1.md',
          title: 'Note 1',
          slug: 'note-1',
          canonicalRoute: 'note-1',
          aliasRoutes: [],
          frontmatter: { surfaces: ['notes'] },
          body: '',
        },
        {
          id: 'note-2',
          sourcePath: '/path/note-2.md',
          title: 'Note 2',
          slug: 'note-2',
          canonicalRoute: 'note-2',
          aliasRoutes: [],
          frontmatter: { surfaces: ['home'] },
          body: '',
        },
        {
          id: 'note-3',
          sourcePath: '/path/note-3.md',
          title: 'Note 3',
          slug: 'note-3',
          canonicalRoute: 'note-3',
          aliasRoutes: [],
          frontmatter: {}, // No surfaces
          body: '',
        },
      ],
      errors: [],
    };

    const notesSurface = getEntriesBySurface(manifest, 'notes');
    expect(notesSurface).toHaveLength(1);
    expect(notesSurface[0].id).toBe('note-1');

    const homeSurface = getEntriesBySurface(manifest, 'home');
    expect(homeSurface).toHaveLength(1);
    expect(homeSurface[0].id).toBe('note-2');
  });
});
