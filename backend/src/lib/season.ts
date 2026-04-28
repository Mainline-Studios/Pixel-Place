import { prisma } from './prisma.js';



export async function getActiveSeason() {

  return prisma.season.findFirst({

    where: { isActive: true },

    orderBy: { startsAt: 'desc' },

  });

}



export async function requireActiveSeasonId(): Promise<string> {

  const s = await getActiveSeason();

  if (!s) throw new Error('NO_ACTIVE_SEASON');

  return s.id;

}


