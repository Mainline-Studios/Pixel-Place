\ copilot/integrate-pyx-ai-moderation
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
=======
export const dynamic = 'force-static';


import { NextRequest, NextResponse } from 'next/server';
import { filterForDisplayAIDecideServer } from '@/lib/pyx';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

 copilot/integrate-pyx-ai-moderation
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
=======
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
  return NextResponse.json({ error: 'Chat not available (no API key configured)' }, { status: 503 });
 main
    }

    const systemMsg = {
      role: 'system',
      content: 'You are a helpful game design assistant. Help the user design their 3D game. Discuss mechanics, visuals, controls, objectives. Be concise. Ask clarifying questions. When they describe a game idea, suggest improvements and details.',
    };
    const apiMessages = [systemMsg, ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || 'I had trouble responding. Try again.';
    const content = await filterForDisplayAIDecideServer(raw);
    return NextResponse.json({ content });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
