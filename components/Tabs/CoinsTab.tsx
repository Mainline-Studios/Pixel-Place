'use client';

import { User, CoinPack } from '@/types';
import { getTabContent } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

interface CoinsTabProps {
  user: User;
  editMode: boolean;
}

const coinPacks: CoinPack[] = [
  { coins: 100, priceLabel: '$0.99', stripePriceId: 'price_XXXXXXXX1' },
  { coins: 400, priceLabel: '$3.49', stripePriceId: 'price_XXXXXXXX2' },
  { coins: 1000, priceLabel: '$7.99', stripePriceId: 'price_XXXXXXXX3' },
  { coins: 2500, priceLabel: '$14.99', stripePriceId: 'price_XXXXXXXX4' },
  { coins: 10000, priceLabel: '$49.99', stripePriceId: 'price_XXXXXXXX5' },
];

export default function CoinsTab({ user, editMode }: CoinsTabProps) {
  const { updateUser } = useUser();
  const bal = typeof user.coins === 'number' ? user.coins : 0;
  const tabContent = getTabContent();

  const handlePurchase = (pack: CoinPack) => {
    if (confirm(`Buy ${pack.coins} Coins for ${pack.priceLabel}?\nCurrent balance: ${bal}`)) {
      // Simulate payment - in production, this would go through Stripe
      const newCoins = bal + pack.coins;
      updateUser({ coins: newCoins });
      alert(`Purchase complete: +${pack.coins} Coins!`);
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
              <button className="btn coin-buy-btn" onClick={() => handlePurchase(pack)}>
                Buy
              </button>
            </div>
          ))}
        </div>
        <div className="smalltext">
          Choose a bundle. Offline mode: coins are added right away. Live mode: goes through your payment server.
        </div>
      </div>
      <div className="ai-box">
        <div className="ai-label">Coins Info</div>
        <div className="ai-output">{tabContent.coins || ''}</div>
      </div>
    </>
  );
}


