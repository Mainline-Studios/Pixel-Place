import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { AppError } from '../../errors/AppError.js';
import { randomInviteCode, normalizeFactionTag } from '../../services/inviteCode.js';

export const factionsRouter = Router();

const createSchema = z.object({
  name: z.string().min(2).max(48),
  tag: z.string().min(2).max(4),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

factionsRouter.post(
  '/factions',
  requireAuth,
  validateRequest({ body: createSchema }),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const body = createSchema.parse(req.body);
      const tag = normalizeFactionTag(body.tag);
      if (tag.length < 2) throw new AppError('Faction tag must be 2–4 characters', 400, 'BAD_TAG');

      const existingMember = await prisma.factionMember.findUnique({ where: { userId } });
      if (existingMember) throw new AppError('Already in a faction', 409, 'ALREADY_IN_FACTION');

      const tagTaken = await prisma.faction.findUnique({ where: { tag } });
      if (tagTaken) throw new AppError('Tag already taken', 409, 'TAG_TAKEN');

      const faction = await prisma.$transaction(async (tx) => {
        const f = await tx.faction.create({
          data: {
            name: body.name.trim(),
            tag,
            color: body.color ?? '#6366f1',
            createdById: userId,
          },
        });
        await tx.factionMember.create({
          data: {
            userId,
            factionId: f.id,
            role: 'leader',
          },
        });
        return f;
      });

      res.status(201).json({ success: true, data: { factionId: faction.id, tag: faction.tag } });
    } catch (e) {
      next(e);
    }
  }
);

factionsRouter.get('/factions/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const m = await prisma.factionMember.findUnique({
      where: { userId },
      include: {
        faction: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });
    if (!m) {
      res.json({ success: true, data: { membership: null } });
      return;
    }
    res.json({
      success: true,
      data: {
        membership: {
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
          faction: {
            id: m.faction.id,
            name: m.faction.name,
            tag: m.faction.tag,
            color: m.faction.color,
            memberCount: m.faction._count.members,
          },
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

factionsRouter.get('/factions/:factionId', requireAuth, async (req, res, next) => {
  try {
    const { factionId } = req.params;
    const f = await prisma.faction.findUnique({
      where: { id: factionId },
      include: {
        _count: { select: { members: true } },
        members: {
          take: 100,
          include: { user: { select: { id: true, username: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!f) throw new AppError('Faction not found', 404, 'NOT_FOUND');

    res.json({
      success: true,
      data: {
        faction: {
          id: f.id,
          name: f.name,
          tag: f.tag,
          color: f.color,
          createdAt: f.createdAt.toISOString(),
          memberCount: f._count.members,
          members: f.members.map((m) => ({
            userId: m.userId,
            username: m.user.username,
            role: m.role,
            joinedAt: m.joinedAt.toISOString(),
          })),
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

const inviteCreateSchema = z.object({
  maxUses: z.number().int().min(1).max(500).optional(),
  expiresInHours: z.number().int().min(1).max(720).optional(),
});

factionsRouter.post(
  '/factions/:factionId/invites',
  requireAuth,
  validateRequest({ body: inviteCreateSchema }),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const { factionId } = req.params;
      const body = inviteCreateSchema.parse(req.body);

      const m = await prisma.factionMember.findUnique({
        where: { userId },
      });
      if (!m || m.factionId !== factionId || m.role !== 'leader') {
        throw new AppError('Leader only', 403, 'FORBIDDEN');
      }

      let code = randomInviteCode(10);
      for (let i = 0; i < 5; i++) {
        const clash = await prisma.factionInvite.findUnique({ where: { code } });
        if (!clash) break;
        code = randomInviteCode(10);
      }

      const expiresAt =
        body.expiresInHours != null
          ? new Date(Date.now() + body.expiresInHours * 3600_000)
          : null;

      const inv = await prisma.factionInvite.create({
        data: {
          code,
          factionId,
          createdById: userId,
          maxUses: body.maxUses ?? 50,
          expiresAt,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          code: inv.code,
          expiresAt: inv.expiresAt?.toISOString() ?? null,
          maxUses: inv.maxUses,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

const joinSchema = z.object({
  code: z.string().min(4).max(16),
});

factionsRouter.post(
  '/factions/join',
  requireAuth,
  validateRequest({ body: joinSchema }),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const code = req.body.code.trim().toUpperCase();

      const existing = await prisma.factionMember.findUnique({ where: { userId } });
      if (existing) throw new AppError('Already in a faction', 409, 'ALREADY_IN_FACTION');

      const invite = await prisma.factionInvite.findUnique({
        where: { code },
        include: { faction: true },
      });
      if (!invite) throw new AppError('Invalid code', 404, 'INVALID_CODE');
      if (invite.expiresAt && invite.expiresAt < new Date()) {
        throw new AppError('Invite expired', 410, 'EXPIRED');
      }
      if (invite.useCount >= invite.maxUses) throw new AppError('Invite exhausted', 410, 'EXHAUSTED');

      await prisma.$transaction(async (tx) => {
        await tx.factionInvite.update({
          where: { id: invite.id },
          data: { useCount: { increment: 1 } },
        });
        await tx.factionMember.create({
          data: {
            userId,
            factionId: invite.factionId,
            role: 'member',
          },
        });
      });

      res.json({
        success: true,
        data: {
          factionId: invite.factionId,
          tag: invite.faction.tag,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

factionsRouter.delete('/factions/:factionId/members/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { factionId } = req.params;

    const m = await prisma.factionMember.findUnique({
      where: { userId },
      include: { faction: true },
    });
    if (!m || m.factionId !== factionId) throw new AppError('Not a member', 400, 'NOT_MEMBER');

    const count = await prisma.factionMember.count({ where: { factionId } });

    if (m.role === 'leader' && count > 1) {
      throw new AppError('Transfer leadership before leaving', 409, 'TRANSFER_FIRST');
    }

    await prisma.$transaction(async (tx) => {
      await tx.factionMember.delete({ where: { userId } });
      if (count === 1) {
        await tx.faction.delete({ where: { id: factionId } });
      }
    });

    res.json({ success: true, data: { left: true } });
  } catch (e) {
    next(e);
  }
});

const roleSchema = z.object({
  role: z.enum(['leader', 'member']),
  targetUserId: z.string().min(1),
});

factionsRouter.patch(
  '/factions/:factionId/members/role',
  requireAuth,
  validateRequest({ body: roleSchema }),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const { factionId } = req.params;
      const body = roleSchema.parse(req.body);

      const leader = await prisma.factionMember.findUnique({ where: { userId } });
      if (!leader || leader.factionId !== factionId || leader.role !== 'leader') {
        throw new AppError('Leader only', 403, 'FORBIDDEN');
      }

      const target = await prisma.factionMember.findUnique({
        where: { userId: body.targetUserId },
      });
      if (!target || target.factionId !== factionId) throw new AppError('Target not in faction', 404);

      await prisma.$transaction(async (tx) => {
        if (body.role === 'leader') {
          if (body.targetUserId === userId) {
            throw new AppError('Pick another player to become leader', 400, 'BAD_REQUEST');
          }
          await tx.factionMember.update({
            where: { userId },
            data: { role: 'member' },
          });
          await tx.factionMember.update({
            where: { userId: body.targetUserId },
            data: { role: 'leader' },
          });
        } else {
          if (target.role === 'leader') {
            throw new AppError('Transfer leadership first; cannot demote the leader directly', 409);
          }
          await tx.factionMember.update({
            where: { userId: body.targetUserId },
            data: { role: 'member' },
          });
        }
      });

      res.json({ success: true, data: { ok: true } });
    } catch (e) {
      next(e);
    }
  }
);

factionsRouter.get('/factions/:factionId/chat', requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { factionId } = req.params;
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const m = await prisma.factionMember.findUnique({ where: { userId } });
    if (!m || m.factionId !== factionId) throw new AppError('Not in this faction', 403);

    const rows = await prisma.factionChatMessage.findMany({
      where: { factionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { username: true } } },
    });

    res.json({
      success: true,
      data: {
        messages: rows.reverse().map((r) => ({
          id: r.id,
          userId: r.userId,
          username: r.user.username,
          body: r.body,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});
