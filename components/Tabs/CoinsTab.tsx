'use client';

import { useState, useEffect } from 'react';
import { User, CoinPack } from '@/types';
import { getTabContent } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/lib/toast';
// Optional Stripe - install @stripe/stripe-js to enable
// For now, Stripe is disabled to allow build without the package
let loadStripe: any = null;

interface CoinsTabProps {
  user: User;
  editMode: boolean;
}

const coinPacks: CoinPack[] = [
  { coins: 100, priceLabel: '$0.99', stripePriceId: 'price_100' },
  { coins: 400, priceLabel: '$3.49', stripePriceId: 'price_400' },
  { coins: 1000, priceLabel: '$7.99', stripePriceId: 'price_1000' },
  { coins: 2500, priceLabel: '$14.99', stripePriceId: 'price_2500' },
  { coins: 10000, priceLabel: '$49.99', stripePriceId: 'price_10000' },
];

// Initialize Stripe (if available)
const stripePromise = loadStripe
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')
  : Promise.resolve(null);

export default function CoinsTab({ user, editMode }: CoinsTabProps) {
  const { updateUser } = useUser();
  const bal = typeof user.coins === 'number' ? user.coins : 0;
  const tabContent = getTabContent();
  const [loading, setLoading] = useState<string | null>(null);

  // Check for successful payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.info('Payment successful! Your coins have been added to your account.');
      // Refresh user data
      window.location.search = '';
    } else if (urlParams.get('canceled') === 'true') {
      toast.info('Payment was canceled.');
      window.location.search = '';
    }
  }, []);

  const handlePurchase = async (pack: CoinPack) => {
    if (!confirm(`Buy ${pack.coins} Coins for ${pack.priceLabel}?\nCurrent balance: ${bal}`)) {
      return;
    }

    setLoading(pack.stripePriceId);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: pack.stripePriceId,
          userId: user.username,
          coins: pack.coins,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.info(`Payment error: ${error.message || 'Something went wrong'}`);
      setLoading(null);
    }
  };

  return (
    <>
      <h2 className="section-title">Pixel Coins</h2>
      <div className="ai-box">
        <div className="ai-label">Your Balance</div>
        <div className="ai-output">{bal} Pixel Coins</div>
      </div>
      <div className="ai-box">
        <div className="ai-label">Get More Coins</div>
        <div className="coins-store-row">
          {coinPacks.map((pack) => (
            <div key={pack.stripePriceId} className="coin-pack">
              <div className="coin-amount">{pack.coins} Coins</div>
              <div className="coin-price">{pack.priceLabel}</div>
              <button
                className="btn coin-buy-btn"
                onClick={() => handlePurchase(pack)}
                disabled={loading === pack.stripePriceId}
              >
                {loading === pack.stripePriceId ? 'Processing...' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
        <div className="smalltext">
          Secure payments powered by Stripe. Your coins will be added automatically after successful payment.
        </div>
      </div>
      <div className="ai-box">
        <div className="ai-label">Coins Info</div>
        <div className="ai-output">{tabContent.coins || ''}</div>
      </div>
    </>
  );
}




