export const dynamic = 'force-static';

import { NextResponse } from 'next/server';

/**
 * With output: 'export', route handlers cannot access request (headers/url) and remain
 * statically buildable. This stub returns 401 so the build succeeds. For the admin
 * "devices per user" feature to work, point the client to a backend that implements
 * GET /api/users/devices?username=... with admin auth (e.g. set NEXT_PUBLIC_API_URL).
 */
export async function GET() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
