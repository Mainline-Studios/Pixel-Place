import type { Anti67AccountState, UserAccountPreferences } from '@/types';

export const ANTI_67_AUDIO_URL = '/audio/anti-67.mp3';
export const ANTI_67_BASE_REQUIRED_PLAYS = 3;
export const ANTI_67_SKIP_PENALTY_PLAYS = 3;

/** @deprecated use ANTI_67_BASE_REQUIRED_PLAYS */
export const ANTI_67_REQUIRED_PLAYS = ANTI_67_BASE_REQUIRED_PLAYS;

export type Anti67State = Anti67AccountState;

export function getAnti67FromPreferences(
  prefs: UserAccountPreferences | undefined,
): Required<Pick<Anti67State, 'locked' | 'playsCompleted' | 'requiredPlays'>> {
  const raw = prefs?.anti67;
  if (!raw || typeof raw !== 'object') {
    return { locked: false, playsCompleted: 0, requiredPlays: ANTI_67_BASE_REQUIRED_PLAYS };
  }
  const locked = (raw as Anti67State).locked === true;
  const playsCompleted = Math.max(0, Number((raw as Anti67State).playsCompleted) || 0);
  const requiredPlays = Math.max(
    ANTI_67_BASE_REQUIRED_PLAYS,
    Number((raw as Anti67State).requiredPlays) || ANTI_67_BASE_REQUIRED_PLAYS,
  );
  return {
    locked,
    playsCompleted: Math.min(playsCompleted, requiredPlays),
    requiredPlays,
  };
}

export function isAnti67Blocking(prefs: UserAccountPreferences | undefined): boolean {
  return getAnti67FromPreferences(prefs).locked;
}

export function canDismissAnti67(prefs: UserAccountPreferences | undefined): boolean {
  const s = getAnti67FromPreferences(prefs);
  return s.locked && s.playsCompleted >= s.requiredPlays;
}

export function mergeAnti67IntoPreferences(
  prefs: UserAccountPreferences | undefined,
  anti67: Anti67State,
): UserAccountPreferences {
  return { ...(prefs || {}), anti67 };
}
