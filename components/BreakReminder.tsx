'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

interface BreakReminderProps {
  onTakeBreak: () => void;
  onDismiss: () => void;
}

export default function BreakReminder({ onTakeBreak, onDismiss }: BreakReminderProps) {
  const { user } = useUser();
  const [show, setShow] = useState(false);
  const [safetyData, setSafetyData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const checkBreakStatus = async () => {
      try {
        const response = await fetch(`/api/safety?username=${user.username}`);
        const data = await response.json();
        setSafetyData(data);

        // Show reminder if playtime >= 1 hour and not dismissed recently
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        const lastReminder = data.lastBreakReminder || 0;
        const timeSinceReminder = Date.now() - lastReminder;
        
        if (data.playtimeToday >= oneHour && timeSinceReminder > 5 * 60 * 1000) {
          // Show reminder if playtime >= 1 hour and last reminder was > 5 minutes ago
          setShow(true);
        }
      } catch (error) {
        console.error('Error checking break status:', error);
      }
    };

    checkBreakStatus();
    const interval = setInterval(checkBreakStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          color: '#ffffff', 
          margin: '0 0 8px 0' 
        }}>
          Time for a Break!
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: '#8b90a8', 
          margin: 0,
          lineHeight: 1.5
        }}>
          You've been playing for over an hour. Take a 30-minute break to earn <strong style={{color: '#4a90e2'}}>35 Safety Points</strong>!
        </p>
      </div>

      <div style={{
        background: 'rgba(74, 144, 226, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        border: '1px solid rgba(74, 144, 226, 0.3)'
      }}>
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
        <div style={{ 
          fontSize: '14px', 
          color: '#c9cde0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Your Safety Points:</span>
          <span style={{ fontWeight: 600, color: '#4a90e2' }}>
            {safetyData?.safetyPoints || 0} 🛡️
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {canTakeBreak ? (
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/safety', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: user.username,
                    action: 'takeBreak'
                  })
                });
                const data = await response.json();
                if (data.success) {
                  // Refresh user data to get updated safety points
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                  onTakeBreak();
                  setShow(false);
                } else {
                  alert(data.error || 'Failed to take break');
                }
              } catch (error) {
                console.error('Error taking break:', error);
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
            Take Break (+35 🛡️)
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
        )}
        <button
          onClick={async () => {
            try {
              await fetch('/api/safety', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: user.username,
                  action: 'dismissReminder'
                })
              });
              onDismiss();
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
          Dismiss
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
