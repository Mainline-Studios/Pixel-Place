'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import {
  ANTI_67_AUDIO_URL,
  ANTI_67_SKIP_PENALTY_PLAYS,
  canDismissAnti67,
  getAnti67FromPreferences,
  isAnti67Blocking,
  mergeAnti67IntoPreferences,
} from '@/lib/anti67';
import {
  dismissAnti67Lock,
  recordAnti67PlayComplete,
  recordAnti67SkipPenalty,
} from '@/lib/anti67Api';

/** Ignore skip detection for this long after each play starts (buffering hiccups). */
const PLAYBACK_GRACE_MS = 3500;
/** Forward seek must pass the furthest natural playback point by at least this much. */
const MANUAL_SEEK_AHEAD_SEC = 0.75;

export default function Anti67LockOverlay() {
  const { user, updateUser } = useUser();
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastTimeRef = useRef(0);
  const lastSampleAtRef = useRef(0);
  const maxReachedRef = useRef(0);
  const playStartTimeRef = useRef(0);
  const playSessionStartedAtRef = useRef(0);
  const skipPenaltyBusyRef = useRef(false);
  const [syncing, setSyncing] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  const prefs = user?.accountPreferences;
  const anti67 = getAnti67FromPreferences(prefs);
  const blocking = isAnti67Blocking(prefs);
  const canClose = canDismissAnti67(prefs);
  const isNoVote = anti67.vote === 'no';
  const downloadAlways = isNoVote;

  useEffect(() => {
    if (!blocking) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [blocking]);

  const applyAnti67 = useCallback(
    async (next: { locked: boolean; playsCompleted: number; requiredPlays?: number }) => {
      if (!user) return;
      await updateUser({
        accountPreferences: mergeAnti67IntoPreferences(user.accountPreferences, next),
      });
    },
    [updateUser, user],
  );

  const onSkipDetected = useCallback(async () => {
    if (anti67.vote === 'no' || anti67.allowEarlyDismiss) return;
    if (skipPenaltyBusyRef.current || syncing) return;
    const audio = audioRef.current;
    if (!audio) return;

    skipPenaltyBusyRef.current = true;
    const rewindTo = playStartTimeRef.current;
    audio.pause();
    audio.currentTime = rewindTo;
    lastTimeRef.current = rewindTo;

    setSyncing(true);
    const result = await recordAnti67SkipPenalty();
    setSyncing(false);

    if (!result.ok || !result.anti67) {
      setLocalMessage(result.error || 'Could not apply skip penalty.');
      skipPenaltyBusyRef.current = false;
      return;
    }

    await applyAnti67({
      locked: true,
      playsCompleted: result.anti67.playsCompleted ?? anti67.playsCompleted,
      requiredPlays: result.anti67.requiredPlays ?? anti67.requiredPlays + ANTI_67_SKIP_PENALTY_PLAYS,
    });
    setLocalMessage(
      `No skipping. +${ANTI_67_SKIP_PENALTY_PLAYS} more listens required (${result.anti67.playsCompleted ?? anti67.playsCompleted} / ${result.anti67.requiredPlays ?? anti67.requiredPlays + ANTI_67_SKIP_PENALTY_PLAYS}).`,
    );
    skipPenaltyBusyRef.current = false;
  }, [anti67.allowEarlyDismiss, anti67.playsCompleted, anti67.requiredPlays, anti67.vote, applyAnti67, syncing]);

  const resetPlaybackTrackers = useCallback((audio: HTMLAudioElement) => {
    const t = audio.currentTime;
    playStartTimeRef.current = t;
    lastTimeRef.current = t;
    maxReachedRef.current = t;
    lastSampleAtRef.current = Date.now();
    playSessionStartedAtRef.current = Date.now();
  }, []);

  const isForwardSeekPastProgress = useCallback((target: number) => {
    if (Date.now() - playSessionStartedAtRef.current < PLAYBACK_GRACE_MS) return false;
    return target > maxReachedRef.current + MANUAL_SEEK_AHEAD_SEC;
  }, []);

  const onTimeUpdate = useCallback(() => {
    if (anti67.vote === 'no') return;
    const audio = audioRef.current;
    if (!audio || audio.paused || audio.ended) return;

    const t = audio.currentTime;
    const now = Date.now();
    const last = lastTimeRef.current;
    const elapsedSec = Math.max(0, (now - lastSampleAtRef.current) / 1000);
    lastSampleAtRef.current = now;

    if (now - playSessionStartedAtRef.current < PLAYBACK_GRACE_MS) {
      maxReachedRef.current = Math.max(maxReachedRef.current, t);
      lastTimeRef.current = t;
      return;
    }

    // Allow natural playback jitter/buffering: can't jump ahead more than real time + slack.
    const maxNaturalJump = Math.max(0.75, elapsedSec * 1.5 + 0.35);
    if (t - last > maxNaturalJump && isForwardSeekPastProgress(t)) {
      void onSkipDetected();
      return;
    }

    if (t >= last - 0.2) {
      maxReachedRef.current = Math.max(maxReachedRef.current, t);
      lastTimeRef.current = t;
    }
  }, [anti67.vote, isForwardSeekPastProgress, onSkipDetected]);

  const onPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    resetPlaybackTrackers(audio);
  }, [resetPlaybackTrackers]);

  const onSeeking = useCallback(() => {
    if (anti67.vote === 'no') return;
    const audio = audioRef.current;
    if (!audio) return;
    if (isForwardSeekPastProgress(audio.currentTime)) {
      void onSkipDetected();
    }
  }, [anti67.vote, isForwardSeekPastProgress, onSkipDetected]);

  const onPlayEnded = useCallback(async () => {
    if (!blocking || anti67.playsCompleted >= anti67.requiredPlays || syncing) return;
    setSyncing(true);
    setLocalMessage('');
    const result = await recordAnti67PlayComplete();
    setSyncing(false);
    if (!result.ok || !result.anti67) {
      setLocalMessage(result.error || 'Could not save listen progress.');
      return;
    }
    const next = {
      locked: true as const,
      playsCompleted: Number(result.anti67.playsCompleted) || 0,
      requiredPlays: Number(result.anti67.requiredPlays) || anti67.requiredPlays,
    };
    await applyAnti67(next);
    playStartTimeRef.current = 0;
    lastTimeRef.current = 0;
    maxReachedRef.current = 0;
    lastSampleAtRef.current = 0;
    if (next.playsCompleted >= next.requiredPlays) {
      setLocalMessage('');
    } else if (!isNoVote) {
      setLocalMessage('');
    }
  }, [anti67.playsCompleted, anti67.requiredPlays, anti67.vote, applyAnti67, blocking, isNoVote, syncing]);

  const onDismiss = async () => {
    if (!canClose || syncing) return;
    setSyncing(true);
    const result = await dismissAnti67Lock();
    setSyncing(false);
    if (!result.ok || !result.anti67) {
      setLocalMessage(result.error || 'Could not close.');
      return;
    }
    await applyAnti67(result.anti67);
  };

  if (!user || !blocking) return null;

  const remaining = Math.max(0, anti67.requiredPlays - anti67.playsCompleted);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="anti67-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000,
        background: 'rgba(8, 10, 18, 0.94)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          background: 'rgba(22, 26, 40, 0.98)',
          border: '1px solid rgba(132, 145, 255, 0.4)',
          borderRadius: 16,
          padding: 24,
          color: '#f3f4f6',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
        }}
      >
        <h2 id="anti67-title" style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800 }}>
          Anti 67
        </h2>
        {!isNoVote && anti67.requiredPlays > 1 ? (
          <p style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#93c5fd' }}>
            {anti67.playsCompleted} / {anti67.requiredPlays}
            {remaining > 0 ? ` · ${remaining} left` : ''}
          </p>
        ) : null}

        <audio
          ref={audioRef}
          src={ANTI_67_AUDIO_URL}
          preload="auto"
          controls
          controlsList="noremoteplayback"
          style={{ width: '100%', marginBottom: 14 }}
          onPlay={onPlay}
          onTimeUpdate={onTimeUpdate}
          onSeeking={onSeeking}
          onEnded={() => void onPlayEnded()}
        />

        {localMessage ? (
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 13,
              color: localMessage.includes('No skipping') ? '#fca5a5' : '#86efac',
              fontWeight: 600,
            }}
          >
            {localMessage}
          </p>
        ) : null}
        {syncing ? (
          <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-dim)' }}>Saving…</p>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <a
            href={ANTI_67_AUDIO_URL}
            download="Anti-67.mp3"
            className="btn"
            style={{
              width: '100%',
              maxWidth: 220,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: downloadAlways || canClose ? 1 : 0.5,
              pointerEvents: downloadAlways || canClose ? 'auto' : 'none',
              ...(isNoVote
                ? {
                    background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: '1px solid #60a5fa',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
                  }
                : {}),
            }}
          >
            Download Anti 67
          </a>
          <button
            type="button"
            className="btn"
            disabled={!canClose || syncing}
            onClick={() => void onDismiss()}
            style={{
              width: '100%',
              maxWidth: 220,
              opacity: canClose ? 1 : 0.35,
              cursor: canClose && !syncing ? 'pointer' : 'not-allowed',
              color: canClose ? '#e5e7eb' : '#6b7280',
            }}
            title={canClose ? 'Close' : 'Close'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
