import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, setDocument } from '@/lib/firestore';
import { moderateContent } from '@/lib/moderateContent';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'global';
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ messages: [] });
    }

    const messagesRef = db.collection(COLLECTIONS.CHAT_MESSAGES)
      .where('channel', '==', channel)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await messagesRef.get();
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();

    return NextResponse.json({ messages, channel });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, channel, message, type } = await request.json();

    if (!username || !channel || !message) {
      return NextResponse.json({ error: 'Username, channel, and message required' }, { status: 400 });
    }

    // Moderation check
    const modResult = await moderateContent(message, username, 'global_chat');
    if (!modResult.safe) {
      return NextResponse.json({ 
        error: 'Message blocked due to content violation',
        warning: modResult.warning,
        warningsThisMonth: modResult.warningsThisMonth,
        score: modResult.score,
        severity: modResult.severity,
        banned: modResult.banned || false
      }, { status: 403 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const chatMessage = {
      username,
      username_lower: username.toLowerCase(),
      channel,
      message: message.substring(0, 500),
      type: type || 'text',
      timestamp: Date.now(),
      read: false
    };

    const docRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
    await setDocument(COLLECTIONS.CHAT_MESSAGES, docRef.id, chatMessage);

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
