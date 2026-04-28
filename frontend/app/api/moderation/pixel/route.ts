import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server/apiAuth';
import { getClientIp, hashIp } from '@/lib/moderation/ip';
import { allowPixelPlacement } from '@/lib/moderation/rateLimit';
import { evaluatePixelPayload } from '@/lib/moderation/filters';
import { recordPixelHit } from '@/lib/moderation/flood';
import { logIpEvent } from '@/lib/moderation/ipEvents';
import { setDocument, COLLECTIONS } from '@/lib/firestore';

/**
 * Canonical pixel placement endpoint for canvas games.
 * Games should POST here so rate limits & abuse checks apply uniformly.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const uKey = user.username.toLowerCase();

    await setDocument(COLLECTIONS.USERS, uKey, {
      last_ip_hash: ipHash,
      updated_at: Date.now(),
    });

    if (user.shadowBanned) {
      await logIpEvent(uKey, ipHash, 'pixel_shadow', { blocked: true });
      return NextResponse.json({ ok: true, accepted: false, reason: 'shadow_ban' });
    }

    if (!allowPixelPlacement(uKey, ipHash)) {
      await logIpEvent(uKey, ipHash, 'pixel_rate_limit', {});
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const evalPx = evaluatePixelPayload(body);
    if (!evalPx.ok) {
      await logIpEvent(uKey, ipHash, 'pixel_abuse', { reason: evalPx.reason });
      return NextResponse.json({ error: evalPx.reason }, { status: 400 });
    }

    const x = Number(body.x);
    const y = Number(body.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      const flood = recordPixelHit(uKey, x, y);
      if (!flood.ok) {
        await logIpEvent(uKey, ipHash, 'pixel_flood', { x, y });
        return NextResponse.json({ error: 'flooding_detected' }, { status: 429 });
      }
    }

    await logIpEvent(uKey, ipHash, 'pixel_ok', { canvasId: body.canvasId });

    return NextResponse.json({
      ok: true,
      accepted: true,
      echo: {
        canvasId: body.canvasId,
        x: body.x,
        y: body.y,
        color: body.color,
      },
    });
  } catch (e) {
    console.error('[moderation/pixel]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
