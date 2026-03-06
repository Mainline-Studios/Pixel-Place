import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Block direct access to /data folder and any data files
  if (
    pathname.startsWith('/data') ||
    pathname.includes('/data/') ||
    pathname.endsWith('.json') && pathname.includes('users') ||
    pathname.endsWith('.json') && pathname.includes('bans') ||
    pathname.endsWith('.json') && pathname.includes('reports')
  ) {
    return NextResponse.json(
      { 
        error: 'Forbidden',
        message: 'Direct access to data files is not allowed. All data is accessed through secure API endpoints.'
      },
      { status: 403 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/data/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
