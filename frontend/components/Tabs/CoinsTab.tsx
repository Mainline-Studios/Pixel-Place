'use client';

import { useState, useEffect } from 'react';
import { User, CoinPack } from '@/types';
import { getTabContent, isPrimaryOpsAdmin } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';
import { navigateToTab } from '@/lib/routing';
import { isBackendConfigured } from '@/lib/backendV1';
import { useUser } from '@/contexts/UserContext';
import { loadStripe } from '@stripe/stripe-js';


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

// Admin-only coin pack
const adminCoinPack: CoinPack = {
  coins: 1000000,
  priceLabel: '$5.00',
  stripePriceId: 'price_admin_1000000'
};

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

export default function CoinsTab({ user, editMode }: CoinsTabProps) {
  const { updateUser } = useUser();
  const bal = typeof user.coins === 'number' ? user.coins : 0;
  const [loading, setLoading] = useState<string | null>(null);

  // Check for successful payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    const canceledParam = urlParams.get('canceled');
    
    if (successParam === 'true') {
      // Silent success - no alert
      // Clear URL params and ensure we stay on coins tab
      window.history.replaceState({}, '', window.location.pathname + '#coins');
      // Refresh user data - the webhook should have already updated the coins
      // Wait a moment for webhook to process, then refresh user data
      setTimeout(async () => {
        const { getUsers } = await import('@/lib/storage');
        const users = await getUsers();
        const updatedUser = users.find(u => u.username === user.username);
        if (updatedUser) {
          updateUser({ coins: updatedUser.coins });
        }
      }, 1500);
    } else if (canceledParam === 'true') {
      // Silent cancel - no alert
      // Clear URL params and ensure we stay on coins tab
      window.history.replaceState({}, '', window.location.pathname + '#coins');
    }
  }, [user.username, updateUser]);

  const handlePurchase = async (pack: CoinPack) => {
    // Free coins for primary ops account (all packs)
    if (isPrimaryOpsAdmin(user.username)) {
      setLoading(pack.stripePriceId);

      try {
        // Add coins directly without payment
        const response = await fetch(apiUrl('/api/add-coins'), {          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.username,
            coins: pack.coins,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add coins');
        }

        // Update user balance locally
        const newBalance = bal + pack.coins;
        updateUser({ coins: newBalance });
        // Silent success - no alert
        setLoading(null);
      } catch (error: any) {
        console.error('Add coins error:', error);
        // Silent error - no alert
        setLoading(null);
      }
      return;
    }

    // Admin pack special handling - free for primary ops account, $5 for other admins
    if (pack.stripePriceId === 'price_admin_1000000' && (user.role === 'admin' || user.role === 'head_admin')) {
      if (!confirm(`Buy ${formatNumber(pack.coins)} Coins for ${pack.priceLabel}?\nCurrent balance: ${formatNumber(bal)}`)) {
        return;
      }

      setLoading(pack.stripePriceId);

      try {
        // Create checkout session for $5
        const response = await fetch(apiUrl('/api/checkout'), {          method: 'POST',
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
        // Silent error - no alert        setLoading(null);
      }
      return;
    }

    // Regular Stripe payment for other users
    setLoading(pack.stripePriceId);

    try {
      // Create checkout session
      const response = await fetch(apiUrl('/api/checkout'), {
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
        throw new Error('Stripe failed to load. Please check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file.');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      // Silent error - no alert      setLoading(null);
    }
  };

  return (
    <>
      <h2 className="section-title">Pixel Coins</h2>
      <div className="ai-box">
        <div className="ai-label">Your Balance</div>
        <div className="ai-output">{formatNumber(bal)} Pixel Coins</div>
      </div>
      {isBackendConfigured() && user.authBackend === 'postgres' && (
        <div className="ai-box">
          <div className="ai-label">Themes & subscription</div>
          <p className="smalltext" style={{ marginBottom: 12 }}>
            Cosmetic themes, optional cooldown tweak (capped), and private canvases — separate from coin packs.
          </p>
          <button type="button" className="btn coin-buy-btn" onClick={() => navigateToTab('premium')}>
            Premium & upgrades
          </button>
        </div>
      )}
      <div className="ai-box">
        <div className="ai-label">Get More Coins</div>
        <div className="coins-store-row">
          {coinPacks.map((pack) => (
            <div key={pack.stripePriceId} className="coin-pack">
              <div className="coin-amount">{formatNumber(pack.coins)} Coins</div>
              <div className="coin-price">
                {isPrimaryOpsAdmin(user.username) ? 'FREE' : pack.priceLabel}
              </div>
              <button
                className="btn coin-buy-btn"
                onClick={() => handlePurchase(pack)}
                disabled={loading === pack.stripePriceId}
              >
                {loading === pack.stripePriceId ? 'Processing...' : isPrimaryOpsAdmin(user.username) ? 'Get Free' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
        <div className="smalltext">
          Secure payments powered by Stripe. Your coins will be added automatically after successful payment.
        </div>
      </div>
      
      

      {/* Admin-only coin pack */}
      {(user.role === 'admin' || user.role === 'head_admin') && (
        <div className="ai-box" style={{ marginTop: '20px', border: '2px solid #00aaff' }}>
          <div className="ai-label" style={{ color: '#00aaff' }}>Admin Exclusive</div>
          <div className="coins-store-row">
            <div className="coin-pack" style={{ border: '2px solid #00aaff' }}>
              <div className="coin-amount" style={{ fontSize: '24px', color: '#00aaff' }}>
                {formatNumber(adminCoinPack.coins)} Coins
              </div>
              <div className="coin-price" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {isPrimaryOpsAdmin(user.username) ? 'FREE' : adminCoinPack.priceLabel}
              </div>
              <button
                className="btn coin-buy-btn"
                onClick={() => handlePurchase(adminCoinPack)}
                disabled={loading === adminCoinPack.stripePriceId}
                style={{ background: isPrimaryOpsAdmin(user.username) ? '#00aaff' : undefined }}
              >
                {loading === adminCoinPack.stripePriceId ? 'Processing...' : isPrimaryOpsAdmin(user.username) ? 'Get Free' : 'Buy'}
              </button>
            </div>
          </div>
          <div className="smalltext" style={{ marginTop: '12px' }}>
            {isPrimaryOpsAdmin(user.username)
              ? 'Special: Free for you!'
              : 'Admin-only pack. $5 for 1,000,000 coins.'}
          </div>
        </div>
      )}

      
    </>
  );
}




