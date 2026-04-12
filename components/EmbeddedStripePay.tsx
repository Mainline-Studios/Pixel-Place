'use client';

import React from 'react';
import { clientEstimatePayUsdLabel } from '@/lib/payPortal';

export type EmbeddedStripePayProps = {
  coins: number;
  role?: string;
  onClose: () => void;
  /** Reserved for when checkout is enabled again. */
  onPaid?: () => void;
};

/**
 * Pixel Place Pay checkout is not shown yet — avoids card-entry copy while work is in progress.
 */
export default function EmbeddedStripePay({ coins, role, onClose }: EmbeddedStripePayProps) {
  const estimate = clientEstimatePayUsdLabel(coins, role);

  return (
    <div className="embedded-stripe-pay">
      <p className="embedded-stripe-pay__summary">
        <strong>{coins.toLocaleString('en-US')}</strong> Pixel Coins
        {estimate ? (
          <>
            {' '}
            · <strong>{estimate}</strong>
          </>
        ) : null}
      </p>
      <p className="embedded-stripe-pay__coming">
        Pixel Place Pay is being implemented. Purchases are not available yet — thanks for your patience.
      </p>
      <button type="button" className="embedded-stripe-pay__cancel" onClick={onClose}>
        Close
      </button>
      <style jsx global>{`
        .embedded-stripe-pay {
          color: #e2e8f0;
          max-width: 420px;
          margin: 0 auto;
        }
        .embedded-stripe-pay__summary {
          margin: 0 0 14px;
          font-size: 1rem;
        }
        .embedded-stripe-pay__coming {
          margin: 0 0 18px;
          font-size: 0.95rem;
          line-height: 1.55;
          color: #cbd5e1;
        }
        .embedded-stripe-pay__cancel {
          width: 100%;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(56, 189, 248, 0.15);
          color: #e2e8f0;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
        }
        .embedded-stripe-pay__cancel:hover {
          background: rgba(56, 189, 248, 0.25);
        }
      `}</style>
    </div>
  );
}
