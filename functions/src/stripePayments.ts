/**
 * Stripe Checkout + webhook for Firebase static hosting (Next API routes are not deployed).
 * Pixel Place Pay: POST /pixel-pay/checkout with { coins } — first-party pay portal URLs.
 */
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { requireAuth, isAdmin } from './authMiddleware';

const COIN_PACKS: Record<string, { coins: number; amount: number; bundle?: boolean }> = {
  price_100: { coins: 100, amount: 99 },
  price_400: { coins: 400, amount: 349 },
  price_1000: { coins: 1000, amount: 799 },
  price_2500: { coins: 2500, amount: 1499 },
  price_10000: { coins: 10000, amount: 4999 },
  price_admin_1000000: { coins: 1000000, amount: 500 },
  holiday_bundle: { coins: 8500, amount: 3000, bundle: true },
};

function pixelPayCentsForCoins(coins: number): number | null {
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

function appPublicUrl(): string {
  const u = process.env.APP_PUBLIC_URL || process.env.NEXT_PUBLIC_BASE_URL || '';
  const s = (u || '').replace(/\/$/, '');
  return s || 'https://pixelplaceofficial.com';
}

function payPortalPublicUrl(): string {
  const u = process.env.PAY_PORTAL_PUBLIC_URL || '';
  const s = (u || '').replace(/\/$/, '');
  return s || 'https://pay.pixelplaceofficial.com';
}

function getStripe(): Stripe | null {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  return key ? new Stripe(key, { apiVersion: '2023-10-16' }) : null;
}

async function creditCoinsFromSession(db: admin.firestore.Firestore, usersCollection: string, session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const coins = parseInt(session.metadata?.coins || '0', 10);
  if (!userId || !coins || !Number.isFinite(coins)) {
    console.error('[stripe] Missing metadata in session', session.id);
    return;
  }
  const ref = db.collection(usersCollection).doc(String(userId).toLowerCase());
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      console.error(`[stripe] User not found: ${userId}`);
      return;
    }
    const cur = typeof snap.data()?.coins === 'number' ? snap.data()!.coins : 0;
    tx.update(ref, { coins: cur + coins, updated_at: Date.now() });
  });
  console.log(`[stripe] Added ${coins} coins to ${userId}`);
}

/** Register POST /webhook with raw body — call before express.json(). */
export function mountStripeWebhook(app: express.Application, db: admin.firestore.Firestore, usersCollection: string): void {
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
        console.error('[stripe] Webhook rejected: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Stripe webhook is not configured on the server' });
      }
      console.warn('[stripe] Webhook: dev fallback without signature verification');
      try {
        const event = JSON.parse(buf.toString('utf8'));
        if (event.type === 'checkout.session.completed') {
          await creditCoinsFromSession(db, usersCollection, event.data.object as Stripe.Checkout.Session);
        }
        return res.json({ received: true });
      } catch (e) {
        console.error('[stripe] Dev webhook parse error', e);
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
      console.error('[stripe] Webhook signature failed:', msg);
      return res.status(400).json({ error: `Webhook Error: ${msg}` });
    }

    if (event.type === 'checkout.session.completed') {
      try {
        await creditCoinsFromSession(db, usersCollection, event.data.object as Stripe.Checkout.Session);
      } catch (e) {
        console.error('[stripe] Webhook handler error', e);
      }
    }

    return res.json({ received: true });
  });
}

/** JSON routes — register after express.json(). */
export function mountStripePaymentRoutes(app: express.Application, _db: admin.firestore.Firestore): void {
  const stripe = getStripe();

  app.post('/checkout', async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' });
      }

      const { priceId, bundle } = req.body || {};
      if (!priceId || typeof priceId !== 'string') {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const pack = COIN_PACKS[priceId];
      if (!pack) {
        return res.status(400).json({ error: 'Invalid price ID' });
      }

      if (priceId === 'price_admin_1000000' && !isAdmin(auth)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (bundle && priceId === 'holiday_bundle') {
        const month = new Date().getMonth() + 1;
        const holidayMonths = [2, 3, 7, 10, 12];
        if (!holidayMonths.includes(month)) {
          return res.status(400).json({ error: 'Holiday bundle is only available during holiday months' });
        }
      }

      const base = appPublicUrl();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: pack.bundle
                  ? `Holiday Bundle - ${pack.coins} Coins + Wheel Spin`
                  : `${pack.coins} Pixel Coins`,
                description: pack.bundle
                  ? `Holiday Bundle: ${pack.coins} Pixel Coins + 1 spin on the wheel for exclusive holiday rewards!`
                  : `Purchase ${pack.coins} Pixel Coins for your account`,
              },
              unit_amount: pack.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${base}/?success=true&session_id={CHECKOUT_SESSION_ID}#coins`,
        cancel_url: `${base}/?canceled=true#coins`,
        metadata: {
          userId: auth.username,
          coins: pack.coins.toString(),
          priceId,
          bundle: pack.bundle ? 'true' : 'false',
        },
      });

      return res.json({ sessionId: session.id, url: session.url });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create checkout session';
      console.error('[stripe] checkout error', error);
      return res.status(500).json({ error: msg });
    }
  });

  app.post('/pixel-pay/checkout', async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' });
      }

      const coins = parseInt(String((req.body || {}).coins ?? ''), 10);
      const cents = pixelPayCentsForCoins(coins);
      if (cents == null) {
        return res.status(400).json({ error: 'Invalid coin amount (allowed: 100–10,000)' });
      }

      const base = appPublicUrl();
      const payBase = payPortalPublicUrl();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Pixel Place Pay — ${coins.toLocaleString('en-US')} Pixel Coins`,
                description: `Pixel Place Pay: ${coins.toLocaleString('en-US')} Pixel Coins for ${auth.username}`,
              },
              unit_amount: cents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${base}/?success=true&session_id={CHECKOUT_SESSION_ID}#coins`,
        cancel_url: `${payBase}/${coins}Pixelcoins`,
        metadata: {
          userId: auth.username,
          coins: coins.toString(),
          priceId: 'pixel_place_pay',
          bundle: 'false',
          pixel_place_pay: 'true',
        },
      });

      return res.json({ sessionId: session.id, url: session.url });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create checkout session';
      console.error('[stripe] pixel-pay checkout error', error);
      return res.status(500).json({ error: msg });
    }
  });
}
