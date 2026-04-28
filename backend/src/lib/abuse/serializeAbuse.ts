import type { User } from '@prisma/client';

export function buildAbusePayload(user: User) {
  const now = new Date();
  const locked = user.abuseLockedUntil && user.abuseLockedUntil > now;
  const captcha =
    !!user.abuseCaptchaRequiredUntil && user.abuseCaptchaRequiredUntil > now;

  const score = user.abuseSuspicionScore ?? 0;
  let trustTier: 'normal' | 'elevated' | 'high' = 'normal';
  if (score >= 45) trustTier = 'elevated';
  if (score >= 75) trustTier = 'high';

  return {
    placementLocked: !!locked,
    lockedUntil: user.abuseLockedUntil?.toISOString() ?? null,
    cooldownMultiplier: Math.min(8, Math.max(1, user.abuseCooldownMultiplier ?? 1)),
    captchaRequired: captcha,
    trustTier,
  };
}
