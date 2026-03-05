export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, addDocument, updateDocument, queryDocuments, COLLECTIONS, getFirestoreInstance } from '@/lib/firestore';
import { filterForDisplayServer } from '@/lib/pyx';
import { Message } from '@/types';
import { moderateContent } from '@/lib/moderateContent';

function messageFromDoc(doc: any): Message {
  return {
    id: doc.id,
    from: doc.from_username,
    to: doc.to_username,
    message: doc.message,
    timestamp: doc.created_at || doc.timestamp || Date.now(),
    read: doc.read === true
  };
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

    const db = getFirestoreInstance();
    let query: any;
    
    if (withUsername) {
      // Get messages between two users - Firestore doesn't support multiple 'in' queries easily
      // So we'll get messages where user is sender or receiver and filter
      const sentQuery = db.collection(COLLECTIONS.MESSAGES)
        .where('from_username_lower', '==', username.toLowerCase())
        .where('to_username_lower', '==', withUsername.toLowerCase())
        .orderBy('created_at', 'asc');
      const receivedQuery = db.collection(COLLECTIONS.MESSAGES)
        .where('from_username_lower', '==', withUsername.toLowerCase())
        .where('to_username_lower', '==', username.toLowerCase())
        .orderBy('created_at', 'asc');
      
      const [sentSnapshot, receivedSnapshot] = await Promise.all([sentQuery.get(), receivedQuery.get()]);
      const messages = [
        ...sentSnapshot.docs.map(doc => messageFromDoc({ id: doc.id, ...doc.data() })),
        ...receivedSnapshot.docs.map(doc => messageFromDoc({ id: doc.id, ...doc.data() }))
      ];
      messages.sort((a, b) => a.timestamp - b.timestamp);
      const filtered = await Promise.all(messages.map(async (m) => ({
        ...m,
        message: await filterForDisplayServer(m.message),
      })));
      return NextResponse.json(filtered);
    } else {
      // Get all messages for the user
      query = db.collection(COLLECTIONS.MESSAGES)
        .where('from_username_lower', '==', username.toLowerCase())
        .orderBy('created_at', 'asc');
    }

    const snapshot = await query.get();
    let messages = snapshot.docs.map(doc => messageFromDoc({ id: doc.id, ...doc.data() }));
    
    // If no withUsername, also get messages where user is recipient
    if (!withUsername) {
      const receivedQuery = db.collection(COLLECTIONS.MESSAGES)
        .where('to_username_lower', '==', username.toLowerCase())
        .orderBy('created_at', 'asc');
      const receivedSnapshot = await receivedQuery.get();
      const receivedMessages = receivedSnapshot.docs.map(doc => messageFromDoc({ id: doc.id, ...doc.data() }));
      messages.push(...receivedMessages);
      messages.sort((a, b) => a.timestamp - b.timestamp);
    }

    const filtered = await Promise.all(messages.map(async (m) => ({
      ...m,
      message: await filterForDisplayServer(m.message),
    })));
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

// POST - Send a message
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

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Moderation check
    const modResult = await moderateContent(message, fromUsername, 'private_message');
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

    const messageId = await addDocument(COLLECTIONS.MESSAGES, {
      from_username: fromUsername,
      from_username_lower: fromUsername.toLowerCase(),
      to_username: toUsername,
      to_username_lower: toUsername.toLowerCase(),
      message: message.trim(),
      read: false,
      created_at: Date.now()
    });

    const newMessage: Message = {
      id: messageId,
      from: fromUsername,
      to: toUsername,
      message: message.trim(),
      timestamp: Date.now(),
      read: false
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
      read: read !== undefined ? read : true
    });
    
    const messages = await getDocuments(COLLECTIONS.MESSAGES);
    const message = messages.find(m => m.id === id);
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    return NextResponse.json(messageFromDoc({ ...message, read: read !== undefined ? read : true }));
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
