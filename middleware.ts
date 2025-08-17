// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server';

const umamiScriptUrl = 'https://cloud.umami.is/script.js';

export const config = {
  // only intercept umami proxy namespace
  matcher: ['/umami/:path*'],
};

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === '/umami/script.js') {
    // proxy tracker script
    return NextResponse.rewrite(`${umamiScriptUrl}${search}`);
  }

  if (pathname.startsWith('/umami/api/send')) {
    // proxy event ingestion
    const dest = `${umamiScriptUrl}${pathname.replace('/umami', '')}${search}`;
    return NextResponse.rewrite(dest);
  }

  return NextResponse.next();
}
