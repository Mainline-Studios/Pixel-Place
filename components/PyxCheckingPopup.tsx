'use client';

import { useState, useEffect, useRef } from 'react';
import { checkForPublish, analyzeCodeForPublish } from '@/lib/pyx';

const STEPS = [
  'Checking username...',
  'Scanning title...',
  'Analyzing description...',
  'Verifying content safety...',
  'Scanning code...',
  'Almost there...',
];

interface PyxCheckingPopupProps {
  open: boolean;
  /** Username (owner) to check for publish. */
  username: string;
  title: string;
  desc: string;
  /** When provided, game code is scanned with Pyx Analyze (/analyze/three). */
  gameCode?: string;
  onComplete: (result: { safe: boolean; usernameBlocked?: boolean; titleBlocked?: boolean; descBlocked?: boolean; codeBlocked?: boolean; connectionError?: boolean }) => void;
}

export default function PyxCheckingPopup({ open, username, title, desc, gameCode, onComplete }: PyxCheckingPopupProps) {
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

      const checks: Promise<unknown>[] = [
        checkForPublish(username || ''),
        checkForPublish(title || ''),
        checkForPublish(desc || ''),
      ];
      if (gameCode && gameCode.trim()) {
        checks.push(analyzeCodeForPublish(gameCode));
      }
      const results = await Promise.all(checks);
      const usernameResult = results[0] as { safe: boolean; connectionError?: boolean };
      const titleResult = results[1] as { safe: boolean; connectionError?: boolean };
      const descResult = results[2] as { safe: boolean; connectionError?: boolean };
      const codeResult = checks.length > 3 ? (results[3] as { safe: boolean; connectionError?: boolean }) : { safe: true };

      const usernameBlocked = !usernameResult.safe;
      const titleBlocked = !titleResult.safe;
      const descBlocked = !descResult.safe;
      const codeBlocked = !codeResult.safe;
      const connectionError =
        usernameResult.connectionError || titleResult.connectionError || descResult.connectionError || codeResult.connectionError;
      onComplete({
        safe: !usernameBlocked && !titleBlocked && !descBlocked && !codeBlocked,
        usernameBlocked: usernameBlocked && !connectionError ? true : undefined,
        titleBlocked: titleBlocked && !connectionError ? true : undefined,
        descBlocked: descBlocked && !connectionError ? true : undefined,
        codeBlocked: codeBlocked && !connectionError ? true : undefined,
        connectionError: connectionError || undefined,
      });
    };

    run();
  }, [open, username, title, desc, gameCode, onComplete]);

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
