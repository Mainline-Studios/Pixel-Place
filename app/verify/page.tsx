'use client';

import { Suspense } from 'react';
import VerifyEmailFlow from '@/components/VerifyEmailFlow';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div style={{ color: 'var(--text-dim)' }}>Loading verification…</div>
        </div>
      }
    >
      <VerifyEmailFlow />
    </Suspense>
  );
}
