import { NextRequest, NextResponse } from 'next/server';
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

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO messages (from_username, to_username, message, read)
      VALUES (?, ?, ?, 0)
    `).run(fromUsername, toUsername, message.trim());

    const newMessage: Message = {
      id: result.lastInsertRowid.toString(),
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

    const db = getDb();
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(parseInt(id));
    
    if (!row) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    db.prepare('UPDATE messages SET read = ? WHERE id = ?').run(read !== undefined ? (read ? 1 : 0) : 1, parseInt(id));
    
    const updatedMessage = messageFromRow({ ...row, read: read !== undefined ? (read ? 1 : 0) : 1 });
    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

