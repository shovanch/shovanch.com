import { NextResponse } from 'next/server';

const UMAMI_HOST = 'https://cloud.umami.is'; //

export const config = {
  matcher: ['/umami/:path*'],
};

export default function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const upstreamPath = pathname.replace('/umami', '');
  const upstreamUrl = `${UMAMI_HOST}${upstreamPath}${search}`;
  return NextResponse.rewrite(upstreamUrl);
}
