import { glob } from 'astro/loaders';
import type { CollectionEntry } from 'astro:content';
import { defineCollection, z } from 'astro:content';

// Enhanced validation schemas with better error messages and transformations
const dateSchema = z.union([z.string(), z.date()]).transform((val) => {
  if (!val) return undefined;
  if (val instanceof Date) return val.toISOString();
  // Validate date string format
  const dateStr = val.toString();
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    throw new Error(
      `Invalid date format: ${dateStr}. Expected YYYY-MM-DD format.`,
    );
  }
  return dateStr;
});

const tagSchema = z
  .array(z.string().trim().min(1, 'Tag cannot be empty'))
  .optional()
  .transform((tags) => tags?.filter((tag) => tag.length > 0) || []);

const headingSchema = z.object({
  depth: z.number().min(1).max(6),
  slug: z.string().min(1, 'Heading slug cannot be empty'),
  text: z.string().min(1, 'Heading text cannot be empty'),
});

const posts = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/posts',
  }),
  schema: z
    .object({
      title: z.string().min(1, 'Post title is required'),
      summary: z.string().optional(),
      publishedAt: z.string().refine((date) => {
        return /^\d{4}-\d{2}-\d{2}/.test(date);
      }, 'Published date must be in YYYY-MM-DD format'),
      updatedAt: z
        .string()
        .optional()
        .refine((date) => {
          return !date || /^\d{4}-\d{2}-\d{2}/.test(date);
        }, 'Updated date must be in YYYY-MM-DD format'),
      heroImage: z.string().optional(),
      readingTime: z.number().min(0).optional(),
      tags: tagSchema,
      isPublished: z.boolean().optional().default(true),
      showToc: z.boolean().optional().default(true),
      headings: z.array(headingSchema).optional(),
      renderOnClientRouter: z.boolean().optional().default(true), // default: true (client-side routing). false will pass data-astro-reload that will do tradtiional full page reloading
    })
    .refine((data) => {
      // Ensure updatedAt is after publishedAt if both exist
      if (data.updatedAt && data.publishedAt) {
        return new Date(data.updatedAt) >= new Date(data.publishedAt);
      }
      return true;
    }, 'Updated date must be after published date'),
});

const notes = defineCollection({
  loader: glob({
    pattern: [
      '**/*.md',
      '!**/Excalidraw/**',
      '!**/excalidraw/**',
      '!**/*.excalidraw.*',
      '!**/templates/**',
      '!**/db/**',
    ],
    base: './src/content/notes',
  }),
  schema: z
    .object({
      title: z.string().optional(),
      publishedAt: dateSchema.optional(),
      updatedAt: dateSchema.optional(),
      slug: z.string().optional(),
      isPublished: z.boolean().optional().default(true),
      published: z.boolean().optional(), // Alternative field name used in some notes
      tags: z
        .union([z.array(z.string().trim().min(1)), z.null()])
        .optional()
        .transform((val) => {
          if (!val || val === null) return [];
          return val.filter((tag) => tag.length > 0);
        }),
      showToc: z.boolean().optional().default(true),
      type: z
        .union([z.array(z.string().trim().min(1)), z.null()])
        .optional()
        .transform((val) => val || []),
    })
    .transform((data) => ({
      ...data,
      // Use 'published' as fallback for isPublished if available
      isPublished: data.isPublished ?? data.published ?? true,
    }))
    .refine((data) => {
      // Ensure updatedAt is after publishedAt if both exist
      if (data.updatedAt && data.publishedAt) {
        return new Date(data.updatedAt) >= new Date(data.publishedAt);
      }
      return true;
    }, 'Updated date must be after published date'),
});

export const collections = { posts, notes };

export type Post = CollectionEntry<'posts'>;
export type Note = CollectionEntry<'notes'>;

// Extended types with additional metadata
export type PostWithType = Post & { type: 'post' };
export type NoteWithType = Note & { type: 'note' };
export type ContentItem = PostWithType | NoteWithType;
