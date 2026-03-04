export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { checkWithClaudeServer } from '@/lib/pyx';

const BAN_LINE = 0.7;
const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';
type PyxResponse = { score?: number; bad?: boolean; censored?: string };

/**
 * Pyx check API - returns { safe, filtered }. Uses Claude as backup when Pyx is down.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    const url = process.env.PYX_SERVICE_URL || PYX_DEFAULT_URL;

    if (!text) {
      return NextResponse.json({ safe: true, filtered: '' });
    }

    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = (await res.json()) as PyxResponse;
        const bad = data.bad === true || (typeof data.score === 'number' && data.score >= BAN_LINE);
        const filtered = bad && typeof data.censored === 'string' ? data.censored : text;
        return NextResponse.json({ safe: !bad, filtered });
      }
    } catch (_) {
      /* Pyx failed, try Claude backup */
    }
    const backup = await checkWithClaudeServer(text);
    return NextResponse.json(backup);
  } catch (error) {
    console.error('[Pyx] Check error:', error);
    return NextResponse.json({ safe: false, filtered: '', connectionError: true }, { status: 500 });
  }
}
