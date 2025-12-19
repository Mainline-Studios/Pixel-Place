import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Block direct access to /data folder
  if (request.nextUrl.pathname.startsWith('/data')) {
    return NextResponse.json(
      { error: 'Forbidden - Direct access to data folder is not allowed' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/data/:path*',
};
