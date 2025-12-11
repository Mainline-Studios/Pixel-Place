'use client';

import { useState } from 'react';
import { Ban } from '@/types';
import { createBanAppeal } from '@/lib/storage';

interface BanScreenProps {
  ban: Ban;
  username: string;
  onAppealSubmitted: () => void;
}

export default function BanScreen({ ban, username, onAppealSubmitted }: BanScreenProps) {
  const [appealMessage, setAppealMessage] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAppeal = async () => {
    if (!appealMessage.trim()) {
      alert('Please enter a reason for your appeal.');
      return;
    }

    setSubmitting(true);
    try {
      await createBanAppeal(username, ban, appealMessage.trim());
      setAppealSubmitted(true);
      onAppealSubmitted();
      alert('Your appeal has been submitted. An administrator will review it.');
    } catch (error) {
      console.error('Error submitting appeal:', error);
      alert('Error submitting appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--panel)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        border: '2px solid #ff4d4d',
        boxShadow: '0 20px 60px rgba(255, 77, 77, 0.3)',
        textAlign: 'center'
      }}>
        {/* Ban Icon/Image */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 20px rgba(255, 77, 77, 0.5))'
        }}>
          🚫
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#ff4d4d',
          marginBottom: '16px',
          textShadow: '0 0 20px rgba(255, 77, 77, 0.5)'
        }}>
          Account Banned
        </h1>

        <div style={{
          fontSize: '18px',
          color: 'var(--text)',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Your account <strong style={{ color: '#ff4d4d' }}>{username}</strong> has been banned.
        </div>

        <div style={{
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '8px' }}>
            <strong>Ban Reason:</strong>
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text)' }}>
            {ban.reason}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>
            Banned by: {ban.bannedBy}
            <br />
            Date: {new Date(ban.timestamp).toLocaleString()}
            <br />
            Type: {ban.permanent ? 'Permanent Ban' : `Temporary Ban (expires ${ban.expiresAt ? new Date(ban.expiresAt).toLocaleString() : 'N/A'})`}
          </div>
        </div>

        {!appealSubmitted ? (
          <div>
            <div style={{
              fontSize: '16px',
              color: 'var(--text)',
              marginBottom: '16px',
              fontWeight: 600
            }}>
              Submit an Appeal
            </div>
            <textarea
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="Explain why you believe this ban was issued in error..."
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--panel-soft)',
                color: 'var(--text)',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '16px',
                fontFamily: 'inherit'
              }}
            />
            <button
              className="btn"
              onClick={handleAppeal}
              disabled={submitting || !appealMessage.trim()}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'var(--accent)',
                opacity: (submitting || !appealMessage.trim()) ? 0.5 : 1,
                cursor: (submitting || !appealMessage.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </div>
        ) : (
          <div style={{
            padding: '20px',
            background: 'rgba(46, 204, 113, 0.1)',
            borderRadius: '8px',
            border: '1px solid #2ecc71',
            color: '#2ecc71',
            fontSize: '16px',
            fontWeight: 600
          }}>
            ✓ Appeal submitted successfully! An administrator will review your appeal.
          </div>
        )}

        <div style={{
          marginTop: '24px',
          fontSize: '12px',
          color: 'var(--text-dim)',
          lineHeight: '1.6'
        }}>
          If you believe this ban was issued in error, you can submit an appeal above.
          <br />
          Appeals are reviewed by administrators and may take time to process.
        </div>
      </div>
    </div>
  );
}
