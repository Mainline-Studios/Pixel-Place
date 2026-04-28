import type { Request } from 'express';
import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { verifyTurnstileToken } from './turnstileVerify.js';
import {
  progressionBurst60s,
  recordProgressionBurst,
  recordTerritoryPlacement,
  territorySnapshot,
} from '../lib/abuse/placementMemory.js';
import {
  BASE_PROGRESSION_COOLDOWN_MS,
  BASE_TERRITORY_COOLDOWN_MS,
  BURST_WINDOW_MS,
  FINGERPRINT_PEER_ALERT,
  LOW_MOUSE_ENTROPY,
  LOW_POINTER_MOVES,
  ROBOT_STDDEV_MAX_MS,
  TERRITORY_BURST_HARD,
  TERRITORY_BURST_SOFT,
} from '../lib/abuse/constants.js';

export type BehaviorPayload = {
  mouseEntropy?: number;
  clickIntervalsMs?: number[];
  pointerMovesLast10s?: number;
};

function abuseDisabled(): boolean {
  return !!env.ABUSE_CHECKS_DISABLED;
}

export function getClientIp(req: Request): string | undefined {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string') return xf.split(',')[0]?.trim();
  const rip = req.socket?.remoteAddress;
  return rip || undefined;
}

function decaySuspicion(score: number, last?: Date | null): number {
  if (!last) return score;
  const mins = (Date.now() - last.getTime()) / 60_000;
  return score * Math.pow(0.91, Math.min(mins, 240));
}

function sanitizeFingerprint(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const h = raw.trim().toLowerCase().replace(/[^a-f0-9]/g, '');
  return h.length >= 32 && h.length <= 64 ? h.slice(0, 64) : undefined;
}

function suspicionDeltaFromSignals(
  snap: ReturnType<typeof territorySnapshot>,
  behavior?: BehaviorPayload
): number {
  let d = 0;

  if (snap.count10s >= TERRITORY_BURST_HARD) d += 38;
  else if (snap.count10s >= TERRITORY_BURST_SOFT) d += 22;

  if (snap.intervalsStddevMs > 0 && snap.intervalsStddevMs < ROBOT_STDDEV_MAX_MS) d += 18;

  if (behavior) {
    const moves = behavior.pointerMovesLast10s ?? 999;
    const ent = behavior.mouseEntropy ?? 1;
    if (moves < LOW_POINTER_MOVES && ent < LOW_MOUSE_ENTROPY) d += 14;
    else if (moves < LOW_POINTER_MOVES || ent < LOW_MOUSE_ENTROPY / 2) d += 6;

    const iv = behavior.clickIntervalsMs ?? [];
    if (iv.length >= 6) {
      const tail = iv.slice(-12);
      const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
      const variance = tail.reduce((s, x) => s + (x - mean) ** 2, 0) / tail.length;
      const sd = Math.sqrt(variance);
      if (mean > 40 && sd < 7) d += 12;
    }
  }

  return d;
}

function progressionSuspicionHints(count: number): number {
  let d = 0;
  if (count > 400) d += 35;
  else if (count > 220) d += 18;
  else if (count > 140) d += 10;
  return d;
}

export function multiplierForScore(score: number): number {
  if (score >= 85) return Math.min(8, 6);
  if (score >= 62) return 4;
  if (score >= 38) return 2.25;
  if (score >= 18) return 1.6;
  return 1;
}

async function decayUserRow(userId: string): Promise<User> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) throw new AppError('User not found', 404, 'NOT_FOUND');

  const nextScore = decaySuspicion(u.abuseSuspicionScore ?? 0, u.abuseSuspicionUpdatedAt);
  const nextMult = multiplierForScore(nextScore);

  await prisma.user.update({
    where: { id: userId },
    data: {
      abuseSuspicionScore: nextScore,
      abuseSuspicionUpdatedAt: new Date(),
      abuseCooldownMultiplier: nextMult,
    },
  });

  const fresh = await prisma.user.findUnique({ where: { id: userId } });
  return fresh ?? u;
}

async function assertNotLocked(user: User): Promise<void> {
  if (user.abuseLockedUntil && user.abuseLockedUntil > new Date()) {
    throw new AppError(
      'Your account is temporarily restricted from automated placement actions.',
      423,
      'PLACEMENT_LOCKED',
      { lockedUntil: user.abuseLockedUntil.toISOString() }
    );
  }
}

async function handleCaptchaGate(
  user: User,
  captchaToken: string | undefined,
  req: Request,
  opts: { forceChallenge: boolean }
): Promise<User> {
  const now = new Date();
  const captchaActive = !!(user.abuseCaptchaRequiredUntil && user.abuseCaptchaRequiredUntil > now);

  const ip = getClientIp(req);

  if ((opts.forceChallenge || captchaActive) && !env.TURNSTILE_SECRET_KEY) {
    if (env.NODE_ENV === 'production') {
      throw new AppError(
        'Captcha verification is not configured on this server.',
        503,
        'CAPTCHA_UNAVAILABLE'
      );
    }
    logger.warn('Turnstile secret missing — skipping challenge (non-production only)');
    await prisma.user.update({
      where: { id: user.id },
      data: { abuseCaptchaRequiredUntil: null },
    });
    return (await prisma.user.findUnique({ where: { id: user.id } })) ?? user;
  }

  if (opts.forceChallenge || captchaActive) {
    const ok = await verifyTurnstileToken(captchaToken, ip);
    if (!ok) {
      throw new AppError(
        'Security verification required. Refresh the challenge and try again.',
        403,
        'CAPTCHA_REQUIRED'
      );
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { abuseCaptchaRequiredUntil: null },
    });
    return (await prisma.user.findUnique({ where: { id: user.id } })) ?? user;
  }

  return user;
}

async function upsertFingerprintAndMaybeFlag(userId: string, hash: string): Promise<void> {
  await prisma.deviceFingerprintLink.upsert({
    where: {
      fingerprintHash_userId: { fingerprintHash: hash, userId },
    },
    create: { fingerprintHash: hash, userId },
    update: { lastSeenAt: new Date() },
  });

  const peers = await prisma.deviceFingerprintLink.findMany({
    where: { fingerprintHash: hash },
    select: { userId: true },
    distinct: ['userId'],
  });

  if (peers.length >= FINGERPRINT_PEER_ALERT) {
    await prisma.abuseReviewFlag.create({
      data: {
        userId,
        reason: 'SHARED_DEVICE_FINGERPRINT',
        scoreSnapshot: peers.length,
        metadata: {
          fingerprintShort: hash.slice(0, 12),
          distinctAccounts: peers.length,
        },
      },
    });
  }
}

async function applySuspicionUpdate(
  userId: string,
  delta: number,
  meta: { reason?: string | undefined }
): Promise<void> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return;

  const score = Math.min(120, Math.max(0, (u.abuseSuspicionScore ?? 0) + delta));
  const mult = multiplierForScore(score);

  let lockedUntil = u.abuseLockedUntil;
  let captchaUntil = u.abuseCaptchaRequiredUntil;

  if (score >= 92) {
    lockedUntil = new Date(Date.now() + 38 * 60 * 1000);
  } else if (score >= 72 && !(captchaUntil && captchaUntil > new Date())) {
    captchaUntil = new Date(Date.now() + 120 * 60 * 1000);
  } else if (score >= 48 && !(captchaUntil && captchaUntil > new Date())) {
    captchaUntil = new Date(Date.now() + 35 * 60 * 1000);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      abuseSuspicionScore: score,
      abuseSuspicionUpdatedAt: new Date(),
      abuseCooldownMultiplier: mult,
      ...(lockedUntil ? { abuseLockedUntil: lockedUntil } : {}),
      ...(captchaUntil ? { abuseCaptchaRequiredUntil: captchaUntil } : {}),
    },
  });

  if (score >= 42 && meta.reason) {
    await prisma.abuseReviewFlag.create({
      data: {
        userId,
        reason: meta.reason,
        scoreSnapshot: score,
        metadata: { delta },
      },
    });
  }
}

/** Before territory claim — throws AppError on block / cooldown / CAPTCHA. */
export async function gateTerritoryClaim(opts: {
  userId: string;
  behavior?: BehaviorPayload;
  fingerprint?: string;
  captchaToken?: string;
  req: Request;
}): Promise<void> {
  if (abuseDisabled()) return;

  let user = await decayUserRow(opts.userId);
  await assertNotLocked(user);

  const snap = territorySnapshot(opts.userId);
  const predictedDelta = suspicionDeltaFromSignals(snap, opts.behavior);
  const predictedScore = (user.abuseSuspicionScore ?? 0) + predictedDelta;

  const needsChallenge =
    predictedScore >= 52 ||
    !!(user.abuseCaptchaRequiredUntil && user.abuseCaptchaRequiredUntil > new Date());

  user = await handleCaptchaGate(user, opts.captchaToken, opts.req, {
    forceChallenge: needsChallenge,
  });

  const mult = Math.min(8, Math.max(1, user.abuseCooldownMultiplier ?? 1));
  const gap = BASE_TERRITORY_COOLDOWN_MS * mult;

  if (user.abuseLastTerritoryClaimAt) {
    const elapsed = Date.now() - user.abuseLastTerritoryClaimAt.getTime();
    if (elapsed < gap) {
      throw new AppError(
        `Placement cooldown active — wait ${Math.ceil((gap - elapsed) / 1000)}s`,
        429,
        'PLACEMENT_COOLDOWN',
        { retryAfterMs: gap - elapsed }
      );
    }
  }

  if (snap.count10s >= TERRITORY_BURST_HARD - 1) {
    throw new AppError('Too many placements — slow down.', 429, 'RATE_PIXEL_BURST');
  }
}

/** After successful territory DB commit — memory + suspicion + fingerprint. */
export async function finalizeTerritoryClaimOk(opts: {
  userId: string;
  behavior?: BehaviorPayload;
  fingerprint?: string;
}): Promise<void> {
  if (abuseDisabled()) return;

  recordTerritoryPlacement(opts.userId);
  const snap = territorySnapshot(opts.userId);
  const delta = suspicionDeltaFromSignals(snap, opts.behavior);

  await applySuspicionUpdate(opts.userId, delta, {
    reason: delta >= 18 ? 'TERRITORY_SIGNALS' : undefined,
  });

  await prisma.user.update({
    where: { id: opts.userId },
    data: { abuseLastTerritoryClaimAt: new Date() },
  });

  const fp = sanitizeFingerprint(opts.fingerprint);
  if (fp) await upsertFingerprintAndMaybeFlag(opts.userId, fp);
}

/** Progression pixels batch — gate before incrementing stats. */
export async function gateProgressionPixels(opts: {
  userId: string;
  count: number;
  behavior?: BehaviorPayload;
  captchaToken?: string;
  fingerprint?: string;
  req: Request;
  lastPlacedAt: Date | null;
}): Promise<void> {
  if (abuseDisabled()) return;

  let user = await decayUserRow(opts.userId);
  await assertNotLocked(user);

  const burst = progressionBurst60s(opts.userId);
  const predictedDelta = progressionSuspicionHints(opts.count) + (burst > 85 ? 28 : burst > 55 ? 14 : 0);

  const predictedScore = (user.abuseSuspicionScore ?? 0) + predictedDelta;
  const needsChallenge =
    predictedScore >= 48 ||
    opts.count > 260 ||
    !!(user.abuseCaptchaRequiredUntil && user.abuseCaptchaRequiredUntil > new Date());

  user = await handleCaptchaGate(user, opts.captchaToken, opts.req, {
    forceChallenge: needsChallenge,
  });

  const mult = Math.min(8, Math.max(1, user.abuseCooldownMultiplier ?? 1));
  const gap = BASE_PROGRESSION_COOLDOWN_MS * mult * Math.min(3, 1 + Math.floor(opts.count / 120));

  if (opts.lastPlacedAt) {
    const elapsed = Date.now() - opts.lastPlacedAt.getTime();
    if (elapsed < gap) {
      throw new AppError(
        `Reporting pixels too fast — wait ${Math.ceil((gap - elapsed) / 1000)}s`,
        429,
        'PLACEMENT_COOLDOWN',
        { retryAfterMs: gap - elapsed }
      );
    }
  }

  if (burst > 110) {
    await applySuspicionUpdate(opts.userId, 22, { reason: 'PROGRESSION_BURST' });
    throw new AppError('Pixel reporting rate exceeded.', 429, 'RATE_PIXEL_BURST');
  }
}

export async function finalizeProgressionPixelsOk(opts: {
  userId: string;
  count: number;
  fingerprint?: string;
}): Promise<void> {
  if (abuseDisabled()) return;

  recordProgressionBurst(opts.userId, Math.min(25, Math.ceil(opts.count / 40)), Date.now());

  const burst = progressionBurst60s(opts.userId);
  const delta =
    progressionSuspicionHints(opts.count) + (burst > 95 ? 12 : burst > 70 ? 6 : 0);

  if (delta > 0) {
    await applySuspicionUpdate(opts.userId, delta, {
      reason: delta >= 15 ? 'PROGRESSION_SIGNALS' : undefined,
    });
  }

  const fp = sanitizeFingerprint(opts.fingerprint);
  if (fp) await upsertFingerprintAndMaybeFlag(opts.userId, fp);
}
