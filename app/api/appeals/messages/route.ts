export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getDocument, addDocument, COLLECTIONS } from '@/lib/firestore';
import { requireAdmin } from '@/lib/middleware';
import { getAppealBotReply } from '@/lib/appealBot';
import type { AppealMessage } from '@/types';

function messageFromDoc(doc: any): AppealMessage {
  return {
    id: doc.id,
    appealId: doc.appeal_id,
    fromUsername: doc.from_username,
    message: doc.message,
    timestamp: doc.created_at || doc.timestamp || 0,
  };
}

/** GET messages for an appeal. Allowed: appeal owner (query param username matches appeal) or admin. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appealId = searchParams.get('appealId');
    const username = searchParams.get('username');
    const deviceId = searchParams.get('deviceId');
    if (!appealId) {
      return NextResponse.json({ error: 'appealId required' }, { status: 400 });
    }

    const appealDoc = await getDocument(COLLECTIONS.BAN_APPEALS, appealId);
    if (!appealDoc) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }

    const auth = requireAdmin(request);
    const isAdmin = !auth.error && !!auth.user;
    const isOwnerByUsername = username && appealDoc.username.toLowerCase() === username.toLowerCase();
    const isOwnerByDevice = deviceId && appealDoc.device_id === deviceId;
    const isOwner = isOwnerByUsername || isOwnerByDevice;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const docs = await getDocuments(COLLECTIONS.APPEAL_MESSAGES, (ref: any) =>
      ref.where('appeal_id', '==', appealId)
    );
    docs.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
    const messages = docs.map((doc) => messageFromDoc(doc));
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error getting appeal messages:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

/** POST a user message and get an AI reply. Allowed: appeal owner only. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { appealId, username, message } = body as { appealId?: string; username?: string; message?: string };
    if (!appealId || !username || !message?.trim()) {
      return NextResponse.json({ error: 'appealId, username, and message required' }, { status: 400 });
    }

    const appealDoc = await getDocument(COLLECTIONS.BAN_APPEALS, appealId);
    if (!appealDoc) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }
    if (appealDoc.username.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (appealDoc.status !== 'pending') {
      return NextResponse.json({ error: 'Appeal is no longer pending' }, { status: 400 });
    }

    const now = Date.now();
    await addDocument(COLLECTIONS.APPEAL_MESSAGES, {
      appeal_id: appealId,
      from_username: username,
      message: message.trim(),
      created_at: now,
    });

    const banDoc = appealDoc.ban_id
      ? await getDocument(COLLECTIONS.BANS, appealDoc.ban_id)
      : null;
    const banReason = banDoc?.reason || 'Not specified';
    const bannedBy = banDoc?.banned_by || 'System';

    const existingMessages = await getDocuments(COLLECTIONS.APPEAL_MESSAGES, (ref: any) =>
      ref.where('appeal_id', '==', appealId)
    );
    existingMessages.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
    const history = existingMessages.map((m) => ({
      from: m.from_username,
      message: m.message,
    }));
    const botReply = await getAppealBotReply(banReason, username, bannedBy, history);
    await addDocument(COLLECTIONS.APPEAL_MESSAGES, {
      appeal_id: appealId,
      from_username: 'appeal_bot',
      message: botReply,
      created_at: now + 1,
    });

    const docs = await getDocuments(COLLECTIONS.APPEAL_MESSAGES, (ref: any) =>
      ref.where('appeal_id', '==', appealId)
    );
    docs.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
    const messages = docs.map((doc) => messageFromDoc(doc));
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error posting appeal message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
