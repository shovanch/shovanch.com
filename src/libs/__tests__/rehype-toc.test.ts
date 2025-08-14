import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { rehypeToc } from '../rehype-toc';

describe('rehypeToc', () => {
  const processMarkdown = async (markdown: string) => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeToc)
      .use(rehypeStringify);

    // Create a mock file object with Astro structure
    const mockFile = {
      data: {
        astro: {
          frontmatter: {},
        },
      },
    };

    const result = await processor.process({ value: markdown, ...mockFile });
    return {
      html: result.toString(),
      frontmatter: result.data.astro!.frontmatter,
    };
  };

  describe('TOC marker detection', () => {
    it('detects [[toc]] marker and sets showToc to true', async () => {
      const input = `# Introduction

[[toc]]

## Section 1
Content here.

## Section 2
More content.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
    });

    it('detects [TOC] marker (case insensitive)', async () => {
      const input = `# Introduction

[[TOC]]

## Section 1
Content here.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
    });

    it('detects mixed case [[Toc]] marker', async () => {
      const input = `# Introduction

[[Toc]]

## Section 1
Content here.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
    });

    it('does not set showToc when no marker is present', async () => {
      const input = `# Introduction

Regular content without TOC marker.

## Section 1
Content here.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBeUndefined();
    });
  });

  describe('marker removal', () => {
    it('removes the [[toc]] marker from content', async () => {
      const input = `# Introduction

[[toc]]

## Section 1
Content here.`;

      const result = await processMarkdown(input);

      // The marker should be removed from the output
      expect(result.html).not.toContain('[[toc]]');
      expect(result.html).not.toContain('[[TOC]]');
    });

    it('removes only the first occurrence of the marker', async () => {
      const input = `# Introduction

[[toc]]

## Section 1
Content with another [[toc]] reference.

## Section 2
More content.`;

      const result = await processMarkdown(input);

      // Should set showToc to true
      expect(result.frontmatter!.showToc).toBe(true);

      // First marker should be removed, second should remain
      expect(result.html).toContain('[[toc]]');
      // Count occurrences - should be 1 remaining
      const matches = result.html.match(/\[\[toc\]\]/gi);
      expect(matches).toHaveLength(1);
    });

    it('handles multiple different case markers correctly', async () => {
      const input = `# Introduction

[[toc]]

## Section 1
Content with [[TOC]] reference.

## Section 2
And another [[Toc]] mention.`;

      const result = await processMarkdown(input);

      // Should set showToc to true from first marker
      expect(result.frontmatter!.showToc).toBe(true);

      // First marker removed, others should remain
      const tocMatches = result.html.match(/\[\[toc\]\]/gi);
      expect(tocMatches?.length).toBeGreaterThan(0);
    });
  });

  describe('marker positions', () => {
    it('processes marker at the beginning of content', async () => {
      const input = `[[toc]]

# Introduction
Content here.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
      expect(result.html).not.toContain('[[toc]]');
    });

    it('processes marker at the end of content', async () => {
      const input = `# Introduction
Content here.

[[toc]]`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
    });

    it('processes marker in the middle of content', async () => {
      const input = `# Introduction
Some content.

[[toc]]

## Section 1
More content.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
    });

    it('processes marker inline with other text', async () => {
      const input = `# Introduction

Table of contents: [[toc]] - see below.

## Section 1
Content here.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
      // The marker should be removed but surrounding text should remain
      expect(result.html).toContain('Table of contents:');
      expect(result.html).toContain('- see below.');
      expect(result.html).not.toContain('[[toc]]');
    });
  });

  describe('edge cases', () => {
    it('handles empty content', async () => {
      const input = '';
      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBeUndefined();
    });

    it('handles content with only whitespace', async () => {
      const input = '   \n\n   ';
      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBeUndefined();
    });

    it('handles malformed TOC markers', async () => {
      const input = `# Introduction

[toc]  (missing one bracket)
[[toc] (missing closing bracket)
[toc]] (missing opening bracket)
[[TOC]] (correct marker)

## Section 1
Content.`;

      const result = await processMarkdown(input);

      // Should only detect the correct marker
      expect(result.frontmatter!.showToc).toBe(true);

      // Malformed markers should remain in content
      expect(result.html).toContain('[toc]');
      expect(result.html).toContain('[[toc]');
      expect(result.html).toContain('[toc]]');

      // Correct marker should be removed
      expect(result.html).not.toContain('[[TOC]]');
    });

    it('handles TOC marker within code blocks', async () => {
      const input = `# Introduction

\`\`\`markdown
Example of TOC marker: [[toc]]
\`\`\`

Actual TOC: [[toc]]

## Section 1
Content.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);

      // Code block content is processed and the marker is removed
      expect(result.frontmatter!.showToc).toBe(true);
    });

    it('handles TOC marker within inline code', async () => {
      const input = `# Introduction

Use \`[[toc]]\` to insert a table of contents.

[[toc]]

## Section 1
Content.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);

      // Inline code is also processed and the marker is removed
      expect(result.frontmatter!.showToc).toBe(true);
    });

    it('preserves existing frontmatter properties', async () => {
      const input = `[[toc]]

# Content`;

      // Mock processor with existing frontmatter
      const processor = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeToc)
        .use(rehypeStringify);

      const mockFile = {
        data: {
          astro: {
            frontmatter: {
              title: 'Existing Title',
              author: 'Test Author',
            },
          },
        },
      };

      const result = await processor.process({ value: input, ...mockFile });

      expect(result.data.astro!.frontmatter!.showToc).toBe(true);
      expect(result.data.astro!.frontmatter!.title).toBe('Existing Title');
      expect(result.data.astro!.frontmatter!.author).toBe('Test Author');
    });
  });

  describe('integration scenarios', () => {
    it('works with typical blog post structure', async () => {
      const input = `# My Blog Post

This post will cover several topics.

[[toc]]

## Introduction
Getting started with the topic.

## Main Content
### Subsection 1
Details here.

### Subsection 2
More details.

## Conclusion
Wrapping up.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
      expect(result.html).toContain('<h1>My Blog Post</h1>');
      expect(result.html).toContain('<h2>Introduction</h2>');
      expect(result.html).toContain('<h3>Subsection 1</h3>');
      expect(result.html).not.toContain('[[toc]]');
    });

    it('works with documentation structure', async () => {
      const input = `# API Documentation

Complete guide to using our API.

[[toc]]

## Authentication
How to authenticate.

## Endpoints
Available API endpoints.

### GET /users
Get all users.

### POST /users
Create a new user.

## Error Handling
How to handle errors.`;

      const result = await processMarkdown(input);

      expect(result.frontmatter!.showToc).toBe(true);
      expect(result.html).toContain('Complete guide to using our API');
      expect(result.html).not.toContain('[[toc]]');
    });
  });
});
