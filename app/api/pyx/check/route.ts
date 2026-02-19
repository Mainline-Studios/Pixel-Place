import { NextRequest, NextResponse } from 'next/server';

const BAN_LINE = 0.7;
type PyxResponse = { score?: number; bad?: boolean; censored?: string };

/**
 * Pyx check API - returns { safe, filtered } for publish-time validation.
 * POST { text: string } → { safe: boolean, filtered: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    const url = process.env.PYX_SERVICE_URL;

    if (!text) {
      return NextResponse.json({ safe: true, filtered: '' });
    }
    if (!url) {
      return NextResponse.json({ safe: false, filtered: '', connectionError: true });
    }

    const res = await fetch(`${url.replace(/\/$/, '')}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      return NextResponse.json({ safe: false, filtered: '', connectionError: true });
    }

    const data = (await res.json()) as PyxResponse;
    const bad = data.bad === true || (typeof data.score === 'number' && data.score >= BAN_LINE);
    const filtered =
      bad && typeof data.censored === 'string' ? data.censored : text;
    return NextResponse.json({ safe: !bad, filtered });
  } catch (error) {
    console.error('[Pyx] Check error:', error);
    return NextResponse.json({ safe: false, filtered: '', connectionError: true }, { status: 500 });
  }
}
