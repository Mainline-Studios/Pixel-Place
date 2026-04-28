import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { AppError } from '../../errors/AppError.js';
import { getIoInstance } from '../../socket/socketHub.js';
import { emitSeasonEvent } from '../../services/broadcastRealtime.js';

export const seasonsRouter = Router();

seasonsRouter.get('/seasons/current', async (_req, res, next) => {
  try {
    const s = await prisma.season.findFirst({
      where: { isActive: true },
      orderBy: { startsAt: 'desc' },
    });
    if (!s) {
      res.json({ success: true, data: { season: null } });
      return;
    }
    res.json({
      success: true,
      data: {
        season: {
          id: s.id,
          slug: s.slug,
          name: s.name,
          startsAt: s.startsAt.toISOString(),
          endsAt: s.endsAt?.toISOString() ?? null,
          eventTag: s.eventTag,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

const createSeasonSchema = z.object({
  slug: z.string().min(1).max(48),
  name: z.string().min(1).max(80),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  eventTag: z.string().max(48).nullable().optional(),
});

seasonsRouter.post(
  '/seasons',
  requireAuth,
  requireAdmin,
  validateRequest({ body: createSeasonSchema }),
  async (req, res, next) => {
    try {
      const body = createSeasonSchema.parse(req.body);
      const exists = await prisma.season.findUnique({ where: { slug: body.slug } });
      if (exists) throw new AppError('Slug already used', 409, 'DUPLICATE');

      const s = await prisma.season.create({
        data: {
          slug: body.slug,
          name: body.name,
          startsAt: body.startsAt ? new Date(body.startsAt) : new Date(),
          endsAt: body.endsAt != null ? (body.endsAt ? new Date(body.endsAt) : null) : null,
          isActive: false,
          eventTag: body.eventTag ?? null,
        },
      });

      res.status(201).json({
        success: true,
        data: { seasonId: s.id, slug: s.slug },
      });
    } catch (e) {
      next(e);
    }
  }
);

seasonsRouter.post('/seasons/:seasonId/activate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const seasonId = req.params.seasonId;
    if (!seasonId) throw new AppError('Missing season id', 400);
    const nextSeason = await prisma.season.findUnique({ where: { id: seasonId } });
    if (!nextSeason) throw new AppError('Season not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.season.updateMany({ data: { isActive: false } });
      await tx.season.update({
        where: { id: seasonId },
        data: { isActive: true },
      });
    });

    const io = getIoInstance();
    if (io) {
      emitSeasonEvent(io, {
        seasonId,
        type: 'activated',
        label: nextSeason.name,
      });
      io.of('/factions').to(`season:${seasonId}`).emit('season:tick', {
        seasonId,
        phase: 'active',
        name: nextSeason.name,
        eventTag: nextSeason.eventTag,
      });
    }

    res.json({ success: true, data: { activeSeasonId: seasonId } });
  } catch (e) {
    next(e);
  }
});

seasonsRouter.post('/seasons/:seasonId/end-event', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const seasonId = req.params.seasonId;
    if (!seasonId) throw new AppError('Missing season id', 400);
    const s = await prisma.season.findUnique({ where: { id: seasonId } });
    if (!s) throw new AppError('Season not found', 404);

    await prisma.season.update({
      where: { id: seasonId },
      data: {
        endsAt: new Date(),
        eventTag: null,
      },
    });

    const io = getIoInstance();
    if (io) {
      emitSeasonEvent(io, { seasonId, type: 'event_ended', label: s.name });
      io.of('/factions').to(`season:${seasonId}`).emit('season:tick', {
        seasonId,
        phase: 'event_ended',
      });
    }

    res.json({ success: true, data: { ended: true } });
  } catch (e) {
    next(e);
  }
});
