import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { grantCosmeticPackThemes, mergeEntitlementsJson } from '../lib/billing/entitlements.js';

function withCheckoutStamp(json: Record<string, unknown>, checkoutSessionId?: string): Prisma.InputJsonValue {
  const out = { ...json };
  if (checkoutSessionId) out.lastStripeCheckoutSessionId = checkoutSessionId;
  return out as Prisma.InputJsonValue;
}

/** One-time purchases — idempotent per Checkout Session when `checkoutSessionId` is set (webhook retries). */
export async function fulfillPaymentPurchase(
  userId: string,
  kind: string,
  checkoutSessionId?: string
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const cur = user.billingEntitlements;
  const curObj = typeof cur === 'object' && cur !== null ? (cur as Record<string, unknown>) : {};
  if (checkoutSessionId && curObj.lastStripeCheckoutSessionId === checkoutSessionId) {
    return;
  }

  switch (kind) {
    case 'cosmetic_themes': {
      await prisma.user.update({
        where: { id: userId },
        data: {
          billingEntitlements: withCheckoutStamp(
            grantCosmeticPackThemes(cur) as Record<string, unknown>,
            checkoutSessionId
          ),
        },
      });
      break;
    }
    case 'cooldown_boost': {
      await prisma.user.update({
        where: { id: userId },
        data: {
          billingEntitlements: withCheckoutStamp(
            mergeEntitlementsJson(cur, {
              cooldownBoostPurchased: true,
            }) as Record<string, unknown>,
            checkoutSessionId
          ),
        },
      });
      break;
    }
    case 'private_canvas_slot': {
      await prisma.user.update({
        where: { id: userId },
        data: {
          billingEntitlements: withCheckoutStamp(
            mergeEntitlementsJson(cur, {
              privateSlotsPurchased: 1,
            }) as Record<string, unknown>,
            checkoutSessionId
          ),
        },
      });
      break;
    }
    default:
      break;
  }
}

export async function syncPremiumFromSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodEnd: Date | null;
}): Promise<void> {
  const active = params.status === 'active' || params.status === 'trialing';
  await prisma.user.update({
    where: { id: params.userId },
    data: {
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      subscriptionStatus: params.status,
      subscriptionPeriodEnd: params.currentPeriodEnd,
      plan: active ? 'premium' : 'free',
    },
  });
}
