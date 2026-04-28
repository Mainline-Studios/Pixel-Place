import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server/apiAuth';
import { getClientIp, hashIp } from '@/lib/moderation/ip';
import { isAdminActor, isModerator } from '@/lib/moderation/roles';
import { writeAuditLog } from '@/lib/moderation/audit';
import { setDocument, deleteDocument, COLLECTIONS, queryDocuments } from '@/lib/firestore';
import type { ModerationActionPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthenticatedUser(request);
    if (!actor || !isModerator(actor.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = (await request.json()) as ModerationActionPayload;
    const target = String(payload.targetUsername || '').trim().toLowerCase();
    if (!target || !payload.action) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const ipHash = hashIp(getClientIp(request));

    const adminOnly = ['shadow_ban', 'shadow_unban', 'ban'];
    if (adminOnly.includes(payload.action) && !isAdminActor(actor.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const now = Date.now();

    switch (payload.action) {
      case 'shadow_ban':
        await setDocument(COLLECTIONS.USERS, target, {
          shadow_banned: true,
          updated_at: now,
        });
        await writeAuditLog({
          actorUsername: actor.username,
          action: 'shadow_ban',
          targetType: 'user',
          targetId: target,
          metadata: { reason: payload.reason },
          ipHash,
        });
        break;

      case 'shadow_unban':
        await setDocument(COLLECTIONS.USERS, target, {
          shadow_banned: false,
          updated_at: now,
        });
        await writeAuditLog({
          actorUsername: actor.username,
          action: 'shadow_unban',
          targetType: 'user',
          targetId: target,
          ipHash,
        });
        break;

      case 'mute_chat': {
        const mins = payload.durationMinutes ?? 60;
        const until = now + mins * 60_000;
        await setDocument(COLLECTIONS.USERS, target, {
          chat_muted_until: until,
          updated_at: now,
        });
        await writeAuditLog({
          actorUsername: actor.username,
          action: 'mute_chat',
          targetType: 'user',
          targetId: target,
          metadata: { until, minutes: mins },
          ipHash,
        });
        break;
      }

      case 'unmute_chat':
        await setDocument(COLLECTIONS.USERS, target, {
          chat_muted_until: 0,
          updated_at: now,
        });
        await writeAuditLog({
          actorUsername: actor.username,
          action: 'unmute_chat',
          targetType: 'user',
          targetId: target,
          ipHash,
        });
        break;

      case 'clear_violations':
        await setDocument(COLLECTIONS.USERS, target, {
          chat_violation_score: 0,
          chat_strikes: 0,
          chat_strike_window_start: now,
          updated_at: now,
        });
        await writeAuditLog({
          actorUsername: actor.username,
          action: 'clear_violations',
          targetType: 'user',
          targetId: target,
          ipHash,
        });
        break;

      case 'ban': {
        if (!isAdminActor(actor.role))
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const existing = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', target);
        for (const b of existing) {
          await deleteDocument(COLLECTIONS.BANS, b.id);
        }
        await setDocument(COLLECTIONS.BANS, target, {
          username: payload.targetUsername,
          username_lower: target,
          reason: payload.reason || 'Moderation action',
          banned_by: actor.username,
          banned_at: now,
          expires_at:
            payload.durationMinutes && payload.durationMinutes > 0
              ? now + payload.durationMinutes * 60_000
              : undefined,
          permanent: !payload.durationMinutes,
          created_at: now,
        });
        await writeAuditLog({
          actorUsername: actor.username,
          action: 'ban',
          targetType: 'user',
          targetId: target,
          metadata: { durationMinutes: payload.durationMinutes },
          ipHash,
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[moderation/action]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
