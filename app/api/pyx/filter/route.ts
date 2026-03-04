export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { filterForDisplayServer } from '@/lib/pyx';

/**
 * Pyx content filter API - proxies to YOUR Pyx Python app.
 * POST { text: string } → { filtered: string }
 *
 * Set PYX_SERVICE_URL to your Pyx service (e.g. https://your-pyx.run.app)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';

    if (!text) {
      return NextResponse.json({ filtered: '', score: 0 });
    }

    const filtered = await filterForDisplayServer(text);
    return NextResponse.json({ filtered, score: 0 });
  } catch (error) {
    console.error('[Pyx] Filter error:', error);
    return NextResponse.json({ filtered: '', error: 'Filter failed' }, { status: 500 });
  }
}
