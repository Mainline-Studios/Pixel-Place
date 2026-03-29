/**
 * Pixel Place Pay — first-party payment orders (no card processor).
 * Users get a reference code + instructions; admins fulfill via POST /pixel-pay/fulfill-order.
 */
import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { requireAuth, requireAdmin, isAdmin } from './authMiddleware';

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

function resolveOrderPricing(coins: number, auth: { username: string; role: string }): { cents: number } | { error: string; status: number } {
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

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRef(): string {
  let s = 'PP-';
  for (let i = 0; i < 8; i++) s += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return s;
}

function defaultInstructions(ref: string, amountUsd: string, username: string): string {
  return [
    `Send exactly ${amountUsd} using the payment method Mainline Studios has set up for Pixel Place (Zelle, bank transfer, etc.).`,
    ``,
    `Reference / memo (required): ${ref}`,
    `Account: ${username}`,
    ``,
    `After we confirm your payment, ${amountUsd} worth of Pixel Coins will be credited to your account — usually within one business day.`,
  ].join('\n');
}

function buildInstructions(ref: string, amountUsd: string, username: string): string {
  const template = (process.env.PIXEL_PAY_INSTRUCTIONS || '').trim();
  if (!template) return defaultInstructions(ref, amountUsd, username);
  return template
    .replace(/\{ref\}/g, ref)
    .replace(/\{amountUsd\}/g, amountUsd)
    .replace(/\{username\}/g, username);
}

export function mountPixelPayRoutes(app: express.Application, db: admin.firestore.Firestore, usersCollection: string, ordersCollection: string): void {
  app.post('/pixel-pay/create-order', async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const coins = parseInt(String((req.body || {}).coins ?? ''), 10);
      const pricing = resolveOrderPricing(coins, auth);
      if ('error' in pricing) {
        return res.status(pricing.status).json({ error: pricing.error });
      }

      let ref = generateRef();
      const col = db.collection(ordersCollection);
      for (let attempt = 0; attempt < 8; attempt++) {
        const snap = await col.doc(ref).get();
        if (!snap.exists) break;
        ref = generateRef();
      }

      const amountUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pricing.cents / 100);
      const instructions = buildInstructions(ref, amountUsd, auth.username);

      await col.doc(ref).set({
        ref,
        userId: auth.username,
        userId_lower: auth.username.toLowerCase(),
        coins,
        amountCents: pricing.cents,
        amountUsd,
        status: 'pending',
        instructions,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ ref, coins, amountCents: pricing.cents, amountUsd, instructions });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create order';
      console.error('[pixel-pay] create-order', e);
      return res.status(500).json({ error: msg });
    }
  });

  app.post('/pixel-pay/fulfill-order', async (req: Request, res: Response) => {
    try {
      const auth = requireAdmin(req, res);
      if (!auth) return;

      const ref = String((req.body || {}).ref ?? '')
        .trim()
        .toUpperCase();
      if (!ref || !/^PP-[A-Z2-9]{8}$/.test(ref)) {
        return res.status(400).json({ error: 'Invalid reference' });
      }

      const orderRef = db.collection(ordersCollection).doc(ref);
      const userCol = db.collection(usersCollection);

      await db.runTransaction(async (tx) => {
        const o = await tx.get(orderRef);
        if (!o.exists) throw new Error('Order not found');
        const d = o.data()!;
        if (d.status !== 'pending') throw new Error('Order is not pending');
        const userId = String(d.userId || '');
        const coins = typeof d.coins === 'number' ? d.coins : parseInt(String(d.coins), 10);
        if (!userId || !coins) throw new Error('Invalid order data');

        const uref = userCol.doc(userId.toLowerCase());
        const us = await tx.get(uref);
        if (!us.exists) throw new Error('User not found');
        const cur = typeof us.data()?.coins === 'number' ? us.data()!.coins : 0;
        tx.update(uref, { coins: cur + coins, updated_at: Date.now() });
        tx.update(orderRef, {
          status: 'fulfilled',
          fulfilledAt: admin.firestore.FieldValue.serverTimestamp(),
          fulfilledBy: auth.username,
        });
      });

      return res.json({ success: true, ref });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Fulfill failed';
      console.error('[pixel-pay] fulfill-order', e);
      return res.status(400).json({ error: msg });
    }
  });

  app.get('/pixel-pay/order-status', async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const ref = String(req.query.ref || '')
        .trim()
        .toUpperCase();
      if (!ref) return res.status(400).json({ error: 'ref required' });
      const snap = await db.collection(ordersCollection).doc(ref).get();
      if (!snap.exists) return res.status(404).json({ error: 'Not found' });
      const d = snap.data()!;
      if (String(d.userId).toLowerCase() !== auth.username.toLowerCase() && !isAdmin(auth)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return res.json({
        ref: d.ref,
        status: d.status,
        coins: d.coins,
        amountUsd: d.amountUsd,
        createdAt: d.createdAt,
      });
    } catch (e: unknown) {
      console.error('[pixel-pay] order-status', e);
      return res.status(500).json({ error: 'Failed' });
    }
  });
}
