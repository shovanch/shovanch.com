import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { defaultMeta } from '~/config/site';
import { filterAndSortContent } from '~/utils/content-operations';
import { getObsidianNotes } from '~/utils/get-obsidian-notes';

export async function GET(context) {
  const allPosts = await getCollection('posts');
  const sortedPosts = filterAndSortContent(allPosts, { respectDevMode: false });

  const allNotes = await getObsidianNotes();
  const sortedNotes = filterAndSortContent(allNotes, { respectDevMode: false });

  // Combine posts and notes, then sort by publishedAt date
  const allContent = [
    ...sortedPosts.map((post) => ({
      title: post.data.title,
      link: `/posts/${post.id}/`,
      description: post.data.summary || '',
      pubDate: new Date(post.data.publishedAt),
      categories: post.data.tags || [],
      author: defaultMeta.author,
      guid: `/posts/${post.id}/`,
    })),
    ...sortedNotes.map((note) => ({
      title: note.data.title,
      link: `/notes/${note.id}/`,
      description: note.data.summary || '',
      pubDate: new Date(note.data.publishedAt),
      categories: note.data.tags || [],
      author: defaultMeta.author,
      guid: `/notes/${note.id}/`,
    })),
  ];

  // Sort combined content by publishedAt date (newest first)
  const sortedContent = allContent.sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: defaultMeta.title,
    description: defaultMeta.description,
    site: context.site,
    customData: `
      <language>en-US</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <generator>Astro</generator>
      <webMaster>${defaultMeta.email} (${defaultMeta.author})</webMaster>
      <managingEditor>${defaultMeta.email} (${defaultMeta.author})</managingEditor>
      <copyright>Copyright ${new Date().getFullYear()} ${defaultMeta.author}</copyright>
      <image>
        <url>${context.site}favicon.ico</url>p
        <title>${defaultMeta.title}</title>
        <link>${context.site}</link>
        <width>32</width>
        <height>32</height>
      </image>
    `,
    items: sortedContent,
    xmlns: {
      content: 'http://purl.org/rss/1.0/modules/content/',
      wfw: 'http://wellformedweb.org/CommentAPI/',
      dc: 'http://purl.org/dc/elements/1.1/',
      atom: 'http://www.w3.org/2005/Atom',
      sy: 'http://purl.org/rss/1.0/modules/syndication/',
      slash: 'http://purl.org/rss/1.0/modules/slash/',
    },
  });
}
