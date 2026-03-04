export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';

const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';

/**
 * Pyx Code — completion. Proxies to Pyx POST /code/complete.
 * POST { prompt: string, max_tokens?: number } → { completion: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
    const maxTokens = typeof body?.max_tokens === 'number' ? body.max_tokens : 256;
    const url = process.env.PYX_SERVICE_URL || PYX_DEFAULT_URL;

    if (!prompt) {
      return NextResponse.json({ completion: '' });
    }

    const res = await fetch(`${url.replace(/\/$/, '')}/code/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_tokens: maxTokens }),
    });

    if (!res.ok) {
      return NextResponse.json({ completion: '', connectionError: true });
    }

    const data = (await res.json()) as { completion?: string };
    return NextResponse.json({
      completion: typeof data.completion === 'string' ? data.completion : '',
    });
  } catch (error) {
    console.error('[Pyx] Code complete error:', error);
    return NextResponse.json({ completion: '', connectionError: true }, { status: 500 });
  }
}
