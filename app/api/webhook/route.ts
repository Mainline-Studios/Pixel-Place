import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/storage';

// Optional Stripe import
let Stripe: any = null;
try {
  Stripe = require('stripe').default;
} catch (e) {
  // Stripe not installed
}

const stripe = Stripe ? new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please install stripe package.' },
      { status: 503 }
    );
  }
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  // Skip signature verification in development if webhook secret is not set
  if (!webhookSecret || webhookSecret === 'whsec_your_webhook_secret_here') {
    console.warn('Webhook secret not configured, skipping verification');
    // In development, you can process the webhook without verification
    // In production, always verify the signature
  }

  let event: any;

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
      const users = getUsers();
      const userIndex = users.findIndex((u) => u.username === userId);

      if (userIndex !== -1) {
        const currentCoins = typeof users[userIndex].coins === 'number' ? users[userIndex].coins : 0;
        users[userIndex].coins = currentCoins + coins;
        saveUsers(users);
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
