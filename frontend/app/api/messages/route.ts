import { NextRequest, NextResponse } from 'next/server';
import {
  getDocuments,
  addDocument,
  updateDocument,
  COLLECTIONS,
  getFirestoreInstance,
  setDocument,
  getDocument,
} from '@/lib/firestore';
import { filterForDisplayServer } from '@/lib/pyx';
import { Message } from '@/types';
import { getAuthenticatedUser } from '@/lib/server/apiAuth';
import { moderateOutgoingText } from '@/lib/moderation/filters';
import { recordChatViolation } from '@/lib/moderation/violations';
import { allowChatMessage } from '@/lib/moderation/rateLimit';
import { getClientIp, hashIp } from '@/lib/moderation/ip';
import { logIpEvent } from '@/lib/moderation/ipEvents';

function messageFromDoc(doc: any): Message {
  return {
    id: doc.id,
    from: doc.from_username,
    to: doc.to_username,
    message: doc.message,
    timestamp: doc.created_at || doc.timestamp || Date.now(),
    read: doc.read === true,
  };
}

/** Shadow DMs: recipient must not see incoming messages flagged as shadow-suppressed from others. */
function dmVisibleRaw(doc: any, viewerLower: string): boolean {
  if (!doc.dm_shadow_suppressed) return true;
  if (doc.to_username_lower !== viewerLower) return true;
  return doc.from_username_lower === viewerLower;
}

// GET - Get messages for a user (all or with a specific user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const withUsername = searchParams.get('with');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const viewerLower = username.toLowerCase();
    const db = getFirestoreInstance();

    if (withUsername) {
      const sentQuery = db.collection(COLLECTIONS.MESSAGES)
        .where('from_username_lower', '==', viewerLower)
        .where('to_username_lower', '==', withUsername.toLowerCase())
        .orderBy('created_at', 'asc');
      const receivedQuery = db.collection(COLLECTIONS.MESSAGES)
        .where('from_username_lower', '==', withUsername.toLowerCase())
        .where('to_username_lower', '==', viewerLower)
        .orderBy('created_at', 'asc');

      const [sentSnapshot, receivedSnapshot] = await Promise.all([sentQuery.get(), receivedQuery.get()]);
      const docs = [...sentSnapshot.docs, ...receivedSnapshot.docs].filter((d) =>
        dmVisibleRaw(d.data(), viewerLower)
      );
      const messages = docs
        .map((doc) => messageFromDoc({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp - b.timestamp);

      const filtered = await Promise.all(
        messages.map(async (m) => ({
          ...m,
          message: await filterForDisplayServer(m.message),
        }))
      );
      return NextResponse.json(filtered);
    }

    let query = db.collection(COLLECTIONS.MESSAGES)
      .where('from_username_lower', '==', viewerLower)
      .orderBy('created_at', 'asc');

    const snapshot = await query.get();
    let messages = snapshot.docs
      .filter((d) => dmVisibleRaw(d.data(), viewerLower))
      .map((doc) => messageFromDoc({ id: doc.id, ...doc.data() }));

    const receivedQuery = db.collection(COLLECTIONS.MESSAGES)
      .where('to_username_lower', '==', viewerLower)
      .orderBy('created_at', 'asc');
    const receivedSnapshot = await receivedQuery.get();
    const receivedMessages = receivedSnapshot.docs
      .filter((d) => dmVisibleRaw(d.data(), viewerLower))
      .map((doc) => messageFromDoc({ id: doc.id, ...doc.data() }));

    messages.push(...receivedMessages);
    messages.sort((a, b) => a.timestamp - b.timestamp);

    const filtered = await Promise.all(
      messages.map(async (m) => ({
        ...m,
        message: await filterForDisplayServer(m.message),
      }))
    );
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

// POST - Send a message (moderation enforced server-side)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromUsername, toUsername, message } = body;

    if (!fromUsername || !toUsername || !message) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    const authUser = await getAuthenticatedUser(request);
    if (authUser && authUser.username.toLowerCase() !== fromUsername.toLowerCase()) {
      return NextResponse.json({ error: 'Sender must match authenticated user' }, { status: 403 });
    }

    const fromKey = fromUsername.toLowerCase();
    const sender = await getDocument(COLLECTIONS.USERS, fromKey);
    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    await setDocument(COLLECTIONS.USERS, fromKey, {
      last_ip_hash: ipHash,
      updated_at: Date.now(),
    });

    const muteUntil =
      typeof sender.chat_muted_until === 'number' ? sender.chat_muted_until : 0;
    if (muteUntil > Date.now()) {
      return NextResponse.json({ error: 'muted', until: muteUntil }, { status: 429 });
    }

    if (!allowChatMessage(fromKey, ipHash)) {
      await logIpEvent(fromKey, ipHash, 'dm_rate_limit', {});
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const mod = await moderateOutgoingText(message.trim());
    if (!mod.ok) {
      await recordChatViolation(fromKey);
      await logIpEvent(fromKey, ipHash, 'dm_blocked', { reason: mod.reason });
      return NextResponse.json({ error: 'message_rejected', reason: mod.reason }, { status: 400 });
    }

    const shadow = sender.shadow_banned === true;

    const messageId = await addDocument(COLLECTIONS.MESSAGES, {
      from_username: fromUsername,
      from_username_lower: fromKey,
      to_username: toUsername,
      to_username_lower: toUsername.toLowerCase(),
      message: mod.filteredText,
      read: false,
      created_at: Date.now(),
      dm_shadow_suppressed: shadow,
      ip_hash: ipHash,
    });

    const newMessage: Message = {
      id: messageId,
      from: fromUsername,
      to: toUsername,
      message: mod.filteredText,
      timestamp: Date.now(),
      read: false,
    };

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PUT - Mark message as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    await updateDocument(COLLECTIONS.MESSAGES, id, {
      read: read !== undefined ? read : true,
    });

    const messages = await getDocuments(COLLECTIONS.MESSAGES);
    const message = messages.find((m) => m.id === id);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(messageFromDoc({ ...message, read: read !== undefined ? read : true }));
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
