'use client';

import { useState, useEffect, useRef } from 'react';
import { Ban } from '@/types';
import { createBanAppeal, getMyAppeal, getAppealMessages, sendAppealMessage } from '@/lib/storage';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import type { BanAppeal, AppealMessage } from '@/types';

interface BanScreenProps {
  ban: Ban;
  username: string;
  onAppealSubmitted: () => void;
}

export default function BanScreen({ ban, username, onAppealSubmitted }: BanScreenProps) {
  const [appeal, setAppeal] = useState<BanAppeal | null>(null);
  const [appealMessage, setAppealMessage] = useState('');
  const [messages, setMessages] = useState<AppealMessage[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [threadInput, setThreadInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const deviceId = username.toLowerCase() === 'this device' ? (typeof getDeviceFingerprint === 'function' ? getDeviceFingerprint()?.deviceId : undefined) : undefined;

  useEffect(() => {
    let cancelled = false;
    setMessagesLoaded(false);
    getMyAppeal(username, deviceId).then((a) => {
      if (!cancelled) {
        setAppeal(a || null);
        if (a) {
          getAppealMessages(a.id, username, deviceId).then((msgs) => {
            if (!cancelled) {
              setMessages(msgs);
              setMessagesLoaded(true);
            }
          });
        } else {
          setMessagesLoaded(true);
        }
      }
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [username, deviceId]);

  const loadMessages = (appealId: string) => {
    setMessagesLoaded(false);
    getAppealMessages(appealId, username, deviceId).then((msgs) => {
      setMessages(msgs);
      setMessagesLoaded(true);
    });
  };

  useEffect(() => {
    if (appeal && messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appeal, messages]);

  const handleStartAppeal = async () => {
    if (!appealMessage.trim()) {
      alert('Please enter a reason for your appeal.');
      return;
    }
    setSubmitting(true);
    try {
      await createBanAppeal(username, ban, appealMessage.trim(), deviceId);
      onAppealSubmitted();
      const a = await getMyAppeal(username, deviceId);
      if (a) {
        setAppeal(a);
        loadMessages(a.id);
      }
      setAppealMessage('');
    } catch (error) {
      console.error('Error submitting appeal:', error);
      alert('Error submitting appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!threadInput.trim() || !appeal) return;
    setSendingMessage(true);
    try {
      const updated = await sendAppealMessage(appeal.id, username, threadInput.trim());
      setThreadInput('');
      setMessages(updated);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error?.message || 'Failed to send. Try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
        <div style={{ color: 'var(--text)', fontSize: '18px' }}>Loading…</div>
      </div>
    );
  }

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
        padding: '24px',
        maxWidth: '520px',
        width: '100%',
        border: '2px solid #ff4d4d',
        boxShadow: '0 20px 60px rgba(255, 77, 77, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚫</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ff4d4d', marginBottom: '8px' }}>Account Banned</h1>
          <div style={{ fontSize: '14px', color: 'var(--text)' }}>
            Your account <strong style={{ color: '#ff4d4d' }}>{username}</strong> has been banned.
          </div>
        </div>

        <div style={{
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--text-dim)'
        }}>
          <strong>Ban reason:</strong> {ban.reason}
          <br />
          Banned by: {ban.bannedBy} • {new Date(ban.timestamp).toLocaleString()}
        </div>

        {!appeal ? (
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text)' }}>
              Submit an appeal
            </div>
            <textarea
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="Explain why you believe this ban was issued in error. You can then chat with the appeal assistant."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '12px',
                fontFamily: 'inherit'
              }}
            />
            <button
              className="btn"
              onClick={handleStartAppeal}
              disabled={submitting || !appealMessage.trim()}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 600,
                background: 'var(--accent)',
                opacity: (submitting || !appealMessage.trim()) ? 0.5 : 1,
                cursor: (submitting || !appealMessage.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting…' : 'Submit appeal & chat with assistant'}
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-dim)',
              marginBottom: '8px',
              padding: '6px 10px',
              background: 'rgba(255, 193, 7, 0.15)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
              This conversation is visible to administrators. The assistant can only discuss your ban and the appeal process.
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: '200px',
              maxHeight: '320px',
              padding: '8px',
              background: 'var(--panel-soft)',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              {!messagesLoaded ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px', fontSize: '14px' }}>
                  Loading conversation…
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px', fontSize: '14px' }}>
                  No messages in this thread.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: msg.fromUsername === username ? 'rgba(46, 204, 113, 0.2)' : msg.fromUsername === 'appeal_bot' ? 'rgba(100, 149, 237, 0.15)' : 'rgba(100, 100, 100, 0.2)',
                      textAlign: msg.fromUsername === username ? 'right' : 'left',
                      marginLeft: msg.fromUsername === username ? '20%' : 0,
                      marginRight: msg.fromUsername === username ? 0 : '20%'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      {msg.fromUsername === username ? 'You' : msg.fromUsername === 'appeal_bot' ? 'Appeal assistant' : msg.fromUsername} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {appeal.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={threadInput}
                  onChange={(e) => setThreadInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about your ban or appeal…"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    fontSize: '14px'
                  }}
                />
                <button
                  className="btn"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !threadInput.trim()}
                  style={{
                    padding: '10px 20px',
                    opacity: (sendingMessage || !threadInput.trim()) ? 0.5 : 1,
                    cursor: (sendingMessage || !threadInput.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sendingMessage ? 'Sending…' : 'Send'}
                </button>
              </div>
            )}
            {appeal.status !== 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>
                  This appeal has been {appeal.status}. You can no longer send messages.
                </div>
                {appeal.status === 'approved' && (
                  <div style={{ fontSize: '14px', color: 'var(--text)', textAlign: 'center' }}>
                    Refresh the page to continue.
                    <br />
                    <button
                      type="button"
                      className="btn"
                      onClick={() => window.location.reload()}
                      style={{ marginTop: '8px', padding: '10px 20px', fontWeight: 600 }}
                    >
                      Refresh page
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
