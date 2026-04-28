import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { AppError } from '../../errors/AppError.js';
import { getStripe } from '../../services/stripeClient.js';
import { fulfillPaymentPurchase, syncPremiumFromSubscription } from '../../services/fulfillStripePurchase.js';
import { logger } from '../../lib/logger.js';

export const billingRouter = Router();

const purchaseKindSchema = z.enum([
  'premium_monthly',
  'cosmetic_themes',
  'cooldown_boost',
  'private_canvas_slot',
]);

function priceForKind(kind: z.infer<typeof purchaseKindSchema>): string | undefined {
  switch (kind) {
    case 'premium_monthly':
      return env.STRIPE_PRICE_PREMIUM_MONTHLY;
    case 'cosmetic_themes':
      return env.STRIPE_PRICE_COSMETIC_THEMES;
    case 'cooldown_boost':
      return env.STRIPE_PRICE_COOLDOWN_BOOST;
    case 'private_canvas_slot':
      return env.STRIPE_PRICE_PRIVATE_CANVAS_SLOT;
    default:
      return undefined;
  }
}

billingRouter.get('/billing/catalog', (_req, res, next) => {
  try {
    const configured = {
      premiumMonthly: !!env.STRIPE_PRICE_PREMIUM_MONTHLY,
      cosmeticThemes: !!env.STRIPE_PRICE_COSMETIC_THEMES,
      cooldownBoost: !!env.STRIPE_PRICE_COOLDOWN_BOOST,
      privateCanvasSlot: !!env.STRIPE_PRICE_PRIVATE_CANVAS_SLOT,
      billingReady: !!(env.STRIPE_SECRET_KEY && env.BILLING_FRONTEND_BASE_URL),
    };
    res.json({
      success: true,
      data: {
        configured,
        offers: [
          {
            id: 'premium_monthly',
            title: 'Premium',
            description: 'Cosmetic themes and included private canvas slots. No faster pixels.',
            kind: 'subscription',
          },
          {
            id: 'cosmetic_themes',
            title: 'Cosmetic theme pack',
            description: 'Unlock extra UI themes (cosmetic only).',
            kind: 'payment',
          },
          {
            id: 'cooldown_boost',
            title: 'Cooldown boost',
            description: 'Small placement cooldown reduction (hard-capped for fairness).',
            kind: 'payment',
          },
          {
            id: 'private_canvas_slot',
            title: 'Private canvas slot',
            description: 'Extra private canvas slot.',
            kind: 'payment',
          },
        ],
      },
    });
  } catch (e) {
    next(e);
  }
});

const checkoutSchema = z.object({
  purchaseKind: purchaseKindSchema,
});

billingRouter.post(
  '/billing/checkout-session',
  requireAuth,
  validateRequest({ body: checkoutSchema }),
  async (req, res, next) => {
    try {
      const stripe = getStripe();
      if (!stripe || !env.BILLING_FRONTEND_BASE_URL) {
        throw new AppError('Billing is not configured', 503, 'BILLING_UNAVAILABLE');
      }

      const { purchaseKind } = checkoutSchema.parse(req.body);
      const priceId = priceForKind(purchaseKind);
      if (!priceId) {
        throw new AppError('This offer is not available', 400, 'PRICE_NOT_CONFIGURED');
      }

      const userId = req.auth!.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

      const base = env.BILLING_FRONTEND_BASE_URL.replace(/\/$/, '');
      const success_url = `${base}/premium?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancel_url = `${base}/premium?checkout=canceled`;

      const meta = { prismaUserId: user.id, purchaseKind };

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: purchaseKind === 'premium_monthly' ? 'subscription' : 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url,
        cancel_url,
        metadata: meta,
      };

      if (purchaseKind === 'premium_monthly') {
        sessionParams.subscription_data = {
          metadata: { prismaUserId: user.id },
        };
      }

      if (user.stripeCustomerId) {
        sessionParams.customer = user.stripeCustomerId;
      } else if (user.email) {
        sessionParams.customer_email = user.email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.json({
        success: true,
        data: { url: session.url },
      });
    } catch (e) {
      next(e);
    }
  }
);

billingRouter.post('/billing/customer-portal', requireAuth, async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!stripe || !env.BILLING_FRONTEND_BASE_URL) {
      throw new AppError('Billing is not configured', 503, 'BILLING_UNAVAILABLE');
    }

    const userId = req.auth!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
      throw new AppError('No billing account yet. Subscribe or make a purchase first.', 400, 'NO_CUSTOMER');
    }

    const base = env.BILLING_FRONTEND_BASE_URL.replace(/\/$/, '');
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${base}/premium`,
    });

    res.json({ success: true, data: { url: portal.url } });
  } catch (e) {
    next(e);
  }
});

async function findUserForSubscription(sub: Stripe.Subscription): Promise<{ id: string } | null> {
  const metaUid = sub.metadata?.prismaUserId;
  if (metaUid) {
    const u = await prisma.user.findUnique({ where: { id: metaUid } });
    if (u) return u;
  }
  if (sub.id) {
    const bySub = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } });
    if (bySub) return bySub;
  }
  const cust = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  if (cust) {
    const byCust = await prisma.user.findFirst({ where: { stripeCustomerId: cust } });
    if (byCust) return byCust;
  }
  return null;
}

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];

  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    res.status(503).send('Billing unavailable');
    return;
  }

  let event: Stripe.Event;
  try {
    const buf = req.body as Buffer;
    if (!Buffer.isBuffer(buf) || !sig || typeof sig !== 'string') {
      res.status(400).send('Webhook signature verification failed');
      return;
    }
    event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err }, 'stripe_webhook_verify_failed');
    res.status(400).send(`Webhook Error`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.prismaUserId;
        const purchaseKind = session.metadata?.purchaseKind;
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;

        if (userId && customerId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        }

        if (session.mode === 'subscription' && userId) {
          const subId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
          if (subId) {
            const sub = await stripe.subscriptions.retrieve(subId);
            await syncPremiumFromSubscription({
              userId,
              stripeCustomerId: customerId ?? sub.customer as string,
              stripeSubscriptionId: sub.id,
              status: sub.status,
              currentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
            });
          }
        } else if (session.mode === 'payment' && userId && purchaseKind) {
          await fulfillPaymentPurchase(userId, purchaseKind, session.id);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const row = await findUserForSubscription(sub);
        if (row) {
          const cust = typeof sub.customer === 'string' ? sub.customer : String(sub.customer);
          await syncPremiumFromSubscription({
            userId: row.id,
            stripeCustomerId: cust,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const row = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } });
        if (row) {
          await prisma.user.update({
            where: { id: row.id },
            data: {
              plan: 'free',
              stripeSubscriptionId: null,
              subscriptionStatus: 'canceled',
              subscriptionPeriodEnd: null,
            },
          });
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err, type: event.type }, 'stripe_webhook_handler_error');
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
