/**
 * In-app payments via Stripe Payment Element (card, bank where enabled).
 * Card/bank details go to Stripe only; we receive PaymentIntent webhooks to credit coins.
 */
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { requireAuth, isAdmin } from './authMiddleware';

const HOLIDAY_MONTHS = [2, 3, 7, 10, 12];

function pixelPayCentsStandard(coins: number): number | null {
  if (!Number.isInteger(coins) || coins < 100 || coins > 10000) return null;
  const packs = [
    { coins: 100, cents: 99 },
    { coins: 400, cents: 349 },
    { coins: 1000, cents: 799 },
    { coins: 2500, cents: 1499 },
    { coins: 10000, cents: 4999 },
  ];
  const exact = packs.find((p) => p.coins === coins);
  if (exact) return exact.cents;
  for (let i = 0; i < packs.length - 1; i++) {
    const a = packs[i];
    const b = packs[i + 1];
    if (coins > a.coins && coins < b.coins) {
      const t = (coins - a.coins) / (b.coins - a.coins);
      return Math.round(a.cents + t * (b.cents - a.cents));
    }
  }
  return null;
}

function isHolidayMonth(): boolean {
  return HOLIDAY_MONTHS.includes(new Date().getMonth() + 1);
}

export function resolvePixelPayPricing(
  coins: number,
  auth: { username: string; role: string }
): { cents: number } | { error: string; status: number } {
  if (!Number.isInteger(coins) || coins < 100) {
    return { error: 'Invalid coin amount', status: 400 };
  }
  if (coins === 8500) {
    if (!isHolidayMonth()) {
      return { error: 'Holiday bundle pricing is only available during holiday months', status: 400 };
    }
    return { cents: 3000 };
  }
  if (coins === 1000000) {
    if (!isAdmin(auth)) {
      return { error: 'Forbidden', status: 403 };
    }
    return { cents: 500 };
  }
  const std = pixelPayCentsStandard(coins);
  if (std == null) {
    return { error: 'Invalid coin amount (allowed: 100–10,000, or holiday 8,500)', status: 400 };
  }
  return { cents: std };
}

function getStripe(): Stripe | null {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  return key ? new Stripe(key, { apiVersion: '2023-10-16' }) : null;
}

/** Publishable key is safe to expose; served only from our API (no NEXT_PUBLIC build var required). */
function getStripePublishableKey(): string {
  return (process.env.STRIPE_PUBLISHABLE_KEY || '').trim();
}

async function creditCoinsForPaymentIntent(
  db: admin.firestore.Firestore,
  usersCollection: string,
  processedCollection: string,
  pi: Stripe.PaymentIntent
): Promise<void> {
  const userId = pi.metadata?.userId;
  const coins = parseInt(pi.metadata?.coins || '0', 10);
  if (!userId || !coins || !Number.isFinite(coins)) {
    console.error('[stripe] PI missing metadata', pi.id);
    return;
  }

  const processedRef = db.collection(processedCollection).doc(pi.id);
  const userRef = db.collection(usersCollection).doc(String(userId).toLowerCase());

  await db.runTransaction(async (tx) => {
    const done = await tx.get(processedRef);
    if (done.exists) return;

    const us = await tx.get(userRef);
    if (!us.exists) {
      console.error('[stripe] User not found for PI', userId);
      return;
    }
    const cur = typeof us.data()?.coins === 'number' ? us.data()!.coins : 0;
    tx.update(userRef, { coins: cur + coins, updated_at: Date.now() });
    tx.set(processedRef, {
      paymentIntentId: pi.id,
      userId,
      coins,
      creditedAt: Date.now(),
    });
  });
  console.log(`[stripe] Credited ${coins} coins to ${userId} (PI ${pi.id})`);
}

/** Raw body webhook — register before express.json(). */
export function mountStripeEmbeddedWebhook(
  app: express.Application,
  db: admin.firestore.Firestore,
  usersCollection: string,
  processedCollection: string
): void {
  const stripe = getStripe();
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const placeholder = 'whsec_your_webhook_secret_here';
  const webhookConfigured = !!webhookSecret && webhookSecret !== placeholder;
  const isProd = process.env.NODE_ENV === 'production';

  app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const buf = req.body as Buffer;
    const sig = req.headers['stripe-signature'];

    if (!stripe || !webhookConfigured) {
      if (isProd) {
        console.error('[stripe] Webhook rejected: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
        return res.status(500).json({ error: 'Stripe webhook not configured' });
      }
      console.warn('[stripe] Webhook dev mode: skipping verify');
      try {
        const event = JSON.parse(buf.toString('utf8')) as Stripe.Event;
        if (event.type === 'payment_intent.succeeded') {
          await creditCoinsForPaymentIntent(db, usersCollection, processedCollection, event.data.object as Stripe.PaymentIntent);
        }
        return res.json({ received: true });
      } catch (e) {
        console.error('[stripe] dev webhook', e);
        return res.json({ received: true });
      }
    }

    if (!sig || typeof sig !== 'string') {
      return res.status(400).json({ error: 'No signature' });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(400).json({ error: msg });
    }

    if (event.type === 'payment_intent.succeeded') {
      try {
        await creditCoinsForPaymentIntent(db, usersCollection, processedCollection, event.data.object as Stripe.PaymentIntent);
      } catch (e) {
        console.error('[stripe] webhook credit error', e);
        return res.status(500).json({ error: 'Failed to credit coins' });
      }
    }

    return res.json({ received: true });
  });
}

export function mountStripeEmbeddedPayRoutes(app: express.Application, _db: admin.firestore.Firestore): void {
  app.get('/pixel-pay/stripe-publishable-key', (_req: Request, res: Response) => {
    const pk = getStripePublishableKey();
    if (!pk || !pk.startsWith('pk_')) {
      return res.status(503).json({
        error: 'Pixel Place Pay is not configured. Set STRIPE_PUBLISHABLE_KEY in the server environment.',
      });
    }
    return res.json({ publishableKey: pk });
  });

  app.post('/pixel-pay/create-payment-intent', async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in functions/.env.' });
      }

      const coins = parseInt(String((req.body || {}).coins ?? ''), 10);
      const pricing = resolvePixelPayPricing(coins, auth);
      if ('error' in pricing) {
        return res.status(pricing.status).json({ error: pricing.error });
      }

      const pi = await stripe.paymentIntents.create({
        amount: pricing.cents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: auth.username,
          coins: String(coins),
        },
        description: `Pixel Place — ${coins.toLocaleString('en-US')} Pixel Coins for ${auth.username}`,
      });

      if (!pi.client_secret) {
        return res.status(500).json({ error: 'No client secret' });
      }

      return res.json({
        clientSecret: pi.client_secret,
        amountCents: pricing.cents,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create payment';
      console.error('[stripe] create-payment-intent', e);
      return res.status(500).json({ error: msg });
    }
  });
}
