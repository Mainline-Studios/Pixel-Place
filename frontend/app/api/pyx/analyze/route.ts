import { NextRequest, NextResponse } from 'next/server';

const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';

const GAME_CONTEXT_TERMS = /\b(gun|guns|rifle|pistol|shotgun|sniper|ammo|ammunition|weapon|weapons|sword|axe|bow|arrow|grenade|bomb|missile|rocket|bullet|bullets|shoot|shooting|battle|combat|fight|fighting|kill|attack|damage|health|armor|shield|spawn|respawn|loot|craft|survival|pvp|enemy|enemies|boss|defend|war|explosion|fire|melee|ranged)\b/gi;

function stripGameTerms(text: string): string {
  return text.replace(GAME_CONTEXT_TERMS, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Pyx Analyze — scan code for inappropriate content (Pyx Analyze service).
 * POST { source: string } → { safe: boolean, flagged?: array }
 * Calls Pyx POST /analyze/three for Three.js/WebGL game code.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source = typeof body?.source === 'string' ? body.source : '';
    const url = process.env.PYX_SERVICE_URL || PYX_DEFAULT_URL;

    if (!source) {
      return NextResponse.json({ safe: true });
    }

    const sanitized = stripGameTerms(source);
    if (!sanitized) {
      return NextResponse.json({ safe: true });
    }

    const res = await fetch(`${url.replace(/\/$/, '')}/analyze/three`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sanitized }),
    });

    if (!res.ok) {
      return NextResponse.json({ safe: false, connectionError: true });
    }

    const data = (await res.json()) as { safe?: boolean; flagged?: unknown[] };
    return NextResponse.json({
      safe: data.safe !== false,
      flagged: data.flagged,
    });
  } catch (error) {
    console.error('[Pyx] Analyze error:', error);
    return NextResponse.json({ safe: false, connectionError: true }, { status: 500 });
  }
}
