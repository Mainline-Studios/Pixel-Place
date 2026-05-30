'use client';

import { useState, useEffect } from 'react';
import { User, CoinPack } from '@/types';
import { getTabContent } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';
import HolidayBundle from '@/components/HolidayBundle';
import PayPalCheckout from '@/components/PayPalCheckout';

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

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

export default function CoinsTab({ user, editMode }: CoinsTabProps) {
  const { updateUser } = useUser();
  const bal = typeof user.coins === 'number' ? user.coins : 0;
  const [loading, setLoading] = useState<string | null>(null);
  const [showHolidayBundle, setShowHolidayBundle] = useState(false);
  const [embedCoins, setEmbedCoins] = useState<number | null>(null);

  // Check if holiday bundle is available
  const getCurrentHoliday = () => {
    const month = new Date().getMonth() + 1;
    return [2, 3, 7, 10, 12].includes(month); // Valentine, Easter, Summer, Halloween, Christmas
  };

  // Check for successful payment (Stripe return URL may include payment_intent)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    const canceledParam = urlParams.get('canceled');
    const stripeReturn = urlParams.get('payment_intent');

    if (stripeReturn) {
      window.history.replaceState({}, '', window.location.pathname + (window.location.hash || '#coins'));
      setTimeout(async () => {
        const { getUsers } = await import('@/lib/storage');
        const users = await getUsers();
        const updatedUser = users.find((u) => u.username === user.username);
        if (updatedUser) updateUser({ coins: updatedUser.coins });
      }, 1800);
    }

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
    // Free coins for 6767kid (all packs)
    if (user.username === '6767kid') {
      if (!confirm(`Get ${formatNumber(pack.coins)} Coins for FREE?\nCurrent balance: ${formatNumber(bal)}`)) {
        return;
      }

      setLoading(pack.stripePriceId);

      try {
        // Grant coins via updateUser, which persists through /api/users
        // (the dedicated /api/add-coins endpoint is not served by the Cloud Function).
        const newBalance = bal + pack.coins;
        await updateUser({ coins: newBalance });
        alert(`Added ${formatNumber(pack.coins)} coins. New balance: ${formatNumber(newBalance)}.`);
      } catch (error: any) {
        console.error('Add coins error:', error);
        alert('Could not add coins. Please try again.');
      } finally {
        setLoading(null);
      }
      return;
    }

    if (!confirm(`Buy ${formatNumber(pack.coins)} Coins for ${pack.priceLabel}?\nCurrent balance: ${formatNumber(bal)}`)) {
      return;
    }

    setLoading(null);
    setEmbedCoins(pack.coins);
  };

  const refreshCoinsAfterPay = async () => {
    const { getUsers } = await import('@/lib/storage');
    const users = await getUsers();
    const updatedUser = users.find((u) => u.username === user.username);
    if (updatedUser) updateUser({ coins: updatedUser.coins });
  };

  return (
    <>
      <h2 className="section-title">Pixel Coins</h2>
      <div className="ai-box">
        <div className="ai-label">Your Balance</div>
        <div className="ai-output">{formatNumber(bal)} Pixel Coins</div>
      </div>
      <div className="ai-box">
        <div className="ai-label">Get More Coins</div>
        <div className="coins-store-row">
          {coinPacks.map((pack) => (
            <div key={pack.stripePriceId} className="coin-pack">
              <div className="coin-amount">{formatNumber(pack.coins)} Coins</div>
              <div className="coin-price">
                {user.username === '6767kid' ? 'FREE' : pack.priceLabel}
              </div>
              <button
                className="btn coin-buy-btn"
                onClick={() => handlePurchase(pack)}
                disabled={loading === pack.stripePriceId}
              >
                {loading === pack.stripePriceId ? 'Processing...' : user.username === '6767kid' ? 'Get Free' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
        <div className="smalltext">
          Secure checkout with PayPal. Pick a pack and pay — coins are added to your balance right after PayPal confirms.
        </div>
      </div>

      {embedCoins !== null && (
        <div
          className="coins-pay-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20000,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setEmbedCoins(null)}
          onKeyDown={(e) => e.key === 'Escape' && setEmbedCoins(null)}
          role="presentation"
        >
          <div
            className="coins-pay-modal"
            style={{
              maxWidth: 460,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: 16,
              padding: 24,
              background: '#1a1d29',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="coins-pay-title"
          >
            <h3 id="coins-pay-title" style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '1.25rem' }}>
              Pixel Place Pay
            </h3>
            <PayPalCheckout
              coins={embedCoins}
              role={user.role}
              onClose={() => setEmbedCoins(null)}
              onPaid={async (result) => {
                updateUser({ coins: result.newBalance });
                setEmbedCoins(null);
                await refreshCoinsAfterPay();
                alert(`Payment complete! ${formatNumber(result.coins)} coins added.`);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Holiday Bundle */}
      {getCurrentHoliday() && (
        <div className="ai-box" style={{ marginTop: '20px', border: '3px solid #FF6B00', background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
          <div className="ai-label" style={{ color: '#FF6B00', fontSize: '20px', fontWeight: 'bold' }}>
            🎉 Holiday Bundle Available!
          </div>
          <div style={{ color: '#fff', marginBottom: '15px', fontSize: '16px' }}>
            $30 • 8,500 Coins • Spin the Wheel for Exclusive Rewards!
          </div>
          <button
            className="btn"
            onClick={() => setShowHolidayBundle(true)}
            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
              color: '#fff',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)'
            }}
          >
            View Holiday Bundle
          </button>
        </div>
      )}

      {/* Admin-only coin pack */}
      {(user.role === 'admin' || user.role === 'head_admin') && (
        <div className="ai-box" style={{ marginTop: '20px', border: '2px solid #38bdf8' }}>
          <div className="ai-label" style={{ color: '#38bdf8' }}>Admin Exclusive</div>
          <div className="coins-store-row">
            <div className="coin-pack" style={{ border: '2px solid #38bdf8' }}>
              <div className="coin-amount" style={{ fontSize: '24px', color: '#38bdf8' }}>
                {formatNumber(adminCoinPack.coins)} Coins
              </div>
              <div className="coin-price" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {user.username === '6767kid' ? 'FREE' : adminCoinPack.priceLabel}
              </div>
              <button
                className="btn coin-buy-btn"
                onClick={() => handlePurchase(adminCoinPack)}
                disabled={loading === adminCoinPack.stripePriceId}
                style={
                  user.username === '6767kid' ? { background: '#38bdf8', color: '#0f172a' } : undefined
                }
              >
                {loading === adminCoinPack.stripePriceId ? 'Processing...' : user.username === '6767kid' ? 'Get Free' : 'Buy'}
              </button>
            </div>
          </div>
          <div className="smalltext" style={{ marginTop: '12px' }}>
            {user.username === '6767kid' 
              ? 'Special: Free for you!' 
              : 'Admin-only pack. $5 for 1,000,000 coins.'}
          </div>
        </div>
      )}

      {/* Holiday Bundle Modal */}
      {showHolidayBundle && (
        <HolidayBundle
          user={user}
          onClose={() => setShowHolidayBundle(false)}
        />
      )}
    </>
  );
}




