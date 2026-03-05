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
  const [thread, setThread] = useState<BanAppeal | null>(null);
  const [messages, setMessages] = useState<AppealMessage[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const deviceId = username.toLowerCase() === 'this device' ? (typeof getDeviceFingerprint === 'function' ? getDeviceFingerprint()?.deviceId : undefined) : undefined;
  const canSend = !thread || thread.status === 'pending';

  useEffect(() => {
    let cancelled = false;
    setMessagesLoaded(false);
    getMyAppeal(username, deviceId).then((a) => {
      if (!cancelled) {
        setThread(a || null);
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

  const loadMessages = (threadId: string) => {
    setMessagesLoaded(false);
    getAppealMessages(threadId, username, deviceId).then((msgs) => {
      setMessages(msgs);
      setMessagesLoaded(true);
    });
  };

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      if (!thread) {
        await createBanAppeal(username, ban, trimmed, deviceId);
        const a = await getMyAppeal(username, deviceId);
        if (a) {
          setThread(a);
          loadMessages(a.id);
        }
      } else if (canSend) {
        const updated = await sendAppealMessage(thread.id, username, trimmed);
        setMessages(updated);
      }
      setInput('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(err?.message || 'Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => sendMessage(input);

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
            Message moderators. This conversation is visible to moderators. The assistant can answer questions about your ban.
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
            {!thread ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px', fontSize: '14px' }}>
                Send a message below to contact moderators. An assistant will reply and moderators can see the conversation.
              </div>
            ) : !messagesLoaded ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px', fontSize: '14px' }}>
                Loading…
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px', fontSize: '14px' }}>
                No messages yet. Send one below.
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
                    {msg.fromUsername === username ? 'You' : msg.fromUsername === 'appeal_bot' ? 'Assistant' : msg.fromUsername} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {canSend && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={thread ? "Ask about your ban or send a message…" : "Send a message to moderators…"}
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
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  padding: '10px 20px',
                  opacity: (sending || !input.trim()) ? 0.5 : 1,
                  cursor: (sending || !input.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          )}

          {thread && thread.status !== 'pending' && (
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '8px' }}>
              Moderators have closed this conversation. You can no longer send messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
