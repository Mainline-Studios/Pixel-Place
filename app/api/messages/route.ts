import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Message } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

async function readMessages(): Promise<Message[]> {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeMessages(messages: Message[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
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

    const messages = await readMessages();

    let filteredMessages: Message[];
    if (withUsername) {
      // Get messages between two users
      filteredMessages = messages.filter(
        msg =>
          (msg.from.toLowerCase() === username.toLowerCase() && msg.to.toLowerCase() === withUsername.toLowerCase()) ||
          (msg.to.toLowerCase() === username.toLowerCase() && msg.from.toLowerCase() === withUsername.toLowerCase())
      );
    } else {
      // Get all messages for the user
      filteredMessages = messages.filter(
        msg =>
          msg.from.toLowerCase() === username.toLowerCase() || msg.to.toLowerCase() === username.toLowerCase()
      );
    }

    // Sort by timestamp
    filteredMessages.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json(filteredMessages);
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

    const messages = await readMessages();

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: fromUsername,
      to: toUsername,
      message: message.trim(),
      timestamp: Date.now(),
      read: false
    };

    messages.push(newMessage);
    await writeMessages(messages);

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

    const messages = await readMessages();
    const messageIndex = messages.findIndex(msg => msg.id === id);

    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    messages[messageIndex].read = read !== undefined ? read : true;
    await writeMessages(messages);

    return NextResponse.json(messages[messageIndex]);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

