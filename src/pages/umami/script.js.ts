import type { APIRoute } from 'astro';
import { isDevEnv } from '~/utils/is-dev-env';

export const UMAMI_HOST = 'https://cloud.umami.is';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  if (isDevEnv) {
    return new Response('Umami API is disabled in development mode', {
      status: 200,
    });
  }

  // strip the "/umami" prefix
  const upstreamPath = url.pathname.replace('/umami', '');
  const upstreamUrl = `${UMAMI_HOST}${upstreamPath}${url.search}`;

  const upstream = await fetch(upstreamUrl);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/javascript',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
