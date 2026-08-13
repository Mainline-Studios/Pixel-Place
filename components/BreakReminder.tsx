'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiUrl } from '@/lib/apiBaseUrl';

interface BreakReminderProps {
  onTakeBreak?: () => void;
  onDismiss?: () => void;
}

export default function BreakReminder({ onTakeBreak, onDismiss }: BreakReminderProps) {
  const { user } = useUser();
  const [show, setShow] = useState(false);
  const [safetyData, setSafetyData] = useState<any>(null);
  const [breakInProgress, setBreakInProgress] = useState(false);
  const [breakEndsAt, setBreakEndsAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [dismissedActiveBreak, setDismissedActiveBreak] = useState(false);

  const formatRemaining = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!user || user.isGuest) return;

    const checkBreakStatus = async () => {
      try {
        const response = await fetch(apiUrl(`/api/safety?username=${user.username}`));
        const data = await response.json();
        setSafetyData(data);
        const hasActiveBreak = !!data.breakInProgress && !!data.breakEndsAt;
        setBreakInProgress(hasActiveBreak);
        setBreakEndsAt(hasActiveBreak ? data.breakEndsAt : null);
        if (!hasActiveBreak) {
          setDismissedActiveBreak(false);
        }
        if (hasActiveBreak && data.breakEndsAt) {
          setRemainingMs(Math.max(0, data.breakEndsAt - Date.now()));
        } else {
          setRemainingMs(null);
        }

        // Show reminder if playtime >= 1 hour and not dismissed recently
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        const lastReminder = data.lastBreakReminder || 0;
        const timeSinceReminder = Date.now() - lastReminder;
        
        if (hasActiveBreak) {
          if (!dismissedActiveBreak) {
            setShow(true);
          }
        } else if (data.playtimeToday >= oneHour && timeSinceReminder > 5 * 60 * 1000) {
          // Show reminder if playtime >= 1 hour and last reminder was > 5 minutes ago
          setShow(true);
        } else {
          setShow(false);
        }
      } catch (error) {
        console.error('Error checking break status:', error);
      }
    };

    checkBreakStatus();
    const interval = setInterval(checkBreakStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, dismissedActiveBreak]);

  useEffect(() => {
    if (!breakInProgress || !breakEndsAt) return;
    const interval = setInterval(() => {
      setRemainingMs(Math.max(0, breakEndsAt - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [breakInProgress, breakEndsAt]);

  if (!show || !user) return null;

  const breaksRemaining = 3 - (safetyData?.breaksToday || 0);
  const canTakeBreak = breaksRemaining > 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #1a1d29 0%, #2a2f45 100%)',
        border: '2px solid #4a90e2',
        borderRadius: '16px',
        padding: '32px',
        zIndex: 10001,
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(74, 144, 226, 0.3)',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{breakInProgress ? '🛡️' : '⏰'}</div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          color: '#ffffff', 
          margin: '0 0 8px 0' 
        }}>
          {breakInProgress ? 'Break in Progress' : 'Time for a Break!'}
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: '#8b90a8', 
          margin: 0,
          lineHeight: 1.5
        }}>
          {breakInProgress
            ? 'Your 30-minute break timer is running. Stretch, hydrate, and come back fresh.'
            : "You've been playing for over an hour. Take a 30-minute break — your avatar will thank you."}
        </p>
      </div>

      <div style={{
        background: 'rgba(74, 144, 226, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        border: '1px solid rgba(74, 144, 226, 0.3)'
      }}>
        {breakInProgress && breakEndsAt && (
          <div style={{ 
            fontSize: '14px', 
            color: '#c9cde0',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span>Time remaining:</span>
            <span style={{ fontWeight: 700, color: '#4a90e2' }}>
              {formatRemaining(remainingMs ?? Math.max(0, breakEndsAt - Date.now()))}
            </span>
          </div>
        )}
        <div style={{ 
          fontSize: '14px', 
          color: '#c9cde0',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span>Breaks taken today:</span>
          <span style={{ fontWeight: 600, color: '#4a90e2' }}>
            {safetyData?.breaksToday || 0} / 3
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {!breakInProgress ? (
          canTakeBreak ? (
            <button
              onClick={async () => {
                try {
                  const response = await fetch(apiUrl('/api/safety'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      username: user.username,
                      action: 'startBreak'
                    })
                  });
                  const data = await response.json();
                  if (data.success) {
                    setBreakInProgress(true);
                    setBreakEndsAt(data.breakEndsAt || null);
                    setRemainingMs(data.breakRemainingMs || null);
                    setDismissedActiveBreak(false);
                    setShow(true);
                    onTakeBreak?.();
                  } else {
                    alert(data.error || 'Failed to start break');
                  }
                } catch (error) {
                  console.error('Error starting break:', error);
                }
              }}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                padding: '14px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.4)';
              }}
            >
              Start 30-Min Break
            </button>
          ) : (
            <div style={{
              flex: 1,
              background: 'rgba(139, 144, 168, 0.2)',
              border: '1px solid rgba(139, 144, 168, 0.3)',
              color: '#8b90a8',
              fontSize: '16px',
              fontWeight: 600,
              padding: '14px 24px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              Max breaks reached today
            </div>
          )
        ) : (
          <div style={{
            flex: 1,
            background: 'rgba(74, 144, 226, 0.15)',
            border: '1px solid rgba(74, 144, 226, 0.4)',
            color: '#c9cde0',
            fontSize: '16px',
            fontWeight: 600,
            padding: '14px 24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            Break running...
          </div>
        )}
        <button
          onClick={async () => {
            if (breakInProgress) {
              setDismissedActiveBreak(true);
              setShow(false);
              return;
            }
            try {
              await fetch(apiUrl('/api/safety'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: user.username,
                  action: 'dismissReminder'
                })
              });
              onDismiss?.();
              setShow(false);
            } catch (error) {
              console.error('Error dismissing reminder:', error);
              setShow(false);
            }
          }}
          style={{
            background: 'rgba(139, 144, 168, 0.2)',
            border: '1px solid rgba(139, 144, 168, 0.3)',
            color: '#8b90a8',
            fontSize: '16px',
            fontWeight: 600,
            padding: '14px 24px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(139, 144, 168, 0.3)';
            e.currentTarget.style.color = '#c9cde0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(139, 144, 168, 0.2)';
            e.currentTarget.style.color = '#8b90a8';
          }}
        >
          {breakInProgress ? 'Hide Timer' : 'Dismiss'}
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translate(-50%, -60%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
