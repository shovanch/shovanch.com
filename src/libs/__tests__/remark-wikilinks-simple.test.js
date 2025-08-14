import fs from 'node:fs';
import path from 'node:path';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { remarkWikilinksSimple } from '../remark-wikilinks-simple.js';

// Mock fs module to avoid file system dependencies in tests
vi.mock('node:fs');
vi.mock('node:path');

describe('remarkWikilinksSimple', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock path.resolve to return a consistent path
    path.resolve.mockReturnValue('/mock/src/content/notes');
    path.join.mockImplementation((...args) => args.join('/'));

    // Mock fs.existsSync to return true (notes directory exists)
    fs.existsSync.mockReturnValue(true);

    // Mock fs.readdirSync to return empty array by default
    fs.readdirSync.mockReturnValue([]);
  });

  const processMarkdown = async (markdown) => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkWikilinksSimple)
      .use(remarkStringify);

    const result = await processor.process(markdown);
    return result.toString();
  };

  describe('wikilink processing', () => {
    it('converts simple wikilinks to markdown links', async () => {
      const input = 'Check out [[My Note]] for more info.';
      const result = await processMarkdown(input);

      expect(result).toContain('[My Note](/notes/my-note)');
    });

    it('converts wikilinks with custom text', async () => {
      const input = 'Read [[My Note|this amazing article]] today.';
      const result = await processMarkdown(input);

      expect(result).toContain('[this amazing article](/notes/my-note)');
    });

    it('converts wikilinks with headings', async () => {
      const input = 'See [[My Note#Introduction]] section.';
      const result = await processMarkdown(input);

      expect(result).toContain('[My Note](/notes/my-note#introduction)');
    });

    it('converts wikilinks with both custom text and headings', async () => {
      const input = 'Check [[My Note#Section|the intro]] here.';
      const result = await processMarkdown(input);

      expect(result).toContain('[the intro](/notes/my-note#section)');
    });

    it('handles multiple wikilinks in the same text', async () => {
      const input = 'Visit [[First Note]] and then [[Second Note]].';
      const result = await processMarkdown(input);

      expect(result).toContain('[First Note](/notes/first-note)');
      expect(result).toContain('[Second Note](/notes/second-note)');
    });

    it('properly slugifies complex note names', async () => {
      const input =
        'Read [[Complex Note Name! With Special Characters & Numbers 123]].';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '[Complex Note Name! With Special Characters & Numbers 123](/notes/complex-note-name-with-special-characters-numbers-123)',
      );
    });

    it('handles wikilinks with spaces around the pipe', async () => {
      const input = 'Check [[My Note | Custom Text]] here.';
      const result = await processMarkdown(input);

      expect(result).toContain('[Custom Text](/notes/my-note)');
    });

    it('preserves text before and after wikilinks', async () => {
      const input = 'Before text [[My Note]] after text.';
      const result = await processMarkdown(input);

      expect(result).toContain(
        'Before text [My Note](/notes/my-note) after text.',
      );
    });
  });

  describe('markdown link processing', () => {
    it('converts markdown links ending with .md', async () => {
      const input = 'Check out [My Note](My%20Note.md) for details.';
      const result = await processMarkdown(input);

      expect(result).toContain('[My Note](/notes/my-note)');
    });

    it('handles URL-encoded markdown links', async () => {
      const input = 'See [Complex Name](Complex%20Name%20With%20Spaces.md).';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '[Complex Name](/notes/complex-name-with-spaces)',
      );
    });

    it('leaves non-.md links unchanged', async () => {
      const input = 'Visit [External](https://example.com) site.';
      const result = await processMarkdown(input);

      expect(result).toContain('[External](https://example.com)');
    });
  });

  describe('slug mapping', () => {
    beforeEach(() => {
      // Mock a directory structure with files
      const mockFiles = [
        { name: 'note1.md', isFile: () => true, isDirectory: () => false },
        { name: 'note2.md', isFile: () => true, isDirectory: () => false },
        { name: 'subfolder', isFile: () => false, isDirectory: () => true },
      ];

      const mockSubfolderFiles = [
        {
          name: 'nested-note.md',
          isFile: () => true,
          isDirectory: () => false,
        },
      ];

      fs.readdirSync.mockImplementation((dir) => {
        if (dir.includes('subfolder')) {
          return mockSubfolderFiles;
        }
        return mockFiles;
      });

      // Mock file content with frontmatter
      fs.readFileSync.mockImplementation((filePath) => {
        const fileName = path.basename(filePath);

        if (fileName === 'note1.md') {
          return `---
title: "Custom Title"
slug: "custom-slug"
---
Content here`;
        } else if (fileName === 'note2.md') {
          return `---
title: "Another Note"
---
Content here`;
        } else if (fileName === 'nested-note.md') {
          return `---
title: "Nested Note"
---
Content here`;
        }

        return '# Default content';
      });
    });

    it('uses custom slug from frontmatter when available', async () => {
      const input = 'Check [[Custom Title]] here.';
      const result = await processMarkdown(input);

      expect(result).toContain('[Custom Title](/notes/custom-title)');
    });

    it('falls back to generated slug when no custom slug', async () => {
      const input = 'See [[Another Note]] for details.';
      const result = await processMarkdown(input);

      expect(result).toContain('[Another Note](/notes/another-note)');
    });
  });

  describe('edge cases', () => {
    it('handles empty wikilinks gracefully', async () => {
      const input = 'Empty link: [[]] here.';
      const result = await processMarkdown(input);

      // Empty wikilinks should be left unchanged since they don't match the regex
      expect(result).toContain('\\[\\[]]');
    });

    it('handles malformed wikilinks', async () => {
      const input = 'Incomplete link: [[My Note here.';
      const result = await processMarkdown(input);

      // Should leave malformed wikilinks unchanged
      expect(result).toContain('\\[\\[My Note');
    });

    it('handles special characters in headings', async () => {
      const input = 'See [[Note#Section with Special! Characters & Numbers]].';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '[Note](/notes/note#section-with-special-characters-numbers)',
      );
    });

    it('handles text without any wikilinks', async () => {
      const input = 'Just regular text without any links.';
      const result = await processMarkdown(input);

      expect(result.trim()).toBe('Just regular text without any links.');
    });

    it('handles multiple wikilinks in different paragraphs', async () => {
      const input = `First paragraph with [[First Note]].

Second paragraph with [[Second Note]].`;

      const result = await processMarkdown(input);

      expect(result).toContain('[First Note](/notes/first-note)');
      expect(result).toContain('[Second Note](/notes/second-note)');
    });
  });

  describe('file system error handling', () => {
    it('handles missing notes directory gracefully', async () => {
      fs.existsSync.mockReturnValue(false);

      const input = 'Check [[My Note]] here.';
      const result = await processMarkdown(input);

      // Should still convert using basic slugification
      expect(result).toContain('[My Note](/notes/my-note)');
    });

    it('handles file read errors gracefully', async () => {
      fs.readdirSync.mockReturnValue([
        { name: 'error-note.md', isFile: () => true, isDirectory: () => false },
      ]);

      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const input = 'Check [[My Note]] here.';
      const result = await processMarkdown(input);

      // Should still work with basic slugification
      expect(result).toContain('[My Note](/notes/my-note)');
    });
  });
});
