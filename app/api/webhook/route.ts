export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUsers, saveUsers } from '@/lib/storage';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
}) : null;

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const isProd = process.env.NODE_ENV === 'production';

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  const webhookConfigured = !!webhookSecret && webhookSecret !== 'whsec_your_webhook_secret_here';
  const stripeConfigured = !!stripe;
  const canVerify = webhookConfigured && stripeConfigured;

  // In production we never accept unverified webhooks.
  if (isProd && !canVerify) {
    console.error('Stripe webhook rejected in production: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Stripe webhook is not configured on the server' },
      { status: 500 }
    );
  }

  // Development fallback only: process JSON directly when Stripe secrets are unset.
  if (!canVerify) {
    console.warn('Webhook secret not configured or Stripe not set up, processing without verification');
    try {
      const event = JSON.parse(body);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const coins = parseInt(session.metadata?.coins || '0');

        if (userId && coins) {
          const users = await getUsers();
          const userIndex = users.findIndex((u) => u.username === userId);

          if (userIndex !== -1) {
            const currentCoins = typeof users[userIndex].coins === 'number' ? users[userIndex].coins : 0;
            users[userIndex].coins = currentCoins + coins;
            await saveUsers(users);
            console.log(`Added ${coins} coins to user ${userId}`);
          }
        }
      }
      return NextResponse.json({ received: true });
    } catch (err: any) {
      console.error('Error processing webhook (dev mode):', err);
      return NextResponse.json({ received: true });
    }
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const userId = session.metadata?.userId;
      const coins = parseInt(session.metadata?.coins || '0');

      if (!userId || !coins) {
        console.error('Missing metadata in session');
        return NextResponse.json({ received: true });
      }

      // Update user's coin balance
      const users = await getUsers();
      const userIndex = users.findIndex((u) => u.username === userId);

      if (userIndex !== -1) {
        const currentCoins = typeof users[userIndex].coins === 'number' ? users[userIndex].coins : 0;
        users[userIndex].coins = currentCoins + coins;
        await saveUsers(users);
        console.log(`Added ${coins} coins to user ${userId}`);
      } else {
        console.error(`User ${userId} not found`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  return NextResponse.json({ received: true });
}
