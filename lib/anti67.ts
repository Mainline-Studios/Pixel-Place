import type { Anti67AccountState, UserAccountPreferences } from '@/types';

export const ANTI_67_AUDIO_URL = '/audio/anti-67.mp3';
export const ANTI_67_BASE_REQUIRED_PLAYS = 3;
export const ANTI_67_SKIP_PENALTY_PLAYS = 3;

/** @deprecated use ANTI_67_BASE_REQUIRED_PLAYS */
export const ANTI_67_REQUIRED_PLAYS = ANTI_67_BASE_REQUIRED_PLAYS;

export type Anti67State = Anti67AccountState;

export const ANTI_67_NO_VOTE_REQUIRED_PLAYS = 1;

export type Anti67Parsed = Required<Pick<Anti67State, 'locked' | 'playsCompleted' | 'requiredPlays'>> & {
  vote: 'no' | 'yes';
  allowEarlyDismiss: boolean;
};

export function getAnti67FromPreferences(prefs: UserAccountPreferences | undefined): Anti67Parsed {
  const raw = prefs?.anti67;
  if (!raw || typeof raw !== 'object') {
    return {
      locked: false,
      playsCompleted: 0,
      requiredPlays: ANTI_67_BASE_REQUIRED_PLAYS,
      vote: 'yes',
      allowEarlyDismiss: false,
    };
  }
  const locked = raw.locked === true;
  const vote: 'no' | 'yes' = raw.vote === 'no' ? 'no' : 'yes';
  const allowEarlyDismiss = raw.allowEarlyDismiss === true || vote === 'no';
  const defaultRequired = vote === 'no' ? ANTI_67_NO_VOTE_REQUIRED_PLAYS : ANTI_67_BASE_REQUIRED_PLAYS;
  const minRequired = vote === 'no' ? ANTI_67_NO_VOTE_REQUIRED_PLAYS : ANTI_67_BASE_REQUIRED_PLAYS;
  const playsCompleted = Math.max(0, Number(raw.playsCompleted) || 0);
  const requiredPlays = Math.max(
    minRequired,
    Number(raw.requiredPlays) || defaultRequired,
  );
  return {
    locked,
    playsCompleted: Math.min(playsCompleted, requiredPlays),
    requiredPlays,
    vote,
    allowEarlyDismiss,
  };
}

export function isAnti67Blocking(prefs: UserAccountPreferences | undefined): boolean {
  return getAnti67FromPreferences(prefs).locked;
}

export function canDismissAnti67(prefs: UserAccountPreferences | undefined): boolean {
  const s = getAnti67FromPreferences(prefs);
  if (!s.locked) return false;
  if (s.allowEarlyDismiss) return true;
  return s.playsCompleted >= s.requiredPlays;
}

export function mergeAnti67IntoPreferences(
  prefs: UserAccountPreferences | undefined,
  anti67: Anti67State,
): UserAccountPreferences {
  return { ...(prefs || {}), anti67 };
}

/** RTDB snapshots often omit account_preferences; keep an active lock only when the next snapshot omits anti67 entirely. Explicit unlocks (locked: false) always win. */
export function mergeAccountPreferencesPreservingAnti67(
  prev: UserAccountPreferences | undefined,
  next: UserAccountPreferences | undefined,
): UserAccountPreferences | undefined {
  const merged: UserAccountPreferences = { ...(prev || {}), ...(next || {}) };
  const prevAnti = getAnti67FromPreferences(prev);
  const nextHasAnti67 =
    !!next && Object.prototype.hasOwnProperty.call(next, 'anti67') && next.anti67 != null;
  const nextAnti = getAnti67FromPreferences(next);

  if (nextHasAnti67 && next?.anti67) {
    merged.anti67 = next.anti67;
  } else if (prevAnti.locked && !nextHasAnti67) {
    merged.anti67 = prev?.anti67;
  } else if (nextAnti.locked && next?.anti67) {
    merged.anti67 = next.anti67;
  } else if (nextHasAnti67 === false && next && Object.prototype.hasOwnProperty.call(next, 'anti67')) {
    // Explicit null/cleared anti67 from server
    delete merged.anti67;
  }

  if (!Object.keys(merged).length) return undefined;
  return merged;
}
