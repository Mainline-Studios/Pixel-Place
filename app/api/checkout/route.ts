import { NextRequest, NextResponse } from 'next/server';

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

// Coin pack prices in cents
const COIN_PACKS: { [key: string]: { coins: number; amount: number } } = {
  'price_100': { coins: 100, amount: 99 },
  'price_400': { coins: 400, amount: 349 },
  'price_1000': { coins: 1000, amount: 799 },
  'price_2500': { coins: 2500, amount: 1499 },
  'price_10000': { coins: 10000, amount: 4999 },
};

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please install stripe package.' },
      { status: 503 }
    );
  }
  try {
    const { priceId, userId, coins } = await request.json();

    if (!priceId || !userId || !coins) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const pack = COIN_PACKS[priceId];
    if (!pack) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pack.coins} Pixel Coins`,
              description: `Purchase ${pack.coins} Pixel Coins for your account`,
            },
            unit_amount: pack.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/coins?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/coins?canceled=true`,
      metadata: {
        userId: userId,
        coins: pack.coins.toString(),
        priceId: priceId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
