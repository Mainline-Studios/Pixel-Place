export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import {
  clampUserBoardScore,
  USERBOARD_DANGEROUS_MIN,
  USERBOARD_HALL_OF_FAME_MAX,
  USERBOARD_REPORT_BUMP,
  USERBOARD_SCORE_MAX,
  USERBOARD_SCORE_MIN,
} from '@/lib/userBoard';
import { COLLECTIONS, getDocuments, getDocument, setDocument } from '@/lib/firestore';
import { requireAuth, requireAdmin } from '@/lib/middleware';

function readScore(doc: Record<string, unknown> | null | undefined): number {
  if (!doc) return 0;
  const raw = (doc as { safety_score?: number; safetyScore?: number }).safety_score
    ?? (doc as { safetyScore?: number }).safetyScore;
  return typeof raw === 'number' ? clampUserBoardScore(raw) : 0;
}

function readReportCount(doc: Record<string, unknown> | null | undefined): number {
  const n = (doc as { report_count?: number })?.report_count;
  return typeof n === 'number' && n >= 0 ? Math.floor(n) : 0;
}

async function loadEntries() {
  const docs = await getDocuments(COLLECTIONS.USER_SAFETY);
  const entries: Array<{ username: string; safetyScore: number; reportCount: number }> = [];
  for (const doc of docs) {
    const score = readScore(doc);
    const reportCount = readReportCount(doc);
    if (score === 0 && reportCount === 0 && typeof (doc as { safety_score?: number }).safety_score !== 'number') {
      continue;
    }
    const username =
      typeof (doc as { username?: string }).username === 'string' && (doc as { username: string }).username.trim()
        ? (doc as { username: string }).username.trim()
        : doc.id;
    entries.push({ username, safetyScore: score, reportCount });
  }
  return entries;
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    const entries = await loadEntries();
    const hallOfFame = entries
      .filter((e) => e.safetyScore <= USERBOARD_HALL_OF_FAME_MAX)
      .sort((a, b) => a.safetyScore - b.safetyScore || a.username.localeCompare(b.username));
    const potentiallyDangerous = entries
      .filter((e) => e.safetyScore >= USERBOARD_DANGEROUS_MIN)
      .sort((a, b) => b.safetyScore - a.safetyScore || a.username.localeCompare(b.username));
    const allUsers = [...entries].sort(
      (a, b) => b.safetyScore - a.safetyScore || a.username.localeCompare(b.username),
    );

    const selfDoc = await getDocument(COLLECTIONS.USER_SAFETY, auth.user!.username.toLowerCase());

    return NextResponse.json({
      hallOfFame,
      potentiallyDangerous,
      allUsers,
      yourScore: readScore(selfDoc as Record<string, unknown> | null),
      yourReportCount: readReportCount(selfDoc as Record<string, unknown> | null),
      reportBump: USERBOARD_REPORT_BUMP,
      hallOfFameMax: USERBOARD_HALL_OF_FAME_MAX,
      dangerousMin: USERBOARD_DANGEROUS_MIN,
      scoreMin: USERBOARD_SCORE_MIN,
      scoreMax: USERBOARD_SCORE_MAX,
    });
  } catch (error) {
    console.error('UserBoard GET error:', error);
    return NextResponse.json({ error: 'Failed to load UserBoard' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;

    const { username, safetyScore, score, note } = await request.json();
    const target = String(username ?? '').trim();
    if (!target) return NextResponse.json({ error: 'username required' }, { status: 400 });
    const raw = safetyScore ?? score;
    if (typeof raw !== 'number' && typeof raw !== 'string') {
      return NextResponse.json({ error: 'safetyScore required' }, { status: 400 });
    }
    const next = clampUserBoardScore(Number(raw));
    const id = target.toLowerCase();
    await setDocument(COLLECTIONS.USER_SAFETY, id, {
      username: target,
      safety_score: next,
      admin_adjusted_at: Date.now(),
      admin_adjusted_by: auth.user!.username,
      admin_adjust_note: String(note ?? '').slice(0, 500).trim() || null,
      updated_at: Date.now(),
    });

    return NextResponse.json({ success: true, username: target, safetyScore: next });
  } catch (error) {
    console.error('UserBoard POST error:', error);
    return NextResponse.json({ error: 'Failed to adjust score' }, { status: 500 });
  }
}
