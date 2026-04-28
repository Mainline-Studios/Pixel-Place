import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { cachedJson } from '../lib/cacheJson.js';

export async function globalLeaderboard(seasonId: string, limit = 50) {
  const rows = await prisma.userSeasonScore.findMany({
    where: { seasonId },
    orderBy: [{ pixelsPlaced: 'desc' }, { tilesCaptured: 'desc' }],
    take: limit,
    include: { user: { select: { id: true, username: true } } },
  });
  return rows.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    username: r.user.username,
    pixelsPlaced: r.pixelsPlaced,
    tilesCaptured: r.tilesCaptured,
  }));
}

export async function factionLeaderboard(seasonId: string, limit = 50) {
  const rows = await prisma.factionSeasonScore.findMany({
    where: { seasonId },
    orderBy: [{ tilesOwned: 'desc' }, { pixelsFromMembers: 'desc' }],
    take: limit,
    include: { faction: { select: { id: true, name: true, tag: true, color: true } } },
  });
  return rows.map((r, i) => ({
    rank: i + 1,
    factionId: r.factionId,
    name: r.faction.name,
    tag: r.faction.tag,
    color: r.faction.color,
    tilesOwned: r.tilesOwned,
    pixelsFromMembers: r.pixelsFromMembers,
  }));
}

export function globalLeaderboardCached(seasonId: string, limit = 50) {
  const ttl = env.LEADERBOARD_CACHE_TTL_SEC;
  const key = `lb:global:v1:${seasonId}:${limit}`;
  return cachedJson(key, ttl, () => globalLeaderboard(seasonId, limit));
}

export function factionLeaderboardCached(seasonId: string, limit = 50) {
  const ttl = env.LEADERBOARD_CACHE_TTL_SEC;
  const key = `lb:factions:v1:${seasonId}:${limit}`;
  return cachedJson(key, ttl, () => factionLeaderboard(seasonId, limit));
}
