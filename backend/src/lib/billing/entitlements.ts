import type { User } from '@prisma/client';
import {
  BASE_PIXEL_COOLDOWN_MS,
  COOLDOWN_BOOST_MULTIPLIER,
  COSMETIC_PACK_THEMES,
  MIN_PIXEL_COOLDOWN_MS,
  PREMIUM_INCLUDED_PRIVATE_SLOTS,
  PREMIUM_SUBSCRIPTION_THEMES,
} from './constants.js';

export type StoredEntitlements = {
  permanentThemes?: string[];
  cooldownBoostPurchased?: boolean;
  /** Purchased one-time slots (not including Premium stipend). */
  privateSlotsPurchased?: number;
};

export function parseStoredEntitlements(raw: unknown): StoredEntitlements {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  return {
    permanentThemes: Array.isArray(o.permanentThemes)
      ? (o.permanentThemes as string[]).filter((x) => typeof x === 'string')
      : undefined,
    cooldownBoostPurchased: typeof o.cooldownBoostPurchased === 'boolean' ? o.cooldownBoostPurchased : undefined,
    privateSlotsPurchased:
      typeof o.privateSlotsPurchased === 'number' && o.privateSlotsPurchased >= 0
        ? Math.floor(o.privateSlotsPurchased)
        : undefined,
  };
}

export function isPremiumPlanActive(user: Pick<User, 'plan' | 'subscriptionStatus' | 'subscriptionPeriodEnd'>): boolean {
  if (user.plan !== 'premium') return false;
  const ok = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
  if (!ok) return false;
  if (user.subscriptionPeriodEnd && user.subscriptionPeriodEnd < new Date()) return false;
  return true;
}

export function effectiveUiThemes(user: User): string[] {
  const ent = parseStoredEntitlements(user.billingEntitlements);
  const perm = new Set(ent.permanentThemes ?? []);
  if (isPremiumPlanActive(user)) {
    for (const t of PREMIUM_SUBSCRIPTION_THEMES) perm.add(t);
  }
  return [...perm];
}

export function effectivePrivateCanvasSlots(user: User): number {
  const ent = parseStoredEntitlements(user.billingEntitlements);
  const purchased = ent.privateSlotsPurchased ?? 0;
  const bonus = isPremiumPlanActive(user) ? PREMIUM_INCLUDED_PRIVATE_SLOTS : 0;
  return bonus + purchased;
}

/**
 * Premium subscription intentionally does NOT reduce cooldown.
 * Optional one-time boost applies at most ~10% reduction with a global floor.
 */
export function effectivePixelCooldownMs(user: User): number {
  const ent = parseStoredEntitlements(user.billingEntitlements);
  let ms = BASE_PIXEL_COOLDOWN_MS;
  if (ent.cooldownBoostPurchased) {
    ms = Math.round(ms * COOLDOWN_BOOST_MULTIPLIER);
  }
  return Math.max(MIN_PIXEL_COOLDOWN_MS, ms);
}

export function mergeEntitlementsJson(
  current: unknown,
  patch: Partial<StoredEntitlements>
): Record<string, unknown> {
  const cur = parseStoredEntitlements(current);
  const themes = [...new Set([...(cur.permanentThemes ?? []), ...(patch.permanentThemes ?? [])])];
  const slots = (cur.privateSlotsPurchased ?? 0) + (patch.privateSlotsPurchased ?? 0);
  const out: Record<string, unknown> = {};
  if (themes.length) out.permanentThemes = themes;
  if (patch.cooldownBoostPurchased || cur.cooldownBoostPurchased) {
    out.cooldownBoostPurchased = true;
  }
  if (slots > 0) out.privateSlotsPurchased = slots;
  return out;
}

export function grantCosmeticPackThemes(current: unknown): Record<string, unknown> {
  const cur = parseStoredEntitlements(current);
  const themes = [...new Set([...(cur.permanentThemes ?? []), ...COSMETIC_PACK_THEMES])];
  return mergeEntitlementsJson(current, { permanentThemes: themes });
}
