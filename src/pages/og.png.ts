import type { APIRoute } from 'astro';
import { defaultMeta } from '~/config/site';
import { generateOgImage } from '~/utils/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage({
    title: 'shovanch.com',
    description: defaultMeta.description,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
