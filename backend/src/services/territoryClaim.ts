import type { Prisma } from '@prisma/client';
import type { Server as IOServer } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import { getActiveSeason } from '../lib/season.js';
import { emitTerritoryPatch } from './broadcastRealtime.js';
import { scheduleLeaderboardEmit } from './leaderboardRealtime.js';

async function adjustFactionTiles(
  tx: Prisma.TransactionClient,
  factionId: string,
  seasonId: string,
  delta: number
): Promise<void> {
  const row = await tx.factionSeasonScore.findUnique({
    where: { factionId_seasonId: { factionId, seasonId } },
  });
  const cur = row?.tilesOwned ?? 0;
  const next = Math.max(0, cur + delta);
  await tx.factionSeasonScore.upsert({
    where: { factionId_seasonId: { factionId, seasonId } },
    create: { factionId, seasonId, tilesOwned: Math.max(0, delta), pixelsFromMembers: 0 },
    update: { tilesOwned: next },
  });
}

export async function claimTerritoryCell(opts: {
  userId: string;
  canvasId: string;
  x: number;
  y: number;
  io?: IOServer | null;
}): Promise<{
  seasonId: string;
  factionId: string;
  factionTag: string;
}> {
  const season = await getActiveSeason();
  if (!season) throw new AppError('No active season', 503, 'NO_SEASON');

  const member = await prisma.factionMember.findUnique({
    where: { userId: opts.userId },
    include: { faction: true },
  });
  if (!member) throw new AppError('Join a faction first', 400, 'NO_FACTION');

  const cid = opts.canvasId.trim();
  if (!cid) throw new AppError('canvasId required', 400, 'BAD_REQUEST');

  const whereCell = {
    seasonId_canvasId_x_y: {
      seasonId: season.id,
      canvasId: cid,
      x: opts.x,
      y: opts.y,
    },
  };

  await prisma.$transaction(async (tx) => {
    await tx.factionSeasonScore.upsert({
      where: { factionId_seasonId: { factionId: member.factionId, seasonId: season.id } },
      create: {
        factionId: member.factionId,
        seasonId: season.id,
        tilesOwned: 0,
        pixelsFromMembers: 0,
      },
      update: {},
    });

    const prev = await tx.territoryCell.findUnique({ where: whereCell });

    await tx.territoryCell.upsert({
      where: whereCell,
      create: {
        seasonId: season.id,
        canvasId: cid,
        x: opts.x,
        y: opts.y,
        factionId: member.factionId,
        placedByUserId: opts.userId,
      },
      update: {
        factionId: member.factionId,
        placedByUserId: opts.userId,
      },
    });

    if (!prev) {
      await adjustFactionTiles(tx, member.factionId, season.id, 1);
    } else if (prev.factionId !== member.factionId) {
      await adjustFactionTiles(tx, prev.factionId, season.id, -1);
      await adjustFactionTiles(tx, member.factionId, season.id, 1);
    }

    await tx.userSeasonScore.upsert({
      where: {
        userId_seasonId: { userId: opts.userId, seasonId: season.id },
      },
      create: {
        userId: opts.userId,
        seasonId: season.id,
        tilesCaptured: 1,
        pixelsPlaced: 1,
      },
      update: {
        tilesCaptured: { increment: 1 },
        pixelsPlaced: { increment: 1 },
      },
    });

    await tx.factionSeasonScore.updateMany({
      where: { factionId: member.factionId, seasonId: season.id },
      data: { pixelsFromMembers: { increment: 1 } },
    });
  });

  const out = {
    seasonId: season.id,
    factionId: member.factionId,
    factionTag: member.faction.tag,
  };

  if (opts.io) {
    emitTerritoryPatch(opts.io, season.id, {
      canvasId: cid,
      x: opts.x,
      y: opts.y,
      factionId: member.factionId,
      factionTag: member.faction.tag,
      placedByUserId: opts.userId,
    });
    scheduleLeaderboardEmit(opts.io, season.id);
  }

  return out;
}
