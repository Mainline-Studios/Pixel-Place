export type BillingPurchaseKind =
  | 'premium_monthly'
  | 'cosmetic_themes'
  | 'cooldown_boost'
  | 'private_canvas_slot';

/** Billing / monetization — from `serializeUser` → `buildBillingPayload`. */
/** Abuse / bot-prevention summary for UI (from `/users/me`). */
export type BackendAbusePayload = {
  placementLocked: boolean;
  lockedUntil: string | null;
  cooldownMultiplier: number;
  captchaRequired: boolean;
  trustTier: 'normal' | 'elevated' | 'high';
};

export type BackendBillingPayload = {
  plan: 'free' | 'premium';
  customerPortalAvailable: boolean;
  premiumActive: boolean;
  subscriptionStatus: string | null;
  subscriptionPeriodEnd: string | null;
  uiThemes: string[];
  premiumThemeIds: string[];
  cosmeticPackThemeIds: string[];
  cooldownBoostPurchased: boolean;
  pixelCooldownMs: number;
  privateCanvasSlots: number;
  fairnessNote: string;
};

/** REST `data.user` from Express `/api/v1/users/me` (PostgreSQL + Prisma). */
export type BackendUserPayload = {
  id: string;
  username: string;
  gender: string;
  role: string;
  coins: number;
  safetyPoints: number;
  ownedSkins: unknown;
  equippedSkin: string;
  ownedFaces: unknown;
  equippedFace: string | null;
  ownedAccessories: unknown;
  equippedAccessories: unknown;
  friends: unknown;
  email: string | null;
  profile: { displayName: string | null; bio: string | null; avatarUrl: string | null };
  progression: {
    xp: number;
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    pixelsPlaced: number;
    lastPlacedAt: string | null;
  };
  engagement: {
    currentStreak: number;
    longestStreak: number;
    lastDailyClaimDate: string | null;
    lastActiveDate: string | null;
  };
  achievements: {
    list: Array<{
      id: string;
      name: string;
      description: string;
      iconKey: string;
      xpReward: number;
      requirement: unknown;
      unlocked: boolean;
      unlockedAt: string | null;
    }>;
  };
  inventory: Array<{
    itemId: string;
    name: string;
    description: string | null;
    type: string;
    metadata: unknown;
    quantity: number;
    equipped: boolean;
    acquiredAt: string;
  }>;

  billing?: BackendBillingPayload;
  abuse?: BackendAbusePayload;
  /** Trust, Safe Mode, family linking, verified creator (PostgreSQL). */
  trust?: {
    safeModeEnabled: boolean;
    educationalModeEnabled: boolean;
    verifiedCreator: boolean;
    verifiedCreatorLabel: string | null;
    verifiedCreatorAt: string | null;
    linkedToParent: boolean;
    familyCodeActive: boolean;
  };
};
