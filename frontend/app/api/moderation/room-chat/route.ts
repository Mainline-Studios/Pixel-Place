import { NextRequest, NextResponse } from 'next/server';
import { addDocument, queryDocuments, COLLECTIONS, getFirestoreInstance } from '@/lib/firestore';
import { getAuthenticatedUser } from '@/lib/server/apiAuth';
import { getClientIp, hashIp } from '@/lib/moderation/ip';
import { allowChatMessage } from '@/lib/moderation/rateLimit';
import { moderateOutgoingText } from '@/lib/moderation/filters';
import { recordChatViolation } from '@/lib/moderation/violations';
import { logIpEvent } from '@/lib/moderation/ipEvents';
import { setDocument } from '@/lib/firestore';

/** Real-time capable: clients poll or use Firestore onSnapshot on `chat_messages`. */

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const uKey = user.username.toLowerCase();

    await setDocument(COLLECTIONS.USERS, uKey, {
      last_ip_hash: ipHash,
      updated_at: Date.now(),
    });

    if (user.chatMutedUntil && user.chatMutedUntil > Date.now()) {
      return NextResponse.json({ error: 'muted', until: user.chatMutedUntil }, { status: 429 });
    }

    if (!allowChatMessage(uKey, ipHash)) {
      await logIpEvent(uKey, ipHash, 'chat_rate_limit', {});
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const roomId = String(body.roomId || '').trim();
    const rawText = String(body.message || '').trim();
    if (!roomId || !rawText) {
      return NextResponse.json({ error: 'roomId and message required' }, { status: 400 });
    }

    const mod = await moderateOutgoingText(rawText);
    if (!mod.ok) {
      await recordChatViolation(uKey);
      await logIpEvent(uKey, ipHash, 'chat_blocked', { reason: mod.reason, roomId });
      return NextResponse.json({ error: 'message_rejected', reason: mod.reason }, { status: 400 });
    }

    const docId = await addDocument(COLLECTIONS.CHAT_MESSAGES, {
      room_id: roomId,
      author_username: user.username,
      author_username_lower: uKey,
      message: mod.filteredText,
      created_at: Date.now(),
      shadow_suppressed: user.shadowBanned === true,
      ip_hash: ipHash,
    });

    return NextResponse.json({ id: docId, message: mod.filteredText });
  } catch (e) {
    console.error('[room-chat POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const viewerName = searchParams.get('viewer');
    if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });

    const db = getFirestoreInstance();
    if (!db) return NextResponse.json([]);

    const snap = await db
      .collection(COLLECTIONS.CHAT_MESSAGES)
      .where('room_id', '==', roomId)
      .limit(120)
      .get();

    const viewerLower = viewerName?.toLowerCase() || '';

    const rows = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((row: any) => {
        if (!row.shadow_suppressed) return true;
        const author = String(row.author_username_lower || '');
        return author === viewerLower;
      })
      .sort(
        (a: any, b: any) => (a.created_at || 0) - (b.created_at || 0)
      );

    return NextResponse.json(rows);
  } catch (e) {
    console.error('[room-chat GET]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
