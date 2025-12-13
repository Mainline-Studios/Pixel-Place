'use client';

import { useState } from 'react';
import { User } from '@/types';
import { useUser } from '@/contexts/UserContext';

import { toast } from '@/lib/toast';
interface DonationTabProps {
  user: User;
  editMode: boolean;
}

const donationTiers = [
  { amount: 5, label: '$5', coins: 500, tier: 'Supporter', benefits: ['Limited AI Coder access', '500 bonus coins'] },
  { amount: 10, label: '$10', coins: 1200, tier: 'Patron', benefits: ['Full AI Coder access', '1200 bonus coins', 'Special badge'] },
  { amount: 25, label: '$25', coins: 3500, tier: 'Champion', benefits: ['Full AI Coder access', '3500 bonus coins', 'Special badge', 'Early access features'] },
  { amount: 50, label: '$50', coins: 7500, tier: 'Hero', benefits: ['Full AI Coder access', '7500 bonus coins', 'Special badge', 'Early access features', 'Exclusive skins'] },
  { amount: 100, label: '$100', coins: 16000, tier: 'Legend', benefits: ['Full AI Coder access', '16000 bonus coins', 'Special badge', 'Early access features', 'Exclusive skins', 'Priority support'] },
];

export default function DonationTab({ user, editMode }: DonationTabProps) {
  const { updateUser } = useUser();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const handleDonate = (tier: typeof donationTiers[0]) => {
    if (confirm(`Donate ${tier.label} to support Pixel Place?\n\nYou'll receive:\n- ${tier.coins} Pixel Coins\n- ${tier.tier} tier benefits\n- Full AI Coder access`)) {
      // Simulate payment - in production, this would go through payment processor
      const newCoins = (user.coins || 0) + tier.coins;
      const isDonor = true;
      const donationAmount = (user.donationAmount || 0) + tier.amount;
      
      updateUser({ 
        coins: newCoins, 
        isDonor,
        donationAmount
      });
      
      setSelectedTier(tier.amount);
      setTimeout(() => {
        toast.info(`Thank you for your ${tier.label} donation! You now have access to Full AI Coder and received ${tier.coins} coins.`);
        setSelectedTier(null);
      }, 100);
    }
  };

  const isDonor = user.isDonor || false;
  const totalDonated = user.donationAmount || 0;

  return (
    <>
      <h2 className="section-title">Support Pixel Place</h2>
      
      {isDonor && (
        <div className="ai-box" style={{ 
          background: 'linear-gradient(135deg, #2a3a1a 0%, #1a2a0a 100%)',
          borderColor: '#4a6a2a'
        }}>
          <div className="ai-label">🎉 Donor Status</div>
          <div className="ai-output">
            Thank you for your support! You've donated ${totalDonated.toFixed(2)} total.
            <br />
            <strong>You have Full AI Coder access!</strong>
          </div>
        </div>
      )}

      {!isDonor && (
        <div className="ai-box">
          <div className="ai-label">Why Donate?</div>
          <div className="ai-output">
            Support the development of Pixel Place and unlock powerful features:
            <br />• <strong>Full AI Coder</strong> - Complete AI assistance for building games
            <br />• <strong>Bonus Coins</strong> - Extra Pixel Coins to spend on skins and items
            <br />• <strong>Special Recognition</strong> - Get a donor badge and priority support
            <br />• <strong>Early Access</strong> - Try new features before everyone else
          </div>
        </div>
      )}

      <div className="ai-box">
        <div className="ai-label">Donation Tiers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {donationTiers.map((tier) => (
            <div 
              key={tier.amount}
              className="donation-tier-card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: selectedTier === tier.amount ? '2px solid #4a90e2' : '1px solid var(--border)',
                background: selectedTier === tier.amount ? 'rgba(74, 144, 226, 0.1)' : 'var(--panel-soft)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#4a90e2' }}>
                {tier.tier}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
                {tier.label}
              </div>
              <div style={{ fontSize: '14px', color: '#8b90a8', marginBottom: '16px' }}>
                {tier.coins.toLocaleString()} Coins
              </div>
              <ul style={{ 
                fontSize: '12px', 
                color: '#c9cde0', 
                marginBottom: '16px',
                paddingLeft: '20px',
                lineHeight: '1.6'
              }}>
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
              <button 
                className="btn" 
                onClick={() => handleDonate(tier)}
                style={{ width: '100%', background: isDonor ? 'var(--accent-bg)' : '#4a90e2' }}
                disabled={selectedTier === tier.amount}
              >
                {selectedTier === tier.amount ? 'Processing...' : `Donate ${tier.label}`}
              </button>
            </div>
          ))}
        </div>
        <div className="smalltext" style={{ marginTop: '16px' }}>
          Donations help keep Pixel Place free and support ongoing development. All donors get Full AI Coder access instantly.
        </div>
      </div>

      <div className="ai-box">
        <div className="ai-label">Donation Info</div>
        <div className="ai-output">
          <strong>Payment Methods:</strong> Credit Card, PayPal, Apple Pay
          <br />
          <strong>Note:</strong> In development mode, donations are simulated. Production mode will connect to a real payment processor.
        </div>
      </div>
    </>
  );
}

