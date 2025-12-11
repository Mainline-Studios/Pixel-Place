'use client';

import { useState, useEffect, useRef } from 'react';
import { Ban } from '@/types';
import { createBanAppeal, getMessages, sendMessage } from '@/lib/storage';

interface BanScreenProps {
  ban: Ban;
  username: string;
  onAppealSubmitted: () => void;
}

export default function BanScreen({ ban, username, onAppealSubmitted }: BanScreenProps) {
  const [appealMessage, setAppealMessage] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const messages = await getMessages(username, ban.bannedBy);
    setChatMessages(messages);
  };

  useEffect(() => {
    if (showChat) {
      loadMessages();
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [showChat, username, ban.bannedBy]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await sendMessage(username, ban.bannedBy, newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

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

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <button
            className="btn"
            onClick={() => setShowChat(!showChat)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              background: showChat ? 'var(--accent)' : 'var(--panel-soft)',
              marginBottom: showChat ? '16px' : '0'
            }}
          >
            {showChat ? 'Hide Chat' : '💬 Chat with Administrator'}
          </button>

          {showChat && (
            <div style={{
              marginTop: '16px',
              background: 'var(--panel-soft)',
              borderRadius: '8px',
              padding: '16px',
              maxHeight: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '12px',
                color: 'var(--text)'
              }}>
                Chat with {ban.bannedBy}
              </div>
              
              <div style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '12px',
                minHeight: '200px',
                maxHeight: '300px',
                padding: '8px',
                background: 'var(--panel)',
                borderRadius: '4px'
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: '12px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: msg.fromUsername === username ? 'rgba(46, 204, 113, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                        textAlign: msg.fromUsername === username ? 'right' : 'left',
                        alignSelf: msg.fromUsername === username ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                      }}
                    >
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        {msg.fromUsername === username ? 'You' : ban.bannedBy} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text)' }}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: '10px',
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
                  disabled={sendingMessage || !newMessage.trim()}
                  style={{
                    padding: '10px 20px',
                    opacity: (sendingMessage || !newMessage.trim()) ? 0.5 : 1,
                    cursor: (sendingMessage || !newMessage.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
