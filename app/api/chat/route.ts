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

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'Chat not available (no API key configured)' }, { status: 503 });
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
