import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';

const STRIKE_THRESHOLD = Number(process.env.CHAT_AUTO_MUTE_STRIKES) || 4;
const MUTE_MINUTES = Number(process.env.CHAT_AUTO_MUTE_MINUTES) || 30;
const WINDOW_MS = Number(process.env.CHAT_STRIKE_WINDOW_MS) || 3_600_000;

/**
 * Increment chat violation score; auto-mute when threshold exceeded in window.
 */
export async function recordChatViolation(usernameLower: string): Promise<{ mutedUntil?: number }> {
  const doc = await getDocument(COLLECTIONS.USERS, usernameLower);
  if (!doc) return {};
  const now = Date.now();
  let windowStart = typeof doc.chat_strike_window_start === 'number' ? doc.chat_strike_window_start : now;
  let strikes = typeof doc.chat_strikes === 'number' ? doc.chat_strikes : 0;
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    strikes = 0;
  }
  strikes += 1;
  const violationScore = (typeof doc.chat_violation_score === 'number' ? doc.chat_violation_score : 0) + 1;

  let mutedUntil: number | undefined;
  if (strikes >= STRIKE_THRESHOLD) {
    mutedUntil = now + MUTE_MINUTES * 60_000;
    strikes = 0;
    windowStart = now;
  }

  await setDocument(COLLECTIONS.USERS, usernameLower, {
    chat_strikes: strikes,
    chat_strike_window_start: windowStart,
    chat_violation_score: violationScore,
    ...(mutedUntil ? { chat_muted_until: mutedUntil } : {}),
    updated_at: now,
  });

  return mutedUntil ? { mutedUntil } : {};
}
