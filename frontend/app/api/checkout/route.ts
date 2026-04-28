import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey || stripeSecretKey === '') {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will not work.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
}) : null;

// Coin pack prices in cents
const COIN_PACKS: { [key: string]: { coins: number; amount: number; bundle?: boolean } } = {
  'price_100': { coins: 100, amount: 99 },
  'price_400': { coins: 400, amount: 349 },
  'price_1000': { coins: 1000, amount: 799 },
  'price_2500': { coins: 2500, amount: 1499 },
  'price_10000': { coins: 10000, amount: 4999 },
  'price_admin_1000000': { coins: 1000000, amount: 500 }, // Admin pack: $5.00
  'holiday_bundle': { coins: 8500, amount: 3000, bundle: true }, // Holiday bundle: $30.00
};

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    const { priceId, userId, coins, bundle } = await request.json();

    if (!priceId || !userId) {
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

    // For holiday bundles, check if it's the right month
    if (bundle && priceId === 'holiday_bundle') {
      const month = new Date().getMonth() + 1;
      const holidayMonths = [2, 3, 7, 10, 12]; // Valentine, Easter, Summer, Halloween, Christmas
      if (!holidayMonths.includes(month)) {
        return NextResponse.json(
          { error: 'Holiday bundle is only available during holiday months' },
          { status: 400 }
        );
      }
    }

    // Create Stripe Checkout Session
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?success=true&session_id={CHECKOUT_SESSION_ID}#coins`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?canceled=true#coins`,
      metadata: {
        userId: userId,
        coins: pack.coins.toString(),
        priceId: priceId,
        bundle: pack.bundle ? 'true' : 'false',
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
