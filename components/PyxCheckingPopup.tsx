'use client';

import { useState, useEffect, useRef } from 'react';
import { checkForPublish } from '@/lib/pyx';

const STEPS = [
  'Scanning title...',
  'Analyzing description...',
  'Verifying content safety...',
  'Running Pyx AI checks...',
  'Almost there...',
];

interface PyxCheckingPopupProps {
  open: boolean;
  title: string;
  desc: string;
  onComplete: (result: { safe: boolean; titleBlocked?: boolean; descBlocked?: boolean; connectionError?: boolean }) => void;
}

export default function PyxCheckingPopup({ open, title, desc, onComplete }: PyxCheckingPopupProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      completedRef.current = false;
      return;
    }
    if (completedRef.current) return;
    completedRef.current = true;

    const durationMs = 5000 + Math.random() * 5000; // 5–10 seconds
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(99, (elapsed / durationMs) * 100);
      setProgress(pct);
      const step = Math.min(STEPS.length - 1, Math.floor((elapsed / durationMs) * STEPS.length));
      setStepIndex(step);
    }, 120);

    const run = async () => {
      await new Promise((r) => setTimeout(r, durationMs));
      clearInterval(interval);
      setProgress(100);
      setStepIndex(STEPS.length - 1);

      const [titleResult, descResult] = await Promise.all([
        checkForPublish(title || ''),
        checkForPublish(desc || ''),
      ]);

      const titleBlocked = !titleResult.safe;
      const descBlocked = !descResult.safe;
      const connectionError = titleResult.connectionError || descResult.connectionError;
      onComplete({
        safe: !titleBlocked && !descBlocked,
        titleBlocked: titleBlocked && !connectionError ? true : undefined,
        descBlocked: descBlocked && !connectionError ? true : undefined,
        connectionError: connectionError || undefined,
      });
    };

    run();
  }, [open, title, desc, onComplete]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          borderRadius: '12px',
          padding: '28px 36px',
          minWidth: '320px',
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>🛡️ Content Safety Check</div>
            <div className="smalltext" style={{ color: 'var(--text-dim)', marginTop: '2px' }}>
              Powered by Pyx AI
            </div>
          </div>
        </div>
        <div
          style={{
            color: 'var(--text-dim)',
            fontSize: '14px',
            marginBottom: '16px',
            minHeight: '22px',
          }}
        >
          {STEPS[stepIndex]}
        </div>
        <div
          style={{
            height: 6,
            background: 'var(--panel-alt)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent)',
              transition: 'width 0.15s ease-out',
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
