import type { APIRoute } from 'astro';
import { isDevEnv } from '~/utils/is-dev-env.js';
import { UMAMI_HOST } from '../script.js';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
  if (isDevEnv) {
    return new Response('Umami API is disabled in development mode', {
      status: 200,
    });
  }

  // Forward the request to Umami's /api/send endpoint
  const upstreamUrl = `${UMAMI_HOST}/api/send`;

  const res = await fetch(upstreamUrl, {
    method: request.method,
    headers: {
      'content-type': request.headers.get('content-type') ?? 'application/json',
    },
    body: ['GET', 'HEAD'].includes(request.method)
      ? undefined
      : await request.text(),
  });

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'application/json',
      'Cache-Control': res.headers.get('cache-control') ?? 'no-store',
    },
  });
};
