import { prisma } from '../lib/prisma.js';

/** Machine-readable GDPR-style export (password hashes and secrets excluded). */
export async function buildUserDataExport(userId: string): Promise<Record<string, unknown>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      progress: true,
      pixelStats: true,
      achievements: { include: { achievement: true } },
      engagement: true,
      inventoryItems: { include: { item: true } },
      deviceFingerprints: true,
      abuseFlags: true,
      consent: true,
      factionsCreated: true,
      factionInvitesCreated: true,
      factionMember: { include: { faction: true } },
      factionMessages: { include: { faction: { select: { id: true, name: true, tag: true } } } },
      territoryPlacements: {
        include: {
          season: { select: { id: true, slug: true, name: true } },
          faction: { select: { id: true, tag: true } },
        },
      },
      userSeasonScores: { include: { season: { select: { id: true, slug: true, name: true } } } },
    },
  });

  if (!user) return { schemaVersion: 1, error: 'USER_NOT_FOUND' };

  const { passwordHash: _omit, ...userSafe } = user;

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    purpose:
      'Personal data export under GDPR Article 15 / similar rights. Review and store securely.',
    user: userSafe,
  };
}
