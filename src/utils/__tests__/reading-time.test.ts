import { describe, expect, it } from 'vitest';
import { getReadingTime, getReadingTimeInMinutes } from '../reading-time';

describe('reading time utilities', () => {
  describe('getReadingTime', () => {
    it('calculates reading time for short text', () => {
      const shortText = 'This is a short text with about ten words in it.';
      const result = getReadingTime(shortText);

      expect(result).toBe('1 min read');
    });

    it('calculates reading time for longer text', () => {
      const longText = Array(300).fill('word').join(' ');
      const result = getReadingTime(longText);

      expect(result).toBe('2 min read');
    });

    it('handles empty text', () => {
      const result = getReadingTime('');
      expect(result).toBe('1 min read');
    });

    it('handles text with markdown syntax', () => {
      const markdownText = `
        # Title
        ## Subtitle
        
        This is **bold** and *italic* text with [links](http://example.com).
        
        \`\`\`javascript
        console.log("code block");
        \`\`\`
        
        - List item 1
        - List item 2
      `;

      const result = getReadingTime(markdownText);
      expect(result).toMatch(/\d+ min read/);
    });
  });

  describe('getReadingTimeInMinutes', () => {
    it('returns reading time in minutes as number', () => {
      const text = Array(200).fill('word').join(' ');
      const result = getReadingTimeInMinutes(text);

      expect(typeof result).toBe('number');
      expect(result).toBe(1);
    });

    it('returns minimum 1 minute for short text', () => {
      const shortText = 'Few words.';
      const result = getReadingTimeInMinutes(shortText);

      expect(result).toBe(1);
    });

    it('calculates accurate minutes for longer text', () => {
      const longText = Array(600).fill('word').join(' '); // ~3 minutes
      const result = getReadingTimeInMinutes(longText);

      expect(result).toBe(3);
    });
  });
});
