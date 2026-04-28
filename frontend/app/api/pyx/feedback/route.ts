import { NextRequest, NextResponse } from 'next/server';
import { sendFeedbackServer } from '@/lib/pyx';

/**
 * Pyx feedback API - sends moderator overrides to Pyx for training.
 * POST { text: string, safe: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    const safe = body?.safe === true;

    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }

    await sendFeedbackServer(text, safe);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Pyx] Feedback error:', error);
    return NextResponse.json({ error: 'Feedback failed' }, { status: 500 });
  }
}
