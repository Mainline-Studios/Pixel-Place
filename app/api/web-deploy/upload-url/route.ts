export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';

/** Signed uploads are handled by Cloud Functions in production (`/api/**` rewrite). */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Use production API for Web Deploy file uploads' },
    { status: 501 },
  );
}
