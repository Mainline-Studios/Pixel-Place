'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import { filterForDisplay } from '@/lib/pyx';


interface FullScreenGameWrapperProps {
  children: ReactNode;
  gameTitle?: string;
  onExit: () => void;
}

export default function FullScreenGameWrapper({ 
  children, 
  gameTitle = 'Game',
  onExit 
}: FullScreenGameWrapperProps) {
  const { user } = useUser();
  const [showOptions, setShowOptions] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ username: string; message: string; timestamp: number }>>([]);
  const [chatInput, setChatInput] = useState('');

  // Handle ESC key to toggle options
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowOptions(!showOptions);
        setShowChat(false);
        setShowLearn(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOptions]);

  // Prevent body scroll when in fullscreen
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return;
    const raw = chatInput.trim();
    setChatInput('');
    const filtered = await filterForDisplay(raw);
    setChatMessages(prev => [...prev, {
      username: user.username,
      message: filtered,
      timestamp: Date.now()
    }]);
  };

  const handleInviteFriends = () => {
    // Copy game link to clipboard
    const gameUrl = window.location.href;
    navigator.clipboard.writeText(gameUrl).then(() => {
      alert('Game link copied to clipboard! Share it with your friends.');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = gameUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Game link copied to clipboard! Share it with your friends.');
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Options Button - Small button at top */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10001,
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
      >
        <span>⚙️</span>
        <span>Options</span>
      </button>

      {/* Options Menu */}
      {showOptions && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '12px',
            zIndex: 10002,
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '200px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setShowChat(!showChat);
              setShowLearn(false);
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              marginBottom: '8px',
              background: showChat ? 'rgba(0, 162, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!showChat) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showChat) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <span>💬</span>
            <span>Chat Panel</span>
          </button>

          <button
            onClick={handleInviteFriends}
            style={{
              width: '100%',
              padding: '10px 16px',
              marginBottom: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <span>👥</span>
            <span>Invite Friends</span>
          </button>

          <button
            onClick={() => {
              setShowLearn(!showLearn);
              setShowChat(false);
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              marginBottom: '8px',
              background: showLearn ? 'rgba(0, 162, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!showLearn) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showLearn) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <span>📚</span>
            <span>Learn</span>
          </button>

          <button
            onClick={onExit}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'rgba(255, 68, 68, 0.2)',
              color: '#ff4444',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)';
            }}
          >
            <span>🚪</span>
            <span>Exit Game</span>
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '350px',
            maxHeight: '400px',
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            zIndex: 10003,
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              minHeight: '200px',
              maxHeight: '300px'
            }}
          >
            {chatMessages.length === 0 ? (
              <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                No messages yet. Start chatting!
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '12px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#00a2ff', fontSize: '13px', fontWeight: '600' }}>
                      {msg.username || ''}
                    </span>
                    <span style={{ color: '#666', fontSize: '11px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: '#fff', fontSize: '14px' }}>{msg.message}</div>
                </div>
              ))
            )}
          </div>
          <div
            style={{
              padding: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: '8px 16px',
                background: '#00a2ff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Learn Panel */}
      {showLearn && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '80%',
            background: 'rgba(26, 26, 26, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            zIndex: 10004,
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '600' }}>
              Learn About {gameTitle}
            </h2>
            <button
              onClick={() => setShowLearn(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              color: '#fff'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#00a2ff', fontSize: '18px', marginBottom: '12px' }}>
                How to Play
              </h3>
              <div style={{ lineHeight: '1.8', fontSize: '14px', color: '#ccc' }}>
                <p>
                  Welcome to {gameTitle}! This game is part of the Pixel Place platform, where creativity meets gaming.
                </p>
                <p style={{ marginTop: '12px' }}>
                  Use your mouse and keyboard to interact with the game. Each game has unique controls and objectives.
                  Explore, experiment, and have fun!
                </p>
                <p style={{ marginTop: '12px' }}>
                  <strong>Tips:</strong>
                </p>
                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                  <li>Read any on-screen instructions carefully</li>
                  <li>Try different strategies to find what works best</li>
                  <li>Don't be afraid to experiment!</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ color: '#00a2ff', fontSize: '18px', marginBottom: '12px' }}>
                Why Pixel Place Was Made
              </h3>
              <div style={{ lineHeight: '1.8', fontSize: '14px', color: '#ccc' }}>
                <p>
                  Pixel Place was created to bring together a community of creators and players in a fun, safe, and
                  creative environment. Our mission is to:
                </p>
                <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
                  <li>
                    <strong>Empower Creativity:</strong> Give everyone the tools to create amazing games and experiences
                  </li>
                  <li>
                    <strong>Build Community:</strong> Connect players and creators from around the world
                  </li>
                  <li>
                    <strong>Foster Learning:</strong> Provide a platform where you can learn game development, coding,
                    and design
                  </li>
                  <li>
                    <strong>Ensure Safety:</strong> Create a safe space for players of all ages with proper moderation
                    and safety features
                  </li>
                  <li>
                    <strong>Inspire Innovation:</strong> Encourage experimentation and new ideas in game development
                  </li>
                </ul>
                <p style={{ marginTop: '16px' }}>
                  Whether you're here to play, create, or both, we hope you enjoy your time on Pixel Place!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Content - Fullscreen */}
      <div
        className="game-cursor-zone"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          zIndex: 1
        }}
      >
        {children}
      </div>

      {/* Overlay to close options when clicking outside */}
      {showOptions && (
        <div
          onClick={() => setShowOptions(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10001,
            background: 'transparent'
          }}
        />
      )}
    </div>
  );
}
