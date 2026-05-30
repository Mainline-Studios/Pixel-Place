export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import {
  listHardwareBans,
  addHardwareBan,
  removeHardwareBan,
} from '@/lib/hardwareBans';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const list = await listHardwareBans();
    return NextResponse.json(list);
  } catch (e) {
    console.error('Hardware bans GET:', e);
    return NextResponse.json({ error: 'Failed to list hardware bans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const body = await request.json().catch(() => ({}));
    const { deviceId, reason, banKind, terminated, terminatedSubject } = body as {
      deviceId?: string;
      reason?: string;
      banKind?: string;
      terminated?: boolean;
      terminatedSubject?: string;
    };
    if (!deviceId || typeof deviceId !== 'string') {
      return NextResponse.json({ error: 'deviceId required' }, { status: 400 });
    }
    const mode =
      banKind === 'terminated' || terminated === true ? ('terminated' as const) : ('hardware' as const);
    const result = await addHardwareBan(deviceId, auth.user.username, {
      reason,
      mode,
      terminatedSubject,
    });
    return NextResponse.json({
      success: true,
      bannedUsernames: result.bannedUsernames,
    });
  } catch (e) {
    console.error('Hardware ban POST:', e);
    return NextResponse.json({ error: 'Failed to add hardware ban' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId required' }, { status: 400 });
    }
    const result = await removeHardwareBan(deviceId);
    return NextResponse.json({
      success: true,
      unbannedUsernames: result.unbannedUsernames,
    });
  } catch (e) {
    console.error('Hardware ban DELETE:', e);
    return NextResponse.json({ error: 'Failed to remove hardware ban' }, { status: 500 });
  }
}
