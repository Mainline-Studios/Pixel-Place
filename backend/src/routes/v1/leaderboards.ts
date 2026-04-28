import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validate.js';
import { factionLeaderboardCached, globalLeaderboardCached } from '../../services/leaderboardQuery.js';
import { getActiveSeason } from '../../lib/season.js';

export const leaderboardsRouter = Router();

const querySchema = z.object({
  seasonId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

leaderboardsRouter.get(
  '/leaderboards/global',
  validateRequest({ query: querySchema }),
  async (req, res, next) => {
    try {
      const q = querySchema.parse(req.query);
      const season = q.seasonId
        ? { id: q.seasonId }
        : await getActiveSeason();
      if (!season) {
        res.json({ success: true, data: { rows: [], seasonId: null } });
        return;
      }
      const rows = await globalLeaderboardCached(season.id, q.limit ?? 50);
      res.json({ success: true, data: { seasonId: season.id, rows } });
    } catch (e) {
      next(e);
    }
  }
);

leaderboardsRouter.get(
  '/leaderboards/factions',
  validateRequest({ query: querySchema }),
  async (req, res, next) => {
    try {
      const q = querySchema.parse(req.query);
      const season = q.seasonId
        ? { id: q.seasonId }
        : await getActiveSeason();
      if (!season) {
        res.json({ success: true, data: { rows: [], seasonId: null } });
        return;
      }
      const rows = await factionLeaderboardCached(season.id, q.limit ?? 50);
      res.json({ success: true, data: { seasonId: season.id, rows } });
    } catch (e) {
      next(e);
    }
  }
);
