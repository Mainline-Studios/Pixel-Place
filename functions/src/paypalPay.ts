/**
 * In-app payments via PayPal (Orders v2 API).
 *
 * Two server endpoints (the "createOrder" and "capturePayment" HTTPS functions),
 * mounted on the shared Express `api` function:
 *   POST /pixel-pay/paypal/create-order  -> initializes a PayPal order, returns { orderID }
 *   POST /pixel-pay/paypal/capture       -> captures + verifies the order server-side,
 *                                           credits Pixel Coins and sets user.paid = true
 *   GET  /pixel-pay/paypal/client-id     -> public client id + env for the browser SDK
 *
 * Security:
 *   - PAYPAL_CLIENT_SECRET is provided via Firebase Functions Secrets (never hardcoded).
 *   - The buyer identity comes from the JWT (requireAuth), never the request body.
 *   - Pricing is computed server-side; the capture amount returned by PayPal is
 *     re-checked against the price we expected for the stored order.
 *   - Captures are idempotent (processed-credits doc keyed by capture id).
 */
import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { requireAuth, AuthUser } from './authMiddleware';
import { resolvePixelPayPricing } from './stripeEmbeddedPay';

function getPaypalApiBase(): string {
  const env = (process.env.PAYPAL_ENV || 'sandbox').trim().toLowerCase();
  return env === 'live' || env === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function getPaypalClientId(): string {
  return (process.env.PAYPAL_CLIENT_ID || '').trim();
}

function getPaypalClientSecret(): string {
  return (process.env.PAYPAL_CLIENT_SECRET || '').trim();
}

function isPaypalConfigured(): boolean {
  return !!getPaypalClientId() && !!getPaypalClientSecret();
}

/** OAuth2 client-credentials access token for the PayPal REST API. */
async function getPaypalAccessToken(): Promise<string | null> {
  const clientId = getPaypalClientId();
  const secret = getPaypalClientSecret();
  if (!clientId || !secret) return null;

  const basic = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const res = await fetch(`${getPaypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[paypal] token error', res.status, text);
    return null;
  }
  const data = (await res.json()) as { access_token?: string };
  return data.access_token || null;
}

function dollarsFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function mountPaypalPayRoutes(
  app: express.Application,
  db: admin.firestore.Firestore,
  usersCollection: string,
  ordersCollection: string,
  processedCollection: string,
): void {
  // Public client id for the browser SDK (no build-time NEXT_PUBLIC var needed).
  app.get('/pixel-pay/paypal/client-id', (_req: Request, res: Response) => {
    const clientId = getPaypalClientId();
    if (!clientId) {
      return res.status(503).json({
        error: 'PayPal is not configured. Set PAYPAL_CLIENT_ID in the server environment.',
      });
    }
    const env = (process.env.PAYPAL_ENV || 'sandbox').trim().toLowerCase();
    return res.json({ clientId, env: env === 'live' || env === 'production' ? 'live' : 'sandbox' });
  });

  // createOrder — initialize a PayPal transaction, return the orderID to the frontend.
  app.post('/pixel-pay/paypal/create-order', async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      if (!isPaypalConfigured()) {
        return res.status(500).json({
          error: 'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
        });
      }

      const coins = parseInt(String((req.body || {}).coins ?? ''), 10);
      const pricing = resolvePixelPayPricing(coins, auth);
      if ('error' in pricing) {
        return res.status(pricing.status).json({ error: pricing.error });
      }

      const accessToken = await getPaypalAccessToken();
      if (!accessToken) {
        return res.status(502).json({ error: 'Could not authenticate with PayPal.' });
      }

      const amount = dollarsFromCents(pricing.cents);
      const orderRes = await fetch(`${getPaypalApiBase()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              custom_id: auth.username,
              description: `Pixel Place — ${coins.toLocaleString('en-US')} Pixel Coins`,
              amount: { currency_code: 'USD', value: amount },
            },
          ],
        }),
      });

      const order = (await orderRes.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!orderRes.ok || !order.id) {
        console.error('[paypal] create order failed', orderRes.status, order);
        return res.status(502).json({ error: order.message || 'Could not create PayPal order.' });
      }

      // Remember what this order is worth so capture can't be tampered with via the client.
      await db.collection(ordersCollection).doc(order.id).set({
        orderId: order.id,
        userId: auth.username.toLowerCase(),
        username: auth.username,
        coins,
        cents: pricing.cents,
        status: 'created',
        created_at: Date.now(),
      });

      return res.json({ orderID: order.id });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create order';
      console.error('[paypal] create-order', e);
      return res.status(500).json({ error: msg });
    }
  });

  /**
   * Credit coins for an already-captured PayPal order. Shared by the normal
   * capture flow and the retry-after-failure path. Idempotent via the
   * processed-credits doc keyed on captureId.
   */
  async function creditCoinsForOrder(
    orderRef: admin.firestore.DocumentReference,
    userId: string,
    coins: number,
    cents: number,
    captureId: string,
    orderID: string,
  ): Promise<number> {
    const userRef = db.collection(usersCollection).doc(userId);
    const processedRef = db.collection(processedCollection).doc(captureId);

    let newBalance = 0;
    await db.runTransaction(async (tx) => {
      const done = await tx.get(processedRef);
      const us = await tx.get(userRef);
      if (!us.exists) {
        throw new Error('User not found');
      }
      const cur = typeof us.data()?.coins === 'number' ? us.data()!.coins : 0;
      if (done.exists) {
        newBalance = cur;
        return;
      }
      newBalance = cur + coins;
      tx.update(userRef, { coins: newBalance, paid: true, updated_at: Date.now() });
      tx.set(processedRef, {
        captureId,
        orderId: orderID,
        userId,
        coins,
        cents,
        creditedAt: Date.now(),
      });
    });

    await orderRef.set({ status: 'completed', captureId, updated_at: Date.now() }, { merge: true });
    return newBalance;
  }

  // capturePayment — verify the approved order on the server, then credit coins + set paid.
  app.post('/pixel-pay/paypal/capture', async (req: Request, res: Response) => {
    try {
      const auth = requireAuth(req, res);
      if (!auth) return;

      if (!isPaypalConfigured()) {
        return res.status(500).json({ error: 'PayPal is not configured.' });
      }

      const orderID = String((req.body || {}).orderID || (req.body || {}).orderId || '').trim();
      if (!orderID) {
        return res.status(400).json({ error: 'orderID is required' });
      }

      const orderRef = db.collection(ordersCollection).doc(orderID);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) {
        return res.status(404).json({ error: 'Unknown order' });
      }
      const orderData = orderSnap.data() as {
        userId: string;
        coins: number;
        cents: number;
        status: string;
        captureId?: string;
      };

      if (orderData.userId !== auth.username.toLowerCase()) {
        return res.status(403).json({ error: 'This order belongs to another account.' });
      }

      // If the order was already captured (or completed), skip the PayPal
      // capture call and go straight to idempotent coin credit. This handles
      // the case where a previous capture succeeded but the DB credit failed.
      if ((orderData.status === 'captured' || orderData.status === 'completed') && orderData.captureId) {
        const newBalance = await creditCoinsForOrder(
          orderRef, orderData.userId, orderData.coins, orderData.cents, orderData.captureId, orderID,
        );
        console.log(`[paypal] Credited ${orderData.coins} coins to ${orderData.userId} (order ${orderID}, retry)`);
        return res.json({ success: true, coins: orderData.coins, newBalance, paid: true });
      }

      const accessToken = await getPaypalAccessToken();
      if (!accessToken) {
        return res.status(502).json({ error: 'Could not authenticate with PayPal.' });
      }

      const capRes = await fetch(`${getPaypalApiBase()}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const capture = (await capRes.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
        purchase_units?: Array<{
          payments?: {
            captures?: Array<{ id?: string; status?: string; amount?: { value?: string; currency_code?: string } }>;
          };
        }>;
      };

      if (!capRes.ok || capture.status !== 'COMPLETED') {
        console.error('[paypal] capture not completed', capRes.status, capture);
        await orderRef.set({ status: 'failed', updated_at: Date.now() }, { merge: true });
        return res.status(402).json({ error: capture.message || 'Payment was not completed.' });
      }

      const captureObj = capture.purchase_units?.[0]?.payments?.captures?.[0];
      const captureId = captureObj?.id || orderID;
      const paidValue = captureObj?.amount?.value || '';
      const expected = dollarsFromCents(orderData.cents);

      if (paidValue !== expected) {
        console.error('[paypal] amount mismatch', { paidValue, expected, orderID });
        return res.status(400).json({ error: 'Payment amount did not match the order.' });
      }

      // Persist capture details immediately so retries can recover
      // without re-calling PayPal's capture API.
      await orderRef.set({ status: 'captured', captureId, updated_at: Date.now() }, { merge: true });

      const newBalance = await creditCoinsForOrder(
        orderRef, orderData.userId, orderData.coins, orderData.cents, captureId, orderID,
      );

      console.log(`[paypal] Credited ${orderData.coins} coins to ${orderData.userId} (order ${orderID})`);
      return res.json({ success: true, coins: orderData.coins, newBalance, paid: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to capture payment';
      console.error('[paypal] capture', e);
      return res.status(500).json({ error: msg });
    }
  });
}
