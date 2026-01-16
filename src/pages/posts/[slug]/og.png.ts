import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { generateOgImage } from '~/utils/og-image';

type Props = {
  post: CollectionEntry<'posts'>;
};

export const GET: APIRoute<Props> = async ({ props }) => {
  const { post } = props;

  const png = await generateOgImage({
    title: post.data.title,
    description: post.data.summary,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

// Generate an image for each blog post in a collection
export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}
