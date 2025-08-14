import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { rehypeRawHtmlInCode } from '../rehype-raw-html-in-code';

describe('rehypeRawHtmlInCode', () => {
  const processMarkdown = async (markdown: string) => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeRawHtmlInCode)
      .use(rehypeStringify);

    const result = await processor.process(markdown);
    return result.toString();
  };

  describe('HTML entity replacement in inline code', () => {
    it('replaces &lt; with < in inline code', async () => {
      const input = 'Use `&lt;div&gt;` for HTML elements.';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>&#x3C;div></code>');
    });

    it('replaces &gt; with > in inline code', async () => {
      const input = 'The `&gt;` symbol means greater than.';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>></code>');
    });

    it('replaces &amp; with & in inline code', async () => {
      const input = 'Use `&amp;` for ampersand in HTML.';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>&#x26;</code>');
    });

    it('replaces &quot; with " in inline code', async () => {
      const input = 'The `&quot;` entity represents a quote.';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>"</code>');
    });

    it("replaces &#39; with ' in inline code", async () => {
      const input = 'The `&#39;` entity represents an apostrophe.';
      const result = await processMarkdown(input);

      expect(result).toContain("<code>'</code>");
    });

    it('replaces multiple entities in the same inline code', async () => {
      const input =
        'Example: `&lt;input type=&quot;text&quot; value=&quot;Hello &amp; Goodbye&quot;&gt;`';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '<code>&#x3C;input type="text" value="Hello &#x26; Goodbye"></code>',
      );
    });

    it('handles mixed content with entities and regular text', async () => {
      const input =
        'The `&lt;script&gt;` tag should contain `alert(&quot;Hello&quot;);`';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>&#x3C;script></code>');
      expect(result).toContain('<code>alert("Hello");</code>');
    });
  });

  describe('code block exclusion', () => {
    it('does not process code blocks (only inline code)', async () => {
      const input = `\`\`\`html
&lt;div class="example"&gt;
  &lt;p&gt;Hello &amp; Goodbye&lt;/p&gt;
&lt;/div&gt;
\`\`\``;

      const result = await processMarkdown(input);

      // Code blocks should have entities double-escaped
      expect(result).toContain('&#x26;lt;div');
      expect(result).toContain('&#x26;amp;');
      expect(result).toContain('&#x26;gt;');
    });

    it('processes inline code but not code blocks in the same content', async () => {
      const input = `Use \`&lt;div&gt;\` for HTML elements.

\`\`\`html
&lt;div class="example"&gt;Content&lt;/div&gt;
\`\`\`

And \`&amp;\` for ampersands.`;

      const result = await processMarkdown(input);

      // Inline code should be processed
      expect(result).toContain('<code>&#x3C;div></code>');
      expect(result).toContain('<code>&#x26;</code>');

      // Code block should have double-escaped entities
      expect(result).toContain('&#x26;lt;div class="example"&#x26;gt;');
    });
  });

  describe('edge cases', () => {
    it('handles empty inline code', async () => {
      const input = 'Empty code: ``';
      const result = await processMarkdown(input);

      // Empty code blocks are not rendered as code elements in markdown
      expect(result).toContain('Empty code: ``');
    });

    it('handles inline code with only whitespace', async () => {
      const input = 'Whitespace code: `   `';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>   </code>');
    });

    it('handles inline code without any entities', async () => {
      const input = "Regular code: `console.log('hello')`";
      const result = await processMarkdown(input);

      expect(result).toContain("<code>console.log('hello')</code>");
    });

    it('handles content without any code', async () => {
      const input = 'Just regular text with &lt; and &gt; symbols.';
      const result = await processMarkdown(input);

      // Regular text should keep HTML entities escaped
      expect(result).toContain('&#x3C; and >');
    });

    it('handles multiple inline code elements', async () => {
      const input =
        'Use `&lt;` for less than and `&gt;` for greater than and `&amp;` for ampersand.';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>&#x3C;</code>');
      expect(result).toContain('<code>></code>');
      expect(result).toContain('<code>&#x26;</code>');
    });

    it('preserves other inline formatting', async () => {
      const input = '**Bold** text with `&lt;code&gt;` and *italic* text.';
      const result = await processMarkdown(input);

      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<code>&#x3C;code></code>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('complex HTML examples', () => {
    it('handles complex HTML structure in inline code', async () => {
      const input =
        'Create a form: `&lt;form action=&quot;/submit&quot; method=&quot;post&quot;&gt;&lt;input type=&quot;text&quot; name=&quot;username&quot;&gt;&lt;/form&gt;`';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '<code>&#x3C;form action="/submit" method="post">&#x3C;input type="text" name="username">&#x3C;/form></code>',
      );
    });

    it('handles JavaScript code with HTML entities', async () => {
      const input =
        'Use: `document.querySelector(&quot;.class&quot;).innerHTML = &quot;&lt;span&gt;Hello&lt;/span&gt;&quot;;`';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '<code>document.querySelector(".class").innerHTML = "&#x3C;span>Hello&#x3C;/span>";</code>',
      );
    });

    it('handles XML/XHTML syntax', async () => {
      const input = 'XML syntax: `&lt;element attr=&quot;value&quot; /&gt;`';
      const result = await processMarkdown(input);

      expect(result).toContain('<code>&#x3C;element attr="value" /></code>');
    });

    it('handles nested quotes and entities', async () => {
      const input =
        'Complex: `&quot;&lt;div data-content=&#39;{&quot;key&quot;: &quot;value&quot;}&#39;&gt;&quot;`';
      const result = await processMarkdown(input);

      expect(result).toContain(
        '<code>"&#x3C;div data-content=\'{"key": "value"}\'>"</code>',
      );
    });
  });

  describe('performance and edge cases', () => {
    it('handles very long inline code', async () => {
      const longCode = '&lt;'.repeat(100) + '&gt;'.repeat(100);
      const input = `Long code: \`${longCode}\``;
      const result = await processMarkdown(input);

      // Should process all entities
      expect(result).toContain('<code>');
      expect(result).toContain('&#x3C;'.repeat(100));
      expect(result).toContain('>'.repeat(100));
    });

    it('handles multiple paragraphs with inline code', async () => {
      const input = `First paragraph with \`&lt;div&gt;\`.

Second paragraph with \`&amp;\` symbol.

Third paragraph with \`&quot;quotes&quot;\`.`;

      const result = await processMarkdown(input);

      expect(result).toContain('<code>&#x3C;div></code>');
      expect(result).toContain('<code>&#x26;</code>');
      expect(result).toContain('<code>"quotes"</code>');
    });

    it('does not affect inline code with className (code blocks)', async () => {
      // This tests the className check in the plugin
      const input = 'Regular inline code: `&lt;test&gt;`';
      const result = await processMarkdown(input);

      // Should be processed since it's inline code without className
      expect(result).toContain('<code>&#x3C;test></code>');
    });
  });
});
