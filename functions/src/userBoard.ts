/**
 * UserBoard — community safety reputation scores stored on user_safety docs.
 */
import type { Express } from 'express';
import type * as admin from 'firebase-admin';
import type { Request, Response } from 'express';
import { requireAdmin, requireAuth } from './authMiddleware';

export const USERBOARD_SCORE_MIN = -100;
export const USERBOARD_SCORE_MAX = 100;
export const USERBOARD_REPORT_BUMP = 8;
export const USERBOARD_HALL_OF_FAME_MAX = -65;
export const USERBOARD_DANGEROUS_MIN = 1;

type Collections = { USER_SAFETY: string; USERS: string };

function clampScore(score: number): number {
  const n = Math.round(Number(score));
  if (!Number.isFinite(n)) return 0;
  return Math.max(USERBOARD_SCORE_MIN, Math.min(USERBOARD_SCORE_MAX, n));
}

function readScore(data: admin.firestore.DocumentData | undefined): number {
  if (typeof data?.safety_score === 'number') return clampScore(data.safety_score);
  return 0;
}

function readReportCount(data: admin.firestore.DocumentData | undefined): number {
  const n = data?.report_count;
  return typeof n === 'number' && n >= 0 ? Math.floor(n) : 0;
}

function displayUsername(docId: string, data: admin.firestore.DocumentData | undefined): string {
  const fromDoc = typeof data?.username === 'string' && data.username.trim() ? data.username.trim() : '';
  if (fromDoc) return fromDoc;
  return docId;
}

export async function bumpSafetyScoreOnReport(
  db: admin.firestore.Firestore,
  collections: Collections,
  reportedUsername: string,
): Promise<number> {
  const id = reportedUsername.trim().toLowerCase();
  if (!id) return 0;
  const ref = db.collection(collections.USER_SAFETY).doc(id);
  const doc = await ref.get();
  const d = doc.data();
  const current = readScore(d);
  const next = clampScore(current + USERBOARD_REPORT_BUMP);
  await ref.set(
    {
      username: reportedUsername.trim(),
      safety_score: next,
      report_count: readReportCount(d) + 1,
      last_report_at: Date.now(),
      updated_at: Date.now(),
    },
    { merge: true },
  );
  return next;
}

async function loadUserBoardEntries(
  db: admin.firestore.Firestore,
  collections: Collections,
): Promise<Array<{ username: string; safetyScore: number; reportCount: number }>> {
  const snap = await db.collection(collections.USER_SAFETY).get();
  const entries: Array<{ username: string; safetyScore: number; reportCount: number }> = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    const score = readScore(d);
    const reportCount = readReportCount(d);
    if (score === 0 && reportCount === 0 && typeof d?.safety_score !== 'number') continue;
    entries.push({
      username: displayUsername(doc.id, d),
      safetyScore: score,
      reportCount,
    });
  }
  return entries;
}

const getUserBoardHandler = async (
  req: Request,
  res: Response,
  db: admin.firestore.Firestore,
  collections: Collections,
) => {
  const auth = requireAuth(req, res);
  if (!auth) return;
  try {
    const entries = await loadUserBoardEntries(db, collections);
    const hallOfFame = entries
      .filter((e) => e.safetyScore <= USERBOARD_HALL_OF_FAME_MAX)
      .sort((a, b) => a.safetyScore - b.safetyScore || a.username.localeCompare(b.username));
    const potentiallyDangerous = entries
      .filter((e) => e.safetyScore >= USERBOARD_DANGEROUS_MIN)
      .sort((a, b) => b.safetyScore - a.safetyScore || a.username.localeCompare(b.username));
    const allUsers = [...entries].sort(
      (a, b) => b.safetyScore - a.safetyScore || a.username.localeCompare(b.username),
    );
    const selfId = auth.username.toLowerCase();
    const selfDoc = await db.collection(collections.USER_SAFETY).doc(selfId).get();
    const selfData = selfDoc.data();
    res.json({
      hallOfFame,
      potentiallyDangerous,
      allUsers,
      yourScore: readScore(selfData),
      yourReportCount: readReportCount(selfData),
      reportBump: USERBOARD_REPORT_BUMP,
      hallOfFameMax: USERBOARD_HALL_OF_FAME_MAX,
      dangerousMin: USERBOARD_DANGEROUS_MIN,
      scoreMin: USERBOARD_SCORE_MIN,
      scoreMax: USERBOARD_SCORE_MAX,
    });
  } catch (e) {
    console.error('UserBoard GET failed:', e);
    res.status(500).json({ error: 'Failed to load UserBoard' });
  }
};

const postUserBoardAdjustHandler = async (
  req: Request,
  res: Response,
  db: admin.firestore.Firestore,
  collections: Collections,
) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const body = req.body || {};
  const username = String(body.username ?? '').trim();
  const scoreRaw = body.safetyScore ?? body.score;
  if (!username) return res.status(400).json({ error: 'username required' });
  if (typeof scoreRaw !== 'number' && typeof scoreRaw !== 'string') {
    return res.status(400).json({ error: 'safetyScore required' });
  }
  const score = clampScore(Number(scoreRaw));
  const note = String(body.note ?? '').slice(0, 500).trim();
  const id = username.toLowerCase();
  try {
    const ref = db.collection(collections.USER_SAFETY).doc(id);
    await ref.set(
      {
        username,
        safety_score: score,
        admin_adjusted_at: Date.now(),
        admin_adjusted_by: auth.username,
        admin_adjust_note: note || null,
        updated_at: Date.now(),
      },
      { merge: true },
    );
    res.json({ success: true, username, safetyScore: score });
  } catch (e) {
    console.error('UserBoard adjust failed:', e);
    res.status(500).json({ error: 'Failed to adjust score' });
  }
};

export function mountUserBoardRoutes(
  app: Express,
  db: admin.firestore.Firestore,
  collections: Collections,
) {
  const getHandler = (req: Request, res: Response) => getUserBoardHandler(req, res, db, collections);
  const postHandler = (req: Request, res: Response) => postUserBoardAdjustHandler(req, res, db, collections);
  app.get('/userboard', getHandler);
  app.get('/api/userboard', getHandler);
  app.post('/userboard/adjust', postHandler);
  app.post('/api/userboard/adjust', postHandler);
}
