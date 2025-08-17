import { NextRequest, NextResponse } from 'next/server';

const UMAMI_HOST = 'https://cloud.umami.is';

export const config = {
  // Intercept only proxy namespace
  matcher: ['/umami/:path*'],
};

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Map /umami/*  ->  <UMAMI_HOST>/*
  const upstreamPath = pathname.replace('/umami', '');
  const upstreamUrl = `${UMAMI_HOST}${upstreamPath}${search}`;

  return NextResponse.rewrite(upstreamUrl);
}
