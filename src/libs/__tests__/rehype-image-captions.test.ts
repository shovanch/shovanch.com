import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { rehypeImageCaptions } from '../rehype-image-captions';

describe('rehypeImageCaptions', () => {
  const processMarkdown = async (markdown: string) => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeImageCaptions)
      .use(rehypeStringify);

    const result = await processor.process(markdown);
    return result.toString();
  };

  describe('caption marker processing', () => {
    it('converts images with 🎯 marker to figures with captions', async () => {
      const input = '![🎯Beautiful sunset](image.jpg)';
      const result = await processMarkdown(input);

      expect(result).toContain('<figure class="obsidian-image">');
      expect(result).toContain('<img src="image.jpg" alt="Beautiful sunset">');
      expect(result).toContain('<figcaption>Beautiful sunset</figcaption>');
    });

    it('handles empty text after caption marker', async () => {
      const input = '![🎯](image.jpg)';
      const result = await processMarkdown(input);

      // Should not create figure for empty caption
      expect(result).not.toContain('<figure');
      expect(result).toContain('<img src="image.jpg" alt="🎯">');
    });

    it('handles whitespace after caption marker', async () => {
      const input = '![🎯   Beautiful sunset   ](image.jpg)';
      const result = await processMarkdown(input);

      expect(result).toContain('<figure class="obsidian-image">');
      expect(result).toContain('<figcaption>Beautiful sunset</figcaption>');
    });
  });

  describe('meaningful alt text detection', () => {
    it('converts meaningful alt text to figure with caption', async () => {
      const input = '![A beautiful mountain landscape](mountain.jpg)';
      const result = await processMarkdown(input);

      expect(result).toContain('<figure class="obsidian-image">');
      expect(result).toContain(
        '<img src="mountain.jpg" alt="A beautiful mountain landscape">',
      );
      expect(result).toContain(
        '<figcaption>A beautiful mountain landscape</figcaption>',
      );
    });

    it('does not convert filename-like alt text', async () => {
      const input = '![mountain](mountain.jpg)';
      const result = await processMarkdown(input);

      expect(result).not.toContain('<figure');
      expect(result).toContain('<img src="mountain.jpg" alt="mountain">');
    });

    it('does not convert alt text with image extensions', async () => {
      const testCases = [
        '![image.png](test.jpg)',
        '![photo.jpg](test.jpg)',
        '![screenshot.jpeg](test.jpg)',
        '![diagram.gif](test.jpg)',
        '![icon.svg](test.jpg)',
        '![background.webp](test.jpg)',
        '![logo.avif](test.jpg)',
      ];

      for (const input of testCases) {
        const result = await processMarkdown(input);
        expect(result).not.toContain('<figure');
        expect(result).toContain('<img');
      }
    });

    it('does not convert empty alt text', async () => {
      const input = '![](image.jpg)';
      const result = await processMarkdown(input);

      expect(result).not.toContain('<figure');
      expect(result).toContain('<img src="image.jpg" alt="">');
    });

    it('handles complex meaningful descriptions', async () => {
      const input =
        '![Architecture diagram showing the microservices communication flow with API Gateway](architecture.png)';
      const result = await processMarkdown(input);

      expect(result).toContain('<figure class="obsidian-image">');
      expect(result).toContain(
        '<figcaption>Architecture diagram showing the microservices communication flow with API Gateway</figcaption>',
      );
    });
  });

  describe('Astro optimized image handling', () => {
    it('handles Astro image optimization URLs', async () => {
      const input =
        '![Meaningful description](/_image?href=%2Fimages%2Ftest-image.jpg&w=800&h=600)';
      const result = await processMarkdown(input);

      expect(result).toContain('<figure class="obsidian-image">');
      expect(result).toContain(
        '<figcaption>Meaningful description</figcaption>',
      );
    });

    it('handles Astro optimized file paths', async () => {
      const input =
        '![Beautiful sunset](/_astro/sunset-image.6IR3iDzl_15Jr6.webp)';
      const result = await processMarkdown(input);

      expect(result).toContain('<figure class="obsidian-image">');
      expect(result).toContain('<figcaption>Beautiful sunset</figcaption>');
    });

    it('does not convert when alt text matches extracted filename', async () => {
      const input =
        '![test-image](/_image?href=%2Fimages%2Ftest-image.jpg&w=800&h=600)';
      const result = await processMarkdown(input);

      expect(result).not.toContain('<figure');
    });

    it('handles malformed Astro URLs gracefully', async () => {
      const input = '![Meaningful description](/_image?invalid-url)';
      const result = await processMarkdown(input);

      // Should still process since filename extraction fails and alt text is meaningful
      expect(result).toContain('<figure class="obsidian-image">');
      expect(result).toContain(
        '<figcaption>Meaningful description</figcaption>',
      );
    });
  });

  describe('edge cases', () => {
    it('handles images without src attribute', async () => {
      // This is unlikely in practice but test for robustness
      const input = '![Alt text]()';
      const result = await processMarkdown(input);

      expect(result).toContain('<img src="" alt="Alt text">');
    });

    it('handles multiple images in the same content', async () => {
      const input = `![First meaningful description](image1.jpg)

![second-image](image2.jpg)

![🎯Third with marker](image3.jpg)`;

      const result = await processMarkdown(input);

      // First image should become figure (meaningful alt)
      expect(result).toContain(
        '<figcaption>First meaningful description</figcaption>',
      );

      // Second image should become figure since filename doesn't match exactly
      expect(result).toContain('<figcaption>second-image</figcaption>');

      // Third image should become figure (marker)
      expect(result).toContain('<figcaption>Third with marker</figcaption>');
    });

    it('preserves other image properties', async () => {
      const input = '![Beautiful landscape](landscape.jpg)';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '<img src="landscape.jpg" alt="Beautiful landscape">',
      );
      expect(result).toContain('<figure class="obsidian-image">');
    });

    it('handles special characters in alt text', async () => {
      const input = '![Description with special chars: @#$%^&*()!](image.jpg)';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '<figcaption>Description with special chars: @#$%^&#x26;*()!</figcaption>',
      );
    });

    it('handles Unicode characters in alt text', async () => {
      const input =
        '![美しい風景の写真 - Beautiful landscape photo 🌅](image.jpg)';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '<figcaption>美しい風景の写真 - Beautiful landscape photo 🌅</figcaption>',
      );
    });

    it('does not process non-img elements', async () => {
      const input = 'This is just regular text with no images.';
      const result = await processMarkdown(input);

      expect(result).not.toContain('<figure');
      expect(result).not.toContain('<img');
      expect(result).toContain('This is just regular text');
    });
  });

  describe('filename extraction accuracy', () => {
    it('correctly extracts filename from regular paths', async () => {
      const testCases = [
        { input: '![my-image](/path/to/my-image.jpg)', shouldConvert: false },
        {
          input: '![my-image](/path/to/different-name.jpg)',
          shouldConvert: true,
        },
        {
          input: '![Different Description](/path/to/my-image.jpg)',
          shouldConvert: true,
        },
      ];

      for (const testCase of testCases) {
        const result = await processMarkdown(testCase.input);
        if (testCase.shouldConvert) {
          expect(result).toContain('<figure');
        } else {
          expect(result).not.toContain('<figure');
        }
      }
    });

    it('handles various file extensions correctly', async () => {
      const extensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'avif',
        'bmp',
        'tiff',
      ];

      for (const ext of extensions) {
        const input = `![Meaningful description](test.${ext})`;
        const result = await processMarkdown(input);
        expect(result).toContain('<figure class="obsidian-image">');
      }
    });
  });
});
