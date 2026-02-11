import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, addDocument, updateDocument, queryDocuments, COLLECTIONS, getFirestoreInstance } from '@/lib/firestore';
import { Message } from '@/types';

function messageFromDoc(doc: any): Message {
  return {
    id: doc.id,
    from: doc.from_username,
    to: doc.to_username,
    message: doc.message,
    timestamp: doc.created_at || doc.timestamp || Date.now(),
    read: doc.read === true
=======
import { getDb } from '@/lib/db';
import { Message } from '@/types';

function messageFromRow(row: any): Message {
  return {
    id: row.id.toString(),
    from: row.from_username,
    to: row.to_username,
    message: row.message,
    timestamp: row.created_at * 1000, // Convert to milliseconds
    read: row.read === 1
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
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

<<<<<<< HEAD
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
      return NextResponse.json(messages);
    } else {
      // Get all messages for the user
      query = db.collection(COLLECTIONS.MESSAGES)
        .where('from_username_lower', '==', username.toLowerCase())
        .orderBy('created_at', 'asc');
    }

    const snapshot = await query.get();
    const messages = snapshot.docs.map(doc => messageFromDoc({ id: doc.id, ...doc.data() }));
    
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

=======
    const db = getDb();
    let rows: any[];
    
    if (withUsername) {
      // Get messages between two users
      rows = db.prepare(`
        SELECT * FROM messages
        WHERE (LOWER(from_username) = LOWER(?) AND LOWER(to_username) = LOWER(?))
           OR (LOWER(to_username) = LOWER(?) AND LOWER(from_username) = LOWER(?))
        ORDER BY created_at ASC
      `).all(username, withUsername, username, withUsername);
    } else {
      // Get all messages for the user
      rows = db.prepare(`
        SELECT * FROM messages
        WHERE LOWER(from_username) = LOWER(?) OR LOWER(to_username) = LOWER(?)
        ORDER BY created_at ASC
      `).all(username, username);
    }

    const messages = rows.map(messageFromRow);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    return NextResponse.json(messages);
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

<<<<<<< HEAD
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
=======
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO messages (from_username, to_username, message, read)
      VALUES (?, ?, ?, 0)
    `).run(fromUsername, toUsername, message.trim());

    const newMessage: Message = {
      id: result.lastInsertRowid.toString(),
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
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

<<<<<<< HEAD
    await updateDocument(COLLECTIONS.MESSAGES, id, {
      read: read !== undefined ? read : true
    });
    
    const messages = await getDocuments(COLLECTIONS.MESSAGES);
    const message = messages.find(m => m.id === id);
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    return NextResponse.json(messageFromDoc({ ...message, read: read !== undefined ? read : true }));
=======
    const db = getDb();
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(parseInt(id));
    
    if (!row) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    db.prepare('UPDATE messages SET read = ? WHERE id = ?').run(read !== undefined ? (read ? 1 : 0) : 1, parseInt(id));
    
    const updatedMessage = messageFromRow({ ...row, read: read !== undefined ? (read ? 1 : 0) : 1 });
    return NextResponse.json(updatedMessage);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
<<<<<<< HEAD
=======

>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
