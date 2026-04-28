import type { User } from '@prisma/client';
import {
  effectivePixelCooldownMs,
  effectivePrivateCanvasSlots,
  effectiveUiThemes,
  isPremiumPlanActive,
  parseStoredEntitlements,
} from './entitlements.js';
import { COSMETIC_PACK_THEMES, PREMIUM_SUBSCRIPTION_THEMES } from './constants.js';

export function buildBillingPayload(user: User) {
  const premium = isPremiumPlanActive(user);
  const ent = parseStoredEntitlements(user.billingEntitlements);

  return {
    plan: user.plan as 'free' | 'premium',
    /** User has a Stripe customer id (portal / payment method management). */
    customerPortalAvailable: !!user.stripeCustomerId,
    premiumActive: premium,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPeriodEnd: user.subscriptionPeriodEnd?.toISOString() ?? null,
    /** Purchased / subscription themes available in UI (cosmetic only). */
    uiThemes: effectiveUiThemes(user),
    /** Premium-only theme ids (lost when subscription ends); listed separately for UX copy. */
    premiumThemeIds: [...PREMIUM_SUBSCRIPTION_THEMES],
    cosmeticPackThemeIds: [...COSMETIC_PACK_THEMES],
    cooldownBoostPurchased: !!ent.cooldownBoostPurchased,
    /** Server-enforced cooldown for pixel placement tools — single source of truth. */
    pixelCooldownMs: effectivePixelCooldownMs(user),
    privateCanvasSlots: effectivePrivateCanvasSlots(user),
    fairnessNote:
      'Premium improves cosmetics and convenience (private canvases). Cooldown boosts are capped so paid players cannot dominate purely by spending.',
  };
}
