import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { AppError } from '../../errors/AppError.js';
import { generateFamilyLinkCode, hashFamilyLinkCode } from '../../lib/familyLinkCode.js';

export const familyRouter = Router();

const CODE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

familyRouter.get('/trust/verified-creators', async (_req, res, next) => {
  try {
    const creators = await prisma.user.findMany({
      where: { verifiedCreator: true },
      select: { username: true, verifiedCreatorLabel: true },
      orderBy: { username: 'asc' },
      take: 500,
    });
    res.json({
      success: true,
      data: {
        creators: creators.map((c) => ({
          username: c.username,
          label: c.verifiedCreatorLabel ?? 'Verified creator',
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});

familyRouter.post('/users/me/family-code', requireAuth, async (req, res, next) => {
  try {
    const code = generateFamilyLinkCode();
    const hash = hashFamilyLinkCode(code);
    const expires = new Date(Date.now() + CODE_TTL_MS);
    await prisma.user.update({
      where: { id: req.auth!.userId },
      data: { familyLinkCodeHash: hash, familyLinkCodeExpiresAt: expires },
    });
    res.json({
      success: true,
      data: { code, expiresAt: expires.toISOString() },
    });
  } catch (e) {
    next(e);
  }
});

const linkSchema = z.object({
  childUsername: z.string().min(2).max(32),
  code: z.string().min(4).max(16),
});

familyRouter.post(
  '/family/link',
  requireAuth,
  validateRequest({ body: linkSchema }),
  async (req, res, next) => {
    try {
      const { childUsername, code } = linkSchema.parse(req.body);
      const parentId = req.auth!.userId;
      const child = await prisma.user.findUnique({
        where: { usernameLower: childUsername.toLowerCase().trim() },
      });
      if (!child) throw new AppError('User not found', 404, 'NOT_FOUND');
      if (child.id === parentId) throw new AppError('Cannot link to yourself', 400, 'BAD_REQUEST');

      const existing = await prisma.familyLink.findUnique({ where: { childUserId: child.id } });
      if (existing) throw new AppError('This account is already linked to a parent', 409, 'ALREADY_LINKED');

      const hash = hashFamilyLinkCode(code);
      if (
        !child.familyLinkCodeHash ||
        child.familyLinkCodeHash !== hash ||
        !child.familyLinkCodeExpiresAt ||
        child.familyLinkCodeExpiresAt <= new Date()
      ) {
        throw new AppError('Invalid or expired pairing code', 400, 'INVALID_CODE');
      }

      await prisma.$transaction([
        prisma.familyLink.create({
          data: { parentUserId: parentId, childUserId: child.id },
        }),
        prisma.user.update({
          where: { id: child.id },
          data: { familyLinkCodeHash: null, familyLinkCodeExpiresAt: null },
        }),
      ]);

      res.json({
        success: true,
        data: { linked: true, childId: child.id, childUsername: child.username },
      });
    } catch (e) {
      next(e);
    }
  }
);

familyRouter.get('/family/children', requireAuth, async (req, res, next) => {
  try {
    const links = await prisma.familyLink.findMany({
      where: { parentUserId: req.auth!.userId },
      include: {
        child: {
          select: {
            id: true,
            username: true,
            safeModeEnabled: true,
            educationalModeEnabled: true,
          },
        },
      },
    });
    res.json({
      success: true,
      data: {
        children: links.map((l) => ({
          childId: l.child.id,
          username: l.child.username,
          safeModeEnabled: l.child.safeModeEnabled,
          educationalModeEnabled: l.child.educationalModeEnabled,
          linkedAt: l.createdAt.toISOString(),
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});

const patchChildSchema = z.object({
  safeModeEnabled: z.boolean().optional(),
  educationalModeEnabled: z.boolean().optional(),
});

familyRouter.patch(
  '/family/child/:childId',
  requireAuth,
  validateRequest({ body: patchChildSchema }),
  async (req, res, next) => {
    try {
      const childId = req.params.childId;
      if (!childId) throw new AppError('childId required', 400, 'BAD_REQUEST');
      const body = patchChildSchema.parse(req.body);
      if (body.safeModeEnabled === undefined && body.educationalModeEnabled === undefined) {
        throw new AppError('No changes', 400, 'BAD_REQUEST');
      }

      const link = await prisma.familyLink.findFirst({
        where: { parentUserId: req.auth!.userId, childUserId: childId },
      });
      if (!link) throw new AppError('Not linked to this account', 403, 'FORBIDDEN');

      const child = await prisma.user.update({
        where: { id: childId },
        data: {
          ...(body.safeModeEnabled !== undefined ? { safeModeEnabled: body.safeModeEnabled } : {}),
          ...(body.educationalModeEnabled !== undefined
            ? { educationalModeEnabled: body.educationalModeEnabled }
            : {}),
        },
        select: {
          id: true,
          username: true,
          safeModeEnabled: true,
          educationalModeEnabled: true,
        },
      });

      res.json({ success: true, data: { child } });
    } catch (e) {
      next(e);
    }
  }
);
