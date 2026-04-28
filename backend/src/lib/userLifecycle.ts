import type { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

const STARTER_ITEMS = [
  { itemId: 'starter_spray', quantity: 1 },
  { itemId: 'pixel_sticker', quantity: 1 },
] as const;

export const defaultUserIncludes = {
  profile: true,
  progress: true,
  pixelStats: true,
  engagement: true,
  achievements: { include: { achievement: true } },
  inventoryItems: { include: { item: true } },
  familyAsChild: { select: { id: true, parentUserId: true } },
} satisfies Prisma.UserInclude;

/** Ensures progression rows + starter inventory exist (for legacy users created before these tables). */
export async function ensureUserLifecycle(userId: string): Promise<void> {
  await prisma.userProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  await prisma.userProgress.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  await prisma.pixelStats.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  await prisma.userEngagement.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const count = await prisma.userInventoryItem.count({ where: { userId } });
  if (count === 0) {
    await prisma.userInventoryItem.createMany({
      data: STARTER_ITEMS.map((s) => ({
        userId,
        itemId: s.itemId,
        quantity: s.quantity,
      })),
      skipDuplicates: true,
    });
  }
}

export function nestedCreateForNewUser(): Pick<
  Prisma.UserCreateInput,
  'profile' | 'progress' | 'pixelStats' | 'engagement' | 'inventoryItems'
> {
  return {
    profile: { create: {} },
    progress: { create: {} },
    pixelStats: { create: {} },
    engagement: { create: {} },
    inventoryItems: {
      create: [...STARTER_ITEMS.map((s) => ({ itemId: s.itemId, quantity: s.quantity }))],
    },
  };
}
