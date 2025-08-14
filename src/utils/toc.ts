import type { MarkdownHeading } from 'astro';

export type TocHeading = MarkdownHeading & {
  children?: TocHeading[];
};

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function generateToc(
  headings: readonly TocHeading[],
  minHeadingLevel: number,
  maxHeadingLevel: number,
): TocHeading[] {
  const filteredItems = headings.filter(
    (item) => item.depth >= minHeadingLevel && item.depth <= maxHeadingLevel,
  );
  const stack: TocHeading[] = [];
  const result: TocHeading[] = [];

  for (const item of filteredItems) {
    item.children = [];

    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(item);
    } else {
      const parent = stack[stack.length - 1];
      parent.children = parent.children || [];
      parent.children.push(item);
    }

    stack.push(item);
  }

  return result;
}
