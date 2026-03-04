export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { getDevicesForUser } from '@/lib/hardwareBans';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { username } = await params;
    if (!username) {
      return NextResponse.json({ error: 'username required' }, { status: 400 });
    }
    const devices = await getDevicesForUser(username);
    return NextResponse.json(devices);
  } catch (e) {
    console.error('User devices GET:', e);
    return NextResponse.json({ error: 'Failed to get devices' }, { status: 500 });
  }
}
