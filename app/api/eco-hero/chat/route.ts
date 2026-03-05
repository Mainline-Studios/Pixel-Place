export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for Eco Hero game — Claude (Anthropic) calls.
 * API key is read from env (Firebase/Google Cloud); never exposed to the client.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Eco Hero AI not configured (ANTHROPIC_API_KEY missing)' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const system = typeof body.system === 'string' ? body.system : '';
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const maxTokens = typeof body.max_tokens === 'number' ? body.max_tokens : 120;

    if (!system || messages.length === 0) {
      return NextResponse.json(
        { error: 'system and messages required' },
        { status: 400 }
      );
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401) {
        return NextResponse.json(
          { error: 'AI Citizens: Auth failed (check ANTHROPIC_API_KEY)' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: errText || `Anthropic error ${res.status}` },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.[0]?.type === 'text' ? (data.content[0].text ?? '').trim() : '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Eco Hero chat proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy error' },
      { status: 500 }
    );
  }
}
