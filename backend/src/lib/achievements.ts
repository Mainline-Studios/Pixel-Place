import type { Achievement } from '@prisma/client';
import { prisma } from './prisma.js';
import { levelFromTotalXp } from './xp.js';

type Requirement =
  | { kind: 'pixels_placed'; atLeast: number }
  | { kind: 'level'; atLeast: number }
  | { kind: 'daily_streak'; atLeast: number };

function parseRequirement(raw: unknown): Requirement | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const kind = o.kind;
  if (kind === 'pixels_placed' && typeof o.atLeast === 'number') {
    return { kind: 'pixels_placed', atLeast: o.atLeast };
  }
  if (kind === 'level' && typeof o.atLeast === 'number') {
    return { kind: 'level', atLeast: o.atLeast };
  }
  if (kind === 'daily_streak' && typeof o.atLeast === 'number') {
    return { kind: 'daily_streak', atLeast: o.atLeast };
  }
  return null;
}

function satisfies(
  req: Requirement,
  ctx: {
    pixelsPlaced: number;
    level: number;
    longestStreak: number;
  }
): boolean {
  switch (req.kind) {
    case 'pixels_placed':
      return ctx.pixelsPlaced >= req.atLeast;
    case 'level':
      return ctx.level >= req.atLeast;
    case 'daily_streak':
      return ctx.longestStreak >= req.atLeast;
    default:
      return false;
  }
}

/** Returns newly unlocked achievement IDs and applies XP rewards (transaction). */
export async function unlockEligibleAchievements(userId: string): Promise<string[]> {
  const [progress, pixelStats, engagement, existing] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId } }),
    prisma.pixelStats.findUnique({ where: { userId } }),
    prisma.userEngagement.findUnique({ where: { userId } }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const unlockedSet = new Set(existing.map((e) => e.achievementId));
  const all = await prisma.achievement.findMany();

  const pixelsPlaced = pixelStats?.pixelsPlaced ?? 0;
  const xp = progress?.xp ?? 0;
  const level = levelFromTotalXp(xp);
  const longestStreak = engagement?.longestStreak ?? 0;

  const ctx = { pixelsPlaced, level, longestStreak };

  const pending: Achievement[] = [];
  for (const a of all) {
    if (unlockedSet.has(a.id)) continue;
    const req = parseRequirement(a.requirement);
    if (!req || !satisfies(req, ctx)) continue;
    pending.push(a);
  }

  if (pending.length === 0) return [];

  const newlyUnlocked: string[] = [];

  await prisma.$transaction(async (tx) => {
    let bonusXp = 0;
    for (const a of pending) {
      await tx.userAchievement.create({
        data: {
          userId,
          achievementId: a.id,
        },
      });
      newlyUnlocked.push(a.id);
      bonusXp += a.xpReward;
    }

    if (bonusXp > 0) {
      const p = await tx.userProgress.update({
        where: { userId },
        data: { xp: { increment: bonusXp } },
      });
      const newLevel = levelFromTotalXp(p.xp);
      await tx.userProgress.update({
        where: { userId },
        data: { level: newLevel },
      });
    }
  });

  return newlyUnlocked;
}

export type AchievementRow = Pick<
  Achievement,
  'id' | 'name' | 'description' | 'iconKey' | 'xpReward' | 'requirement'
>;

export function serializeAchievement(a: AchievementRow, unlocked: boolean, unlockedAt?: Date | null) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    iconKey: a.iconKey,
    xpReward: a.xpReward,
    requirement: a.requirement,
    unlocked,
    unlockedAt: unlockedAt?.toISOString() ?? null,
  };
}
