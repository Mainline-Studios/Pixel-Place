import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { utcDateString } from '../../lib/dailyReward.js';

export const adminDashboardRouter = Router();

function dateStrDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return utcDateString(d);
}

adminDashboardRouter.get('/admin/overview', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const today = utcDateString();
    const weekStart = dateStrDaysAgo(7);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);

    const [
      totalUsers,
      signups7d,
      dau,
      wau,
      cohortEligible,
      cohortReturned,
      pixelsSum,
      flagsOpen,
      activeSeason,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      }),
      prisma.userEngagement.count({ where: { lastActiveDate: today } }),
      prisma.userEngagement.count({
        where: {
          lastActiveDate: { gte: weekStart },
        },
      }),
      prisma.user.count({ where: { createdAt: { lte: fourteenDaysAgo } } }),
      prisma.user.count({
        where: {
          createdAt: { lte: fourteenDaysAgo },
          engagement: {
            lastActiveDate: { gte: dateStrDaysAgo(1) },
          },
        },
      }),
      prisma.pixelStats.aggregate({ _sum: { pixelsPlaced: true } }),
      prisma.abuseReviewFlag.count({ where: { resolvedAt: null } }),
      prisma.season.findFirst({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
      }),
    ]);

    let seasonPixels = 0;
    if (activeSeason) {
      const agg = await prisma.userSeasonScore.aggregate({
        where: { seasonId: activeSeason.id },
        _sum: { pixelsPlaced: true },
      });
      seasonPixels = agg._sum.pixelsPlaced ?? 0;
    }

    const retentionApprox =
      cohortEligible > 0 ? Math.round((cohortReturned / cohortEligible) * 1000) / 1000 : null;

    res.json({
      success: true,
      data: {
        totalUsers,
        signupsLast7Days: signups7d,
        dauToday: dau,
        wauRolling7d: wau,
        retention14dApprox: retentionApprox,
        pixelsPlacedLifetime: pixelsSum._sum.pixelsPlaced ?? 0,
        activeSeason: activeSeason
          ? { id: activeSeason.id, name: activeSeason.name, slug: activeSeason.slug }
          : null,
        seasonPixelsPlaced: seasonPixels,
        abuseFlagsUnresolved: flagsOpen,
      },
    });
  } catch (e) {
    next(e);
  }
});

const usersQuerySchema = z.object({
  q: z.string().optional(),
  role: z.enum(['user', 'mod', 'admin', 'head_admin']).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).max(50_000).optional(),
});

adminDashboardRouter.get(
  '/admin/users',
  requireAuth,
  requireAdmin,
  validateRequest({ query: usersQuerySchema }),
  async (req, res, next) => {
    try {
      const q = req.query as z.infer<typeof usersQuerySchema>;
      const take = q.take ?? 40;
      const skip = q.skip ?? 0;
      const search = (q.q || '').trim();
      const roleFilter = q.role;

      const where = {
        ...(search
          ? {
              OR: [
                { username: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
      };

      const [rows, total] = await Promise.all([
        prisma.user.findMany({
          where,
          take,
          skip,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            abuseSuspicionScore: true,
            abuseLockedUntil: true,
            verifiedCreator: true,
            verifiedCreatorLabel: true,
            engagement: {
              select: {
                lastActiveDate: true,
                currentStreak: true,
              },
            },
            pixelStats: {
              select: {
                pixelsPlaced: true,
                lastPlacedAt: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          total,
          users: rows.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
            lastActiveDate: u.engagement?.lastActiveDate ?? null,
            streak: u.engagement?.currentStreak ?? 0,
            pixelsPlaced: u.pixelStats?.pixelsPlaced ?? 0,
            lastPlacedAt: u.pixelStats?.lastPlacedAt?.toISOString() ?? null,
            abuseSuspicionScore: u.abuseSuspicionScore,
            placementLocked: !!(u.abuseLockedUntil && u.abuseLockedUntil > new Date()),
            verifiedCreator: u.verifiedCreator,
            verifiedCreatorLabel: u.verifiedCreatorLabel,
          })),
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

const creatorTrustSchema = z.object({
  verified: z.boolean(),
  label: z.string().max(64).optional(),
});

adminDashboardRouter.patch(
  '/admin/users/:userId/creator',
  requireAuth,
  requireAdmin,
  validateRequest({ body: creatorTrustSchema }),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const body = creatorTrustSchema.parse(req.body);
      const u = await prisma.user.update({
        where: { id: userId },
        data: {
          verifiedCreator: body.verified,
          verifiedCreatorLabel: body.verified ? (body.label ?? 'Verified creator') : null,
          verifiedCreatorAt: body.verified ? new Date() : null,
        },
        select: {
          id: true,
          username: true,
          verifiedCreator: true,
          verifiedCreatorLabel: true,
          verifiedCreatorAt: true,
        },
      });
      res.json({ success: true, data: { user: u } });
    } catch (e) {
      next(e);
    }
  }
);
