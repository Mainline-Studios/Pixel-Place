import type { Prisma } from '@prisma/client';
import { xpIntoCurrentLevel } from './xp.js';
import { serializeAchievement } from './achievements.js';
import type { defaultUserIncludes } from './userLifecycle.js';
import { buildBillingPayload } from './billing/serializeBilling.js';
import { buildAbusePayload } from './abuse/serializeAbuse.js';
import { effectiveRoleForBuiltinAccount } from './builtinAdminRole.js';

export type UserWithProgression = Prisma.UserGetPayload<{ include: typeof defaultUserIncludes }>;

export function serializeUserPublic(user: UserWithProgression) {
  const xp = user.progress?.xp ?? 0;
  const bar = xpIntoCurrentLevel(xp);

  return {
    id: user.id,
    username: user.username,
    gender: user.gender,
    role: effectiveRoleForBuiltinAccount(user.username, user.role),
    coins: user.coins,
    safetyPoints: user.safetyPoints,
    ownedSkins: user.ownedSkins,
    equippedSkin: user.equippedSkin,
    ownedFaces: user.ownedFaces,
    equippedFace: user.equippedFace,
    ownedAccessories: user.ownedAccessories,
    equippedAccessories: user.equippedAccessories,
    friends: user.friends,
    email: user.email,

    profile: {
      displayName: user.profile?.displayName ?? null,
      bio: user.profile?.bio ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
    },

    progression: {
      xp,
      level: bar.level,
      xpIntoLevel: bar.xpIntoLevel,
      xpForNextLevel: bar.xpForNextLevel,
      pixelsPlaced: user.pixelStats?.pixelsPlaced ?? 0,
      lastPlacedAt: user.pixelStats?.lastPlacedAt?.toISOString() ?? null,
    },

    engagement: {
      currentStreak: user.engagement?.currentStreak ?? 0,
      longestStreak: user.engagement?.longestStreak ?? 0,
      lastDailyClaimDate: user.engagement?.lastDailyClaimDate ?? null,
      lastActiveDate: user.engagement?.lastActiveDate ?? null,
    },

    achievements: {
      list: [] as ReturnType<typeof serializeAchievement>[],
    },

    inventory: user.inventoryItems.map((row) => ({
      itemId: row.itemId,
      name: row.item.name,
      description: row.item.description,
      type: row.item.type,
      metadata: row.item.metadata,
      quantity: row.quantity,
      equipped: row.equipped,
      acquiredAt: row.acquiredAt.toISOString(),
    })),

    billing: buildBillingPayload(user),
    abuse: buildAbusePayload(user),

    trust: {
      safeModeEnabled: user.safeModeEnabled,
      educationalModeEnabled: user.educationalModeEnabled,
      verifiedCreator: user.verifiedCreator,
      verifiedCreatorLabel: user.verifiedCreatorLabel ?? null,
      verifiedCreatorAt: user.verifiedCreatorAt?.toISOString() ?? null,
      linkedToParent: !!user.familyAsChild,
      familyCodeActive:
        !!user.familyLinkCodeHash &&
        !!user.familyLinkCodeExpiresAt &&
        user.familyLinkCodeExpiresAt > new Date(),
    },
  };
}
