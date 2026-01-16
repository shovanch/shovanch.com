import type { Blockquote, Root } from 'mdast';
import { visit } from 'unist-util-visit';

type HastData = {
  hName?: string;
  hProperties?: Record<string, string>;
};

/**
 * Supported callout types with their display labels
 */
const CALLOUT_TYPES = [
  'tip',
  'info',
  'note',
  'warning',
  'danger',
  'success',
  'caution',
  'important',
  'quote',
] as const;

type CalloutType = (typeof CALLOUT_TYPES)[number];

/**
 * Remark plugin that transforms Obsidian-style callouts into styled aside elements.
 *
 * Syntax:
 * > [!tip]
 * > Your tip content here.
 *
 * > [!warning] Watch out!
 * > Warning content with optional title.
 *
 * Transforms into an aside element with classes "callout callout-{type}"
 * and data attributes for type and optional title.
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;

      // Check if this blockquote starts with [!type]
      const firstChild = node.children[0];
      if (firstChild?.type !== 'paragraph') return;

      const firstInlineChild = firstChild.children[0];
      if (firstInlineChild?.type !== 'text') return;

      const text = firstInlineChild.value;

      // First, match just the [!type] part
      const typeMatch = text.match(/^\[!(\w+)\]/i);
      if (!typeMatch) return;

      const rawType = typeMatch[1].toLowerCase();

      // Only process recognized callout types (let sidenotes handle [!sidenote])
      if (!CALLOUT_TYPES.includes(rawType as CalloutType)) return;

      const calloutType = rawType as CalloutType;

      // Now determine if there's a title on the same line
      // A title exists ONLY if there's content after [!type] before a newline
      // Note: Some markdown parsers join blockquote lines with spaces instead of newlines
      const afterBracket = text.slice(typeMatch[0].length);

      let title: string | undefined;
      let matchLength: number;

      if (afterBracket.startsWith('\n') || afterBracket === '') {
        // No title - [!type] is followed by newline or end of string
        title = undefined;
        matchLength = typeMatch[0].length + (afterBracket.startsWith('\n') ? 1 : 0);
      } else if (afterBracket.match(/^[ \t]/)) {
        // There's a space/tab after ] - this could be a title OR joined content
        // Look for a newline to determine where the title ends
        const newlineIndex = afterBracket.indexOf('\n');

        if (newlineIndex === -1) {
          // No newline found - the entire remaining text could be title OR content
          // This happens when the parser joins lines with spaces
          // We need to check if this looks like a title (short text) or content (long text)
          const potentialTitle = afterBracket.trim();

          // Heuristic: If it's short (< 50 chars) and doesn't look like a sentence,
          // treat it as a title. Otherwise, no title.
          // A better approach: Only treat as title if it's clearly a short label
          if (potentialTitle.length > 0 && potentialTitle.length <= 50 && !potentialTitle.includes('.')) {
            title = potentialTitle;
            matchLength = text.length; // Consume everything
          } else {
            // Looks like content, not a title
            title = undefined;
            matchLength = typeMatch[0].length;
          }
        } else {
          // There's a newline - title is everything before it
          const titleText = afterBracket.slice(0, newlineIndex).trim();
          if (titleText) {
            title = titleText;
            matchLength = typeMatch[0].length + newlineIndex + 1; // +1 for the newline
          } else {
            // Just whitespace before the newline, no title
            title = undefined;
            matchLength = typeMatch[0].length + newlineIndex + 1;
          }
        }
      } else {
        // Something else after ] that's not whitespace or newline - not valid callout syntax
        return;
      }

      // Remove the [!type] marker (and title if present) from the text
      const remainingText = text.slice(matchLength);
      firstInlineChild.value = remainingText;

      // If the first text node is now empty, remove it
      if (firstInlineChild.value === '') {
        firstChild.children.shift();
      }

      // If the first paragraph is now empty, remove it
      if (firstChild.children.length === 0) {
        node.children.shift();
      }

      // Transform the blockquote into an aside element
      const data = (node.data ??= {}) as HastData;
      data.hName = 'aside';
      data.hProperties = {
        className: `callout callout-${calloutType}`,
        'data-callout-type': calloutType,
        ...(title && { 'data-callout-title': title }),
      };
    });
  };
}
