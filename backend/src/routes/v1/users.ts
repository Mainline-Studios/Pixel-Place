import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { AppError } from '../../errors/AppError.js';
import { ensureUserLifecycle, defaultUserIncludes } from '../../lib/userLifecycle.js';
import { serializeUserPublic } from '../../lib/serializeUser.js';
import { serializeAchievement } from '../../lib/achievements.js';
import { utcDateString } from '../../lib/dailyReward.js';

export const usersRouter = Router();

usersRouter.get('/users/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    await ensureUserLifecycle(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: defaultUserIncludes,
    });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const today = utcDateString();
    if (user.engagement?.lastActiveDate !== today) {
      await prisma.userEngagement.update({
        where: { userId },
        data: { lastActiveDate: today },
      });
      user.engagement = {
        ...user.engagement!,
        lastActiveDate: today,
      };
    }

    const allAchievements = await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
    const unlockedMap = new Map(user.achievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

    const payload = serializeUserPublic(user);
    payload.achievements.list = allAchievements.map((a) =>
      serializeAchievement(a, unlockedMap.has(a.id), unlockedMap.get(a.id))
    );

    res.json({ success: true, data: { user: payload } });
  } catch (e) {
    next(e);
  }
});

const patchSchema = z.object({
  gender: z.string().optional(),
  equippedSkin: z.string().optional(),
  equippedFace: z.string().nullable().optional(),
});

usersRouter.patch(
  '/users/me',
  requireAuth,
  validateRequest({ body: patchSchema }),
  async (req, res, next) => {
    try {
      const body = patchSchema.parse(req.body);
      const user = await prisma.user.update({
        where: { id: req.auth!.userId },
        data: {
          ...(body.gender !== undefined ? { gender: body.gender } : {}),
          ...(body.equippedSkin !== undefined ? { equippedSkin: body.equippedSkin } : {}),
          ...(body.equippedFace !== undefined ? { equippedFace: body.equippedFace } : {}),
        },
        include: defaultUserIncludes,
      });
      await ensureUserLifecycle(user.id);

      const allAchievements = await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
      const unlockedMap = new Map(user.achievements.map((ua) => [ua.achievementId, ua.unlockedAt]));
      const payload = serializeUserPublic(user);
      payload.achievements.list = allAchievements.map((a) =>
        serializeAchievement(a, unlockedMap.has(a.id), unlockedMap.get(a.id))
      );

      res.json({ success: true, data: { user: payload } });
    } catch (e) {
      next(e);
    }
  }
);

const profilePatchSchema = z.object({
  displayName: z.string().max(64).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatarUrl: z.union([z.string().url().max(2048), z.literal('')]).nullable().optional(),
});

usersRouter.patch(
  '/users/me/profile',
  requireAuth,
  validateRequest({ body: profilePatchSchema }),
  async (req, res, next) => {
    try {
      const body = profilePatchSchema.parse(req.body);
      const userId = req.auth!.userId;
      await ensureUserLifecycle(userId);

      await prisma.userProfile.update({
        where: { userId },
        data: {
          ...(body.displayName !== undefined ? { displayName: body.displayName || null } : {}),
          ...(body.bio !== undefined ? { bio: body.bio || null } : {}),
          ...(body.avatarUrl !== undefined
            ? { avatarUrl: body.avatarUrl === '' ? null : body.avatarUrl }
            : {}),
        },
      });

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: defaultUserIncludes,
      });

      const allAchievements = await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
      const unlockedMap = new Map(user.achievements.map((ua) => [ua.achievementId, ua.unlockedAt]));
      const payload = serializeUserPublic(user);
      payload.achievements.list = allAchievements.map((a) =>
        serializeAchievement(a, unlockedMap.has(a.id), unlockedMap.get(a.id))
      );

      res.json({ success: true, data: { user: payload } });
    } catch (e) {
      next(e);
    }
  }
);

const trustPatchSchema = z.object({
  safeModeEnabled: z.boolean().optional(),
  educationalModeEnabled: z.boolean().optional(),
});

usersRouter.patch(
  '/users/me/trust',
  requireAuth,
  validateRequest({ body: trustPatchSchema }),
  async (req, res, next) => {
    try {
      const body = trustPatchSchema.parse(req.body);
      if (body.safeModeEnabled === undefined && body.educationalModeEnabled === undefined) {
        throw new AppError('No changes', 400, 'BAD_REQUEST');
      }

      const managed = await prisma.familyLink.findUnique({
        where: { childUserId: req.auth!.userId },
      });
      if (managed) {
        throw new AppError(
          'These settings are managed by a linked parent. Use Parent controls.',
          403,
          'PARENT_MANAGED'
        );
      }

      const user = await prisma.user.update({
        where: { id: req.auth!.userId },
        data: {
          ...(body.safeModeEnabled !== undefined ? { safeModeEnabled: body.safeModeEnabled } : {}),
          ...(body.educationalModeEnabled !== undefined
            ? { educationalModeEnabled: body.educationalModeEnabled }
            : {}),
        },
        include: defaultUserIncludes,
      });

      await ensureUserLifecycle(user.id);
      const allAchievements = await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
      const unlockedMap = new Map(user.achievements.map((ua) => [ua.achievementId, ua.unlockedAt]));
      const payload = serializeUserPublic(user);
      payload.achievements.list = allAchievements.map((a) =>
        serializeAchievement(a, unlockedMap.has(a.id), unlockedMap.get(a.id))
      );
      res.json({ success: true, data: { user: payload } });
    } catch (e) {
      next(e);
    }
  }
);
