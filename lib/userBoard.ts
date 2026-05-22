/** UserBoard safety reputation score (−100 … 100). Negative = trusted; positive = risk. */

export const USERBOARD_SCORE_MIN = -100;
export const USERBOARD_SCORE_MAX = 100;
export const USERBOARD_REPORT_BUMP = 8;
export const USERBOARD_HALL_OF_FAME_MAX = -65;
export const USERBOARD_DANGEROUS_MIN = 1;

export type UserBoardTone = 'hero' | 'good' | 'neutral' | 'watch' | 'danger' | 'critical';

export interface UserBoardEntry {
  username: string;
  safetyScore: number;
  reportCount: number;
  label: string;
  tier: string;
  tone: UserBoardTone;
}

export interface UserBoardTier {
  min: number;
  max: number;
  label: string;
  description: string;
}

export const USERBOARD_TIERS: UserBoardTier[] = [
  {
    min: -100,
    max: -100,
    label: 'Legendary guardian',
    description: 'This user has gone above and beyond to keep Pixel Place safe.',
  },
  {
    min: -99,
    max: -75,
    label: 'Strong helper',
    description: 'A strong helper who has changed Pixel Place for the better.',
  },
  {
    min: -74,
    max: -50,
    label: 'Trusted ally',
    description: 'Consistently helpful — moderators and the community trust them.',
  },
  {
    min: -49,
    max: -25,
    label: 'Positive presence',
    description: 'Regularly contributes to a safer, kinder community.',
  },
  {
    min: -24,
    max: -1,
    label: 'Good standing',
    description: 'Slightly better than average — no major concerns.',
  },
  {
    min: 0,
    max: 0,
    label: 'Normal user',
    description: 'A normal user with a neutral safety record.',
  },
  {
    min: 1,
    max: 24,
    label: 'Watch list',
    description: 'Minor concerns — often from reports or patterns worth watching.',
  },
  {
    min: 25,
    max: 49,
    label: 'Concerning',
    description: 'Multiple reports or issues — may be under review.',
  },
  {
    min: 50,
    max: 74,
    label: 'Dangerous',
    description: 'Serious pattern of reports — investigations may be open.',
  },
  {
    min: 75,
    max: 100,
    label: 'Critical risk',
    description: 'Severe safety concerns — immediate moderator attention.',
  },
];

export function clampUserBoardScore(score: number): number {
  const n = Math.round(Number(score));
  if (!Number.isFinite(n)) return 0;
  return Math.max(USERBOARD_SCORE_MIN, Math.min(USERBOARD_SCORE_MAX, n));
}

export function getUserBoardTier(score: number): UserBoardTier {
  const s = clampUserBoardScore(score);
  const tier = USERBOARD_TIERS.find((t) => s >= t.min && s <= t.max);
  return tier ?? USERBOARD_TIERS[5];
}

export function getUserBoardTone(score: number): UserBoardTone {
  const s = clampUserBoardScore(score);
  if (s <= -75) return 'hero';
  if (s <= -25) return 'good';
  if (s === 0) return 'neutral';
  if (s < 50) return 'watch';
  if (s < 75) return 'danger';
  return 'critical';
}

export function isHallOfFameScore(score: number): boolean {
  return clampUserBoardScore(score) <= USERBOARD_HALL_OF_FAME_MAX;
}

export function isPotentiallyDangerousScore(score: number): boolean {
  return clampUserBoardScore(score) >= USERBOARD_DANGEROUS_MIN;
}

export function userBoardEntry(username: string, safetyScore: number, reportCount = 0): UserBoardEntry {
  const score = clampUserBoardScore(safetyScore);
  const tier = getUserBoardTier(score);
  return {
    username,
    safetyScore: score,
    reportCount,
    label: tier.label,
    tier: tier.label,
    tone: getUserBoardTone(score),
  };
}
