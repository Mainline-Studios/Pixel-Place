import type { Server as IOServer } from 'socket.io';
import { verifyAccessToken } from '../auth/jwt.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { claimTerritoryCell } from '../services/territoryClaim.js';
import { emitLeaderboardUpdateImmediate } from '../services/broadcastRealtime.js';

const NS = '/factions';

export function registerFactionSockets(io: IOServer): void {
  const nsp = io.of(NS);

  nsp.use((socket, next) => {
    const raw =
      (socket.handshake.auth as { token?: string } | undefined)?.token ??
      (typeof socket.handshake.headers.authorization === 'string'
        ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
        : undefined);
    if (!raw) {
      next(new Error('Unauthorized'));
      return;
    }
    try {
      const p = verifyAccessToken(raw);
      socket.data.userId = p.sub;
      socket.data.username = p.username;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  nsp.on('connection', (socket) => {
    logger.debug({ socketId: socket.id, ns: NS }, 'faction socket connected');

    socket.on('faction:subscribe', async (payload: { factionId?: string }, cb) => {
      try {
        const factionId = payload?.factionId;
        if (!factionId) return cb?.({ ok: false, error: 'BAD_REQUEST' });
        const m = await prisma.factionMember.findUnique({
          where: { userId: socket.data.userId as string },
        });
        if (!m || m.factionId !== factionId) {
          socket.emit('faction:error', { code: 'NOT_IN_FACTION' });
          return cb?.({ ok: false, error: 'NOT_IN_FACTION' });
        }
        await socket.join(`faction:${factionId}`);
        socket.emit('faction:subscribed', { factionId });
        cb?.({ ok: true });
      } catch (e) {
        logger.error({ err: e }, 'faction:subscribe failed');
        cb?.({ ok: false });
      }
    });

    socket.on(
      'faction:chat',
      async (payload: { factionId?: string; body?: string }, cb) => {
        try {
          const factionId = payload?.factionId;
          const body = (payload?.body ?? '').trim().slice(0, 2000);
          if (!factionId || !body) return cb?.({ ok: false, error: 'BAD_REQUEST' });

          const m = await prisma.factionMember.findUnique({
            where: { userId: socket.data.userId as string },
          });
          if (!m || m.factionId !== factionId) {
            socket.emit('faction:error', { code: 'NOT_IN_FACTION' });
            return cb?.({ ok: false });
          }

          const msg = await prisma.factionChatMessage.create({
            data: {
              factionId,
              userId: socket.data.userId as string,
              body,
            },
          });

          const out = {
            factionId,
            id: msg.id,
            userId: msg.userId,
            username: socket.data.username as string,
            body: msg.body,
            createdAt: msg.createdAt.toISOString(),
          };
          nsp.to(`faction:${factionId}`).emit('faction:chat', out);
          cb?.({ ok: true, id: msg.id });
        } catch (e) {
          logger.error({ err: e }, 'faction:chat failed');
          cb?.({ ok: false });
        }
      }
    );

    socket.on('canvas:subscribe', (payload: { canvasId?: string; seasonId?: string }, cb) => {
      const canvasId = payload?.canvasId?.trim();
      const seasonId = payload?.seasonId?.trim();
      if (!canvasId || !seasonId) return cb?.({ ok: false });
      void socket.join(`canvas:${canvasId}:${seasonId}`);
      socket.emit('canvas:subscribed', { canvasId, seasonId });
      cb?.({ ok: true });
    });

    socket.on('leaderboard:subscribe', async (payload: { seasonId?: string }, cb) => {
      const seasonId = payload?.seasonId?.trim();
      if (!seasonId) return cb?.({ ok: false });
      await socket.join(`leaderboard:${seasonId}`);
      await emitLeaderboardUpdateImmediate(io, seasonId);
      cb?.({ ok: true });
    });

    socket.on('season:subscribe', (payload: { seasonId?: string }, cb) => {
      const seasonId = payload?.seasonId?.trim();
      if (!seasonId) return cb?.({ ok: false });
      void socket.join(`season:${seasonId}`);
      cb?.({ ok: true });
    });

    socket.on(
      'territory:claim',
      async (payload: { canvasId?: string; x?: number; y?: number }, cb) => {
        try {
          const canvasId = payload?.canvasId?.trim() ?? '';
          const x = Number(payload?.x);
          const y = Number(payload?.y);
          if (!canvasId || !Number.isFinite(x) || !Number.isFinite(y)) {
            return cb?.({ ok: false, error: 'BAD_REQUEST' });
          }
          await claimTerritoryCell({
            userId: socket.data.userId as string,
            canvasId,
            x: Math.floor(x),
            y: Math.floor(y),
            io,
          });
          cb?.({ ok: true });
        } catch (e: unknown) {
          logger.warn({ err: e }, 'territory:claim failed');
          socket.emit('territory:error', {
            message: e instanceof Error ? e.message : 'CLAIM_FAILED',
          });
          cb?.({ ok: false });
        }
      }
    );

    socket.on('disconnect', (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'faction socket disconnected');
    });
  });
}
