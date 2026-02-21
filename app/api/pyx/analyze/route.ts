import { NextRequest, NextResponse } from 'next/server';
import { analyzeCodeWithClaudeServer } from '@/lib/pyx';

const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';

/**
 * Pyx Analyze — scan code for inappropriate content. Uses Claude as backup when Pyx is down.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source = typeof body?.source === 'string' ? body.source : '';
    const url = process.env.PYX_SERVICE_URL || PYX_DEFAULT_URL;

    if (!source) {
      return NextResponse.json({ safe: true });
    }

    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/analyze/three`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      if (res.ok) {
        const data = (await res.json()) as { safe?: boolean; flagged?: unknown[] };
        return NextResponse.json({ safe: data.safe !== false, flagged: data.flagged });
      }
    } catch (_) {
      /* Pyx failed, try Claude backup */
    }
    const backup = await analyzeCodeWithClaudeServer(source);
    return NextResponse.json(backup);
  } catch (error) {
    console.error('[Pyx] Analyze error:', error);
    return NextResponse.json({ safe: false, connectionError: true }, { status: 500 });
  }
}
