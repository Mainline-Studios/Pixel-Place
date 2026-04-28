import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { AppError } from '../../errors/AppError.js';
import { env } from '../../config/env.js';
import { levelFromTotalXp } from '../../lib/xp.js';
import { unlockEligibleAchievements } from '../../lib/achievements.js';
import { computeDailyStreakUpdate, rewardForStreak, utcDateString } from '../../lib/dailyReward.js';
import { ensureUserLifecycle } from '../../lib/userLifecycle.js';
import { getIoInstance } from '../../socket/socketHub.js';
import { scheduleLeaderboardEmit } from '../../services/leaderboardRealtime.js';
import { finalizeProgressionPixelsOk, gateProgressionPixels } from '../../services/abuseOrchestrator.js';

export const progressionRouter = Router();

const progressionLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.min(120, env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
});

const pixelsSchema = z.object({
  count: z.number().int().min(1).max(500).optional(),
  captchaToken: z.string().optional(),
  fingerprint: z.string().min(16).max(128).optional(),
  behavior: z
    .object({
      mouseEntropy: z.number().min(0).max(1).optional(),
      clickIntervalsMs: z.array(z.number()).max(40).optional(),
      pointerMovesLast10s: z.number().int().min(0).optional(),
    })
    .optional(),
});

progressionRouter.post(
  '/progression/pixels',
  requireAuth,
  progressionLimiter,
  validateRequest({ body: pixelsSchema }),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const body = pixelsSchema.parse(req.body);
      const count = body.count ?? 1;
      await ensureUserLifecycle(userId);

      const pixRow = await prisma.pixelStats.findUnique({
        where: { userId },
        select: { lastPlacedAt: true },
      });

      await gateProgressionPixels({
        userId,
        count,
        behavior: body.behavior,
        captchaToken: body.captchaToken,
        fingerprint: body.fingerprint,
        req,
        lastPlacedAt: pixRow?.lastPlacedAt ?? null,
      });

      await prisma.$transaction(async (tx) => {
        await tx.pixelStats.update({
          where: { userId },
          data: {
            pixelsPlaced: { increment: count },
            lastPlacedAt: new Date(),
          },
        });
        const prog = await tx.userProgress.update({
          where: { userId },
          data: { xp: { increment: count } },
        });
        await tx.userProgress.update({
          where: { userId },
          data: { level: levelFromTotalXp(prog.xp) },
        });
      });

      const season = await prisma.season.findFirst({ where: { isActive: true } });
      if (season) {
        await prisma.userSeasonScore.upsert({
          where: { userId_seasonId: { userId, seasonId: season.id } },
          create: { userId, seasonId: season.id, pixelsPlaced: count, tilesCaptured: 0 },
          update: { pixelsPlaced: { increment: count } },
        });
        const mem = await prisma.factionMember.findUnique({ where: { userId } });
        if (mem) {
          await prisma.factionSeasonScore.upsert({
            where: { factionId_seasonId: { factionId: mem.factionId, seasonId: season.id } },
            create: {
              factionId: mem.factionId,
              seasonId: season.id,
              tilesOwned: 0,
              pixelsFromMembers: count,
            },
            update: { pixelsFromMembers: { increment: count } },
          });
        }
        const io = getIoInstance();
        if (io) scheduleLeaderboardEmit(io, season.id);
      }

      const newAchievements = await unlockEligibleAchievements(userId);

      await finalizeProgressionPixelsOk({
        userId,
        count,
        fingerprint: body.fingerprint,
      });

      res.json({
        success: true,
        data: {
          recorded: count,
          newAchievements,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

progressionRouter.post('/progression/daily-reward', requireAuth, progressionLimiter, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    await ensureUserLifecycle(userId);

    const today = utcDateString();
    const engagement = await prisma.userEngagement.findUnique({ where: { userId } });
    if (!engagement) throw new AppError('Engagement missing', 500, 'INTERNAL');

    const streakUpdate = computeDailyStreakUpdate({
      today,
      lastDailyClaimDate: engagement.lastDailyClaimDate,
      currentStreak: engagement.currentStreak,
    });

    if (!streakUpdate.ok) {
      throw new AppError('Daily reward already claimed today', 409, 'ALREADY_CLAIMED');
    }

    const { coins, xp } = rewardForStreak(streakUpdate.nextStreak);
    const longest = Math.max(streakUpdate.nextStreak, engagement.longestStreak);

    await prisma.$transaction(async (tx) => {
      await tx.userEngagement.update({
        where: { userId },
        data: {
          currentStreak: streakUpdate.nextStreak,
          longestStreak: longest,
          lastDailyClaimDate: today,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { coins: { increment: coins } },
      });
      const prog = await tx.userProgress.update({
        where: { userId },
        data: { xp: { increment: xp } },
      });
      await tx.userProgress.update({
        where: { userId },
        data: { level: levelFromTotalXp(prog.xp) },
      });
    });

    const newAchievements = await unlockEligibleAchievements(userId);

    res.json({
      success: true,
      data: {
        streak: streakUpdate.nextStreak,
        coinsGranted: coins,
        xpGranted: xp,
        newAchievements,
      },
    });
  } catch (e) {
    next(e);
  }
});

const equipSchema = z.object({
  equipped: z.boolean(),
});

progressionRouter.patch(
  '/inventory/:itemId',
  requireAuth,
  validateRequest({ body: equipSchema }),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const { itemId } = req.params;
      if (!itemId) throw new AppError('Missing item id', 400, 'BAD_REQUEST');
      await ensureUserLifecycle(userId);

      const row = await prisma.userInventoryItem.findUnique({
        where: { userId_itemId: { userId, itemId } },
        include: { item: true },
      });
      if (!row) throw new AppError('Item not in inventory', 404, 'NOT_FOUND');

      if (row.item.type === 'tool') {
        await prisma.userInventoryItem.update({
          where: { userId_itemId: { userId, itemId } },
          data: { equipped: req.body.equipped },
        });
      } else {
        throw new AppError('Only tool items can be equipped this way', 400, 'INVALID_ITEM');
      }

      res.json({ success: true, data: { itemId, equipped: req.body.equipped } });
    } catch (e) {
      next(e);
    }
  }
);
