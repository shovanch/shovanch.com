import { globSync } from 'glob';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { processObsidianMarkdown } from './process-markdown';

export function obsidianLoader(options: { pattern: string[]; base: string }) {
  return {
    name: 'obsidian-loader',
    load: async () => {
      const results = [];
      const cwd = options.base;

      try {
        for (const pattern of options.pattern) {
          // Handle negative patterns correctly
          const isNegative = pattern.startsWith('!');
          if (isNegative) continue; // Skip negative patterns for now

          const files = globSync(pattern, { cwd, absolute: true });

          if (!files || !Array.isArray(files)) {
            console.warn(`No files found for pattern: ${pattern}`);
            continue;
          }

          for (const file of files) {
            try {
              const content = fs.readFileSync(file, 'utf-8');
              const { data, content: body } = matter(content);

              // Process Obsidian syntax in the content
              const processedBody = processObsidianMarkdown(body);

              const id = path.relative(cwd, file).replace(/\\/g, '/');

              results.push({
                id,
                data,
                body: processedBody,
              });
            } catch (fileError) {
              console.error(`Error processing file ${file}:`, fileError);
              // Continue processing other files
            }
          }
        }
      } catch (error) {
        console.error('Error in obsidian-loader:', error);
      }

      return results;
    },
  };
}
