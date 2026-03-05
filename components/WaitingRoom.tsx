'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import FilteredText, { FilteredUsername } from './FilteredText';

interface WaitingRoomProps {
  gameTitle: string;
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: number;
  players: string[];
  onStartGame: () => void;
  onLeave: () => void;
  waitingRoomPresets: string[];
  gameChatPresets: string[];
  socket: any;
  roomId: string;
  username: string;
}

export default function WaitingRoom({
  gameTitle,
  minPlayers,
  maxPlayers,
  currentPlayers,
  players,
  onStartGame,
  onLeave,
  waitingRoomPresets,
  gameChatPresets,
  socket,
  roomId,
  username,
}: WaitingRoomProps) {
  const [messages, setMessages] = useState<Array<{ username: string; message: string; timestamp: number }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data: { username: string; message: string }) => {
      setMessages(prev => [...prev, { ...data, timestamp: Date.now() }]);
    };

    const handleGameStart = () => {
      setIsGameStarted(true);
      setTimeout(() => {
        onStartGame();
      }, 1000);
    };

    const handlePlayerJoined = (data: { username: string }) => {
      setMessages(prev => [...prev, {
        username: 'System',
        message: `${data.username} joined the waiting room`,
        timestamp: Date.now()
      }]);
    };

    const handlePlayerLeft = (data: { username: string }) => {
      setMessages(prev => [...prev, {
        username: 'System',
        message: `${data.username} left the waiting room`,
        timestamp: Date.now()
      }]);
    };

    socket.on('waiting-room-chat', handleChatMessage);
    socket.on('game-start', handleGameStart);
    socket.on('player-joined-waiting', handlePlayerJoined);
    socket.on('player-left-waiting', handlePlayerLeft);

    return () => {
      socket.off('waiting-room-chat', handleChatMessage);
      socket.off('game-start', handleGameStart);
      socket.off('player-joined-waiting', handlePlayerJoined);
      socket.off('player-left-waiting', handlePlayerLeft);
    };
  }, [socket, onStartGame]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (message?: string) => {
    const msg = message || inputMessage.trim();
    if (!msg || !socket) return;

    socket.emit('waiting-room-chat', {
      roomId,
      username,
      message: msg,
    });

    if (!message) {
      setInputMessage('');
    }
  };

  const sendPreset = (preset: string) => {
    sendMessage(preset);
  };

  const canStart = currentPlayers >= minPlayers && currentPlayers <= maxPlayers;

  if (isGameStarted) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '24px',
        zIndex: 10000
      }}>
        Game Starting...
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Waiting Room: {gameTitle}</h2>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#999' }}>
            Players: {currentPlayers}/{maxPlayers} (Need {minPlayers}+ to start)
          </div>
        </div>
        <button
          onClick={onLeave}
          style={{
            padding: '10px 20px',
            background: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Leave
        </button>
      </div>

      {/* Players List */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        background: '#1a1a1a'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Players ({currentPlayers})</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {players.map((player, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 12px',
                background: '#2a2a2a',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {player}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '20px',
          padding: '10px',
          background: '#1a1a1a',
          borderRadius: '8px'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: '#888', marginRight: '8px' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              <span style={{ fontWeight: 'bold', color: msg.username === 'System' ? '#4CAF50' : '#4A9EFF' }}>
                <FilteredUsername username={msg.username || ''} currentUsername={username} />:
              </span>
              <span style={{ marginLeft: '8px' }}><FilteredText text={msg.message || ''} /></span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Messages */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Quick Messages:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {waitingRoomPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => sendPreset(preset)}
                style={{
                  padding: '6px 12px',
                  background: '#2a2a2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '10px',
              background: '#2a2a2a',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => sendMessage()}
            style={{
              padding: '10px 20px',
              background: '#4A9EFF',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Start Button */}
      {canStart && (
        <div style={{
          padding: '20px',
          borderTop: '1px solid #333',
          textAlign: 'center'
        }}>
          <button
            onClick={() => {
              if (socket) {
                socket.emit('start-game', { roomId });
              }
            }}
            style={{
              padding: '12px 40px',
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}
