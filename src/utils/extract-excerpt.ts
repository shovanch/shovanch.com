/**
 * Extracts a clean excerpt from markdown/MDX content
 * Removes frontmatter, code blocks, HTML, and formatting to get readable text
 */
export function extractExcerpt(content: string): string {
  // Simple approach: get the first paragraph of actual content
  const cleanContent = content
    ?.replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    ?.replace(/import.*from.*['""].*['"]/g, '') // Remove imports
    ?.replace(/^#+.*$/gm, '') // Remove headers
    ?.replace(/```[\s\S]*?```/g, '') // Remove code blocks
    ?.replace(/````[\s\S]*?````/g, '') // Remove 4-backtick code blocks
    ?.replace(/<[^>]*>[\s\S]*?<\/[^>]*>/g, '') // Remove HTML components
    ?.replace(/<[^>]*\/?>/g, '') // Remove HTML tags
    ?.trim();

  if (!cleanContent) return '';

  // Find the first substantial paragraph
  const lines = cleanContent.split('\n').filter((line) => line.trim());
  let paragraphText = '';

  for (const line of lines) {
    const cleanLine = line
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/\*\*([^*]*)\*\*/g, '$1') // Remove bold, keep text
      .replace(/\*([^*]*)\*/g, '$1') // Remove italic, keep text
      .replace(/_([^_]*)_/g, '$1') // Remove underscore, keep text
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanLine.length > 20 && /^[A-Za-z]/.test(cleanLine)) {
      paragraphText = cleanLine;
      break;
    }
  }

  if (!paragraphText) return '';

  // Get first 2 sentences
  const sentences = paragraphText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .slice(0, 2);

  if (sentences.length === 0) return '';

  return `${sentences.join('. ')}...`;
}
