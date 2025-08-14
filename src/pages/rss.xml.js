import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterAndSortContent } from '~/utils/content-operations';
import { getObsidianNotes } from '~/utils/get-obsidian-notes';
import { defaultMeta } from '~/config/site';

export async function GET(context) {
  const allPosts = await getCollection('posts');
  const sortedPosts = filterAndSortContent(allPosts, { respectDevMode: false });

  const allNotes = await getObsidianNotes();
  const sortedNotes = filterAndSortContent(allNotes, { respectDevMode: false });

  // Combine posts and notes, then sort by publishedAt date
  const allContent = [
    ...sortedPosts.map((post) => ({
      ...post.data,
      link: `/posts/${post.id}/`,
      type: 'post',
    })),
    ...sortedNotes.map((note) => ({
      ...note.data,
      link: `/notes/${note.id}/`,
      type: 'note',
    })),
  ];

  // Sort combined content by publishedAt date (newest first)
  const sortedContent = allContent.sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  return rss({
    title: defaultMeta.title,
    description: defaultMeta.description,
    site: context.site,
    items: sortedContent,
  });
}
