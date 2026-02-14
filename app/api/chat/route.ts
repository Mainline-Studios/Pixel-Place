import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, setDocument } from '@/lib/firestore';
import { moderateContent } from '@/lib/moderation';
import { processModerationResult } from '@/lib/warnings';

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

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // MODERATION CHECK - Check content before saving
    const moderationResult = await moderateContent(message, username, `global_chat:${channel}`);
    
    // If content violates rules, process the warning/ban
    if (!moderationResult.safe) {
      const { warning, banned, warningCount } = await processModerationResult(
        username,
        message,
        moderationResult,
        `global_chat:${channel}`
      );

      // If message should be blocked, don't save it
      if (moderationResult.blocked) {
        return NextResponse.json({
          error: 'Message blocked due to content violation',
          violations: moderationResult.violations,
          severity: moderationResult.severity,
          warning: warning,
          banned: banned,
          warningCount: warningCount,
          message: banned 
            ? 'You have been automatically banned for multiple violations this month.'
            : `Warning ${warningCount}/${2}: ${moderationResult.message}. ${2 - warningCount} more warning(s) this month will result in a permanent ban.`
        }, { status: 403 });
      }
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

    // If there was a low-severity warning, include it in the success response
    if (!moderationResult.safe && !moderationResult.blocked) {
      const { warning, warningCount } = await processModerationResult(
        username,
        message,
        moderationResult,
        `global_chat:${channel}`
      );
      
      return NextResponse.json({
        success: true,
        warning: warning,
        warningCount: warningCount,
        message: chatMessage,
        warningMessage: `Warning ${warningCount}/${2}: Your message contains inappropriate content. ${2 - warningCount} more warning(s) this month will result in a permanent ban.`
      });
    }

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
