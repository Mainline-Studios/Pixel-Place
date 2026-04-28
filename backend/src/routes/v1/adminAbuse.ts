import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';

export const adminAbuseRouter = Router();

adminAbuseRouter.get('/admin/abuse-flags', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 40));
    const rows = await prisma.abuseReviewFlag.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, username: true } },
      },
    });
    res.json({
      success: true,
      data: {
        flags: rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          username: r.user.username,
          reason: r.reason,
          scoreSnapshot: r.scoreSnapshot,
          metadata: r.metadata,
          createdAt: r.createdAt.toISOString(),
          resolvedAt: r.resolvedAt?.toISOString() ?? null,
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});
