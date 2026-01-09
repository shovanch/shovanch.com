import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { remarkSidenotes } from '../remark-sidenotes';

describe('remarkSidenotes', () => {
  const processMarkdown = async (markdown: string) => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkSidenotes)
      .use(remarkRehype)
      .use(rehypeStringify);

    const result = await processor.process(markdown);
    return result.toString();
  };

  describe('basic sidenote transformation', () => {
    it('transforms [!sidenote] blockquote into aside element', async () => {
      const input = `> [!sidenote]
> This is a sidenote.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('This is a sidenote.');
      expect(result).toContain('</aside>');
    });

    it('handles sidenote with content on the same line', async () => {
      const input = `> [!sidenote] This is inline content.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('This is inline content.');
    });

    it('handles multi-paragraph sidenotes', async () => {
      const input = `> [!sidenote]
> First paragraph.
>
> Second paragraph.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('First paragraph.');
      expect(result).toContain('Second paragraph.');
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase [!SIDENOTE]', async () => {
      const input = `> [!SIDENOTE]
> Uppercase marker.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('Uppercase marker.');
    });

    it('handles mixed case [!SideNote]', async () => {
      const input = `> [!SideNote]
> Mixed case marker.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('Mixed case marker.');
    });
  });

  describe('regular blockquotes unchanged', () => {
    it('does not transform regular blockquotes', async () => {
      const input = `> This is a regular blockquote.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<blockquote>');
      expect(result).not.toContain('<aside');
      expect(result).toContain('This is a regular blockquote.');
    });

    it('does not transform blockquotes with other callout types', async () => {
      const input = `> [!note]
> This is a note callout.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<blockquote>');
      expect(result).not.toContain('<aside');
    });

    it('does not transform blockquotes with [!sidenote] mid-text', async () => {
      const input = `> Some text [!sidenote] in the middle.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<blockquote>');
      expect(result).not.toContain('<aside');
    });
  });

  describe('edge cases', () => {
    it('handles empty sidenote content', async () => {
      const input = `> [!sidenote]`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
    });

    it('handles sidenote with only whitespace after marker', async () => {
      const input = `> [!sidenote]
> Actual content here.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('Actual content here.');
    });

    it('handles sidenote with markdown formatting', async () => {
      const input = `> [!sidenote]
> This has **bold** and *italic* text.`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('handles sidenote with links', async () => {
      const input = `> [!sidenote]
> Check out [this link](https://example.com).`;
      const result = await processMarkdown(input);

      expect(result).toContain('<aside class="sidenote">');
      expect(result).toContain('<a href="https://example.com">this link</a>');
    });

    it('handles multiple sidenotes in same document', async () => {
      const input = `Some paragraph.

> [!sidenote]
> First sidenote.

Another paragraph.

> [!sidenote]
> Second sidenote.`;
      const result = await processMarkdown(input);

      const asideMatches = result.match(/<aside class="sidenote">/g);
      expect(asideMatches).toHaveLength(2);
      expect(result).toContain('First sidenote.');
      expect(result).toContain('Second sidenote.');
    });
  });
});
