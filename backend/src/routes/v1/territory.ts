import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { claimTerritoryCell } from '../../services/territoryClaim.js';
import { getIoInstance } from '../../socket/socketHub.js';
import {
  finalizeTerritoryClaimOk,
  gateTerritoryClaim,
} from '../../services/abuseOrchestrator.js';

export const territoryRouter = Router();

const claimSchema = z.object({
  canvasId: z.string().min(1).max(128),
  x: z.number().int(),
  y: z.number().int(),
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

territoryRouter.post(
  '/territory/claim',
  requireAuth,
  validateRequest({ body: claimSchema }),
  async (req, res, next) => {
    try {
      const body = claimSchema.parse(req.body);
      const userId = req.auth!.userId;

      await gateTerritoryClaim({
        userId,
        behavior: body.behavior,
        fingerprint: body.fingerprint,
        captchaToken: body.captchaToken,
        req,
      });

      const data = await claimTerritoryCell({
        userId,
        canvasId: body.canvasId,
        x: body.x,
        y: body.y,
        io: getIoInstance(),
      });

      await finalizeTerritoryClaimOk({
        userId,
        behavior: body.behavior,
        fingerprint: body.fingerprint,
      });

      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
);
