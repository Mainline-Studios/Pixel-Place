'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { authenticatedFetch } from '@/lib/api';
import { apiUrl } from '@/lib/apiBaseUrl';
import { clientEstimatePayUsdLabel } from '@/lib/payPortal';

/** Optional: local Next dev. Production uses GET /api/pixel-pay/stripe-publishable-key (first-party). */
const buildTimePublishableKey = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').trim();

function PayForm({
  onPaid,
  onError,
}: {
  onPaid: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError('');
    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}${window.location.search || ''}`;
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });
      if (error) {
        onError(error.message || 'Payment failed');
        setSubmitting(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        onPaid();
        return;
      }
      if (paymentIntent?.status === 'processing') {
        onPaid();
        return;
      }
      if (paymentIntent?.status === 'requires_action' || paymentIntent?.status === 'requires_payment_method' || paymentIntent?.status === 'requires_confirmation') {
        onError('Payment requires additional steps. Please try again.');
        setSubmitting(false);
        return;
      }
      onError('Payment was not confirmed. Please try again or contact support.');
      setSubmitting(false);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Payment failed');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="embedded-stripe-pay__form">
      <div className="embedded-stripe-pay__element-wrap">
        <PaymentElement />
      </div>
      <button type="submit" className="embedded-stripe-pay__submit" disabled={!stripe || submitting}>
        {submitting ? 'Processing…' : 'Complete payment'}
      </button>
    </form>
  );
}

export type EmbeddedStripePayProps = {
  coins: number;
  role?: string;
  onClose: () => void;
  /** Called after successful charge; refresh balance after a short delay for webhook. */
  onPaid: () => void;
};

export default function EmbeddedStripePay({ coins, role, onClose, onPaid }: EmbeddedStripePayProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(() =>
    buildTimePublishableKey ? loadStripe(buildTimePublishableKey) : null
  );
  const [keyLoadErr, setKeyLoadErr] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [payErr, setPayErr] = useState('');

  const refreshAfterWebhook = useCallback(() => {
    setTimeout(() => onPaid(), 1600);
  }, [onPaid]);

  useEffect(() => {
    if (buildTimePublishableKey) return;
    let cancelled = false;
    setKeyLoadErr(null);
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/pixel-pay/stripe-publishable-key'));
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data as { error?: string }).error || 'Pixel Place Pay is unavailable right now.');
        }
        const pk = String((data as { publishableKey?: string }).publishableKey || '').trim();
        if (!pk.startsWith('pk_')) {
          throw new Error('Pixel Place Pay is unavailable right now.');
        }
        if (!cancelled) setStripePromise(loadStripe(pk));
      } catch (e: unknown) {
        if (!cancelled) {
          setKeyLoadErr(e instanceof Error ? e.message : 'Pixel Place Pay is unavailable right now.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadErr(null);
    setClientSecret(null);
    (async () => {
      try {
        const res = await authenticatedFetch(apiUrl('/api/pixel-pay/create-payment-intent'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coins }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data as { error?: string }).error || 'Could not start payment');
        }
        const secret = (data as { clientSecret?: string }).clientSecret;
        if (!secret) throw new Error('Invalid payment response');
        if (!cancelled) setClientSecret(secret);
      } catch (e: unknown) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coins]);

  const estimate = clientEstimatePayUsdLabel(coins, role);

  if (keyLoadErr) {
    return (
      <div className="embedded-stripe-pay">
        <p className="embedded-stripe-pay__err">{keyLoadErr}</p>
        <button type="button" className="embedded-stripe-pay__cancel" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="embedded-stripe-pay">
        <p className="embedded-stripe-pay__loading">Connecting to Pixel Place Pay…</p>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="embedded-stripe-pay">
        <p className="embedded-stripe-pay__err">{loadErr}</p>
        <button type="button" className="embedded-stripe-pay__cancel" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="embedded-stripe-pay">
        <p className="embedded-stripe-pay__loading">Preparing checkout…</p>
      </div>
    );
  }

  return (
    <div className="embedded-stripe-pay">
      <p className="embedded-stripe-pay__summary">
        <strong>{coins.toLocaleString('en-US')}</strong> Pixel Coins · <strong>{estimate ?? '—'}</strong>
      </p>
      <p className="embedded-stripe-pay__legal">
        You are checking out on Pixel Place. Card and bank details are handled by our payment partner for security; Pixel Place never
        receives or stores your full card number.
      </p>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#38bdf8',
              colorBackground: '#1e293b',
              colorText: '#f1f5f9',
              borderRadius: '10px',
            },
          },
        }}
      >
        <PayForm onPaid={refreshAfterWebhook} onError={setPayErr} />
      </Elements>
      {payErr ? <p className="embedded-stripe-pay__err">{payErr}</p> : null}
      <button type="button" className="embedded-stripe-pay__cancel" onClick={onClose}>
        Cancel
      </button>
      <style jsx global>{`
        .embedded-stripe-pay {
          color: #e2e8f0;
          max-width: 420px;
          margin: 0 auto;
        }
        .embedded-stripe-pay__summary {
          margin: 0 0 10px;
          font-size: 1rem;
        }
        .embedded-stripe-pay__legal {
          margin: 0 0 16px;
          font-size: 0.78rem;
          line-height: 1.45;
          opacity: 0.72;
        }
        .embedded-stripe-pay__element-wrap {
          margin-bottom: 14px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .embedded-stripe-pay__submit {
          width: 100%;
          padding: 14px 18px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          color: #0f172a;
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
        }
        .embedded-stripe-pay__submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .embedded-stripe-pay__cancel {
          margin-top: 12px;
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .embedded-stripe-pay__err {
          color: #fca5a5;
          font-size: 0.9rem;
          margin: 10px 0 0;
        }
        .embedded-stripe-pay__warn {
          color: #fcd34d;
          font-size: 0.9rem;
        }
        .embedded-stripe-pay__loading {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
