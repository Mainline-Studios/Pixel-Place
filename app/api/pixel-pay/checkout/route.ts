export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/middleware';
import { pixelPayCentsForCoins } from '@/lib/payPortal';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' }) : null;

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    if (!stripe || !stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const coins = parseInt(String(body?.coins ?? ''), 10);
    const cents = pixelPayCentsForCoins(coins);
    if (cents == null) {
      return NextResponse.json({ error: 'Invalid coin amount (allowed: 100–10,000)' }, { status: 400 });
    }

    const base = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const payBase = (process.env.NEXT_PUBLIC_PAY_PORTAL_URL || base).replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Pixel Place Pay — ${coins.toLocaleString('en-US')} Pixel Coins`,
              description: `Pixel Place Pay: ${coins.toLocaleString('en-US')} Pixel Coins for ${auth.user.username}`,
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
        userId: auth.user.username,
        coins: coins.toString(),
        priceId: 'pixel_place_pay',
        bundle: 'false',
        pixel_place_pay: 'true',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create checkout session';
    console.error('Pixel Place Pay checkout error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
