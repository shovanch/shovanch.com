import type { APIRoute } from 'astro';
import { UMAMI_HOST } from '../script.js';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
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
