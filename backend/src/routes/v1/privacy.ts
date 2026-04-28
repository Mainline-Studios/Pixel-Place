import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { privacyDeleteLimiter, privacyExportLimiter } from '../../middleware/rateLimit.js';
import { env } from '../../config/env.js';
import { buildUserDataExport } from '../../services/userDataExport.js';
import { deleteUserAccount } from '../../services/accountDeletion.js';
import { ensureUserLifecycle } from '../../lib/userLifecycle.js';

export const privacyRouter = Router();

privacyRouter.get('/privacy/legal-versions', (_req, res) => {
  res.json({
    success: true,
    data: {
      termsVersion: env.LEGAL_TERMS_VERSION,
      privacyVersion: env.LEGAL_PRIVACY_VERSION,
    },
  });
});

privacyRouter.get('/users/me/consent', requireAuth, async (req, res, next) => {
  try {
    const consent = await prisma.userConsent.findUnique({
      where: { userId: req.auth!.userId },
    });
    res.json({
      success: true,
      data: {
        consent,
        currentTermsVersion: env.LEGAL_TERMS_VERSION,
        currentPrivacyVersion: env.LEGAL_PRIVACY_VERSION,
      },
    });
  } catch (e) {
    next(e);
  }
});

const consentPatchSchema = z.object({
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  analyticsCookies: z.boolean().optional(),
  marketingCookies: z.boolean().optional(),
});

privacyRouter.patch(
  '/users/me/consent',
  requireAuth,
  validateRequest({ body: consentPatchSchema }),
  async (req, res, next) => {
    try {
      const body = consentPatchSchema.parse(req.body);
      await ensureUserLifecycle(req.auth!.userId);

      const consent = await prisma.userConsent.upsert({
        where: { userId: req.auth!.userId },
        create: {
          userId: req.auth!.userId,
          termsVersion: env.LEGAL_TERMS_VERSION,
          privacyVersion: env.LEGAL_PRIVACY_VERSION,
          analyticsCookies: body.analyticsCookies ?? false,
          marketingCookies: body.marketingCookies ?? false,
        },
        update: {
          termsVersion: env.LEGAL_TERMS_VERSION,
          privacyVersion: env.LEGAL_PRIVACY_VERSION,
          ...(body.analyticsCookies !== undefined ? { analyticsCookies: body.analyticsCookies } : {}),
          ...(body.marketingCookies !== undefined ? { marketingCookies: body.marketingCookies } : {}),
        },
      });

      res.json({ success: true, data: { consent } });
    } catch (e) {
      next(e);
    }
  }
);

privacyRouter.get(
  '/users/me/export',
  requireAuth,
  privacyExportLimiter,
  async (req, res, next) => {
    try {
      await ensureUserLifecycle(req.auth!.userId);
      const bundle = await buildUserDataExport(req.auth!.userId);
      const filename = `pixel-place-export-${req.auth!.userId}-${Date.now()}.json`;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(JSON.stringify(bundle, null, 2));
    } catch (e) {
      next(e);
    }
  }
);

const deleteSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
  password: z.string().optional(),
});

privacyRouter.post(
  '/users/me/delete',
  requireAuth,
  privacyDeleteLimiter,
  validateRequest({ body: deleteSchema }),
  async (req, res, next) => {
    try {
      const body = deleteSchema.parse(req.body);
      await deleteUserAccount({
        userId: req.auth!.userId,
        confirmation: body.confirmation,
        password: body.password,
      });
      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (e) {
      next(e);
    }
  }
);
