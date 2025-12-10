'use client';

import { useState } from 'react';
import { User } from '@/types';
import SnakeGame from '../Games/SnakeGame';
import TicTacToe from '../Games/TicTacToe';
import MemoryGame from '../Games/MemoryGame';

interface GamesTabProps {
  user: User;
  editMode: boolean;
}

interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  component: React.ComponentType<{ onClose?: () => void }>;
}

const games: GameInfo[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game - eat food and grow!',
    icon: '🐍',
    category: 'Arcade',
    component: SnakeGame,
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    description: 'Play the classic X and O game',
    icon: '⭕',
    category: 'Strategy',
    component: TicTacToe,
  },
  {
    id: 'memory',
    name: 'Memory Game',
    description: 'Match pairs of emojis to test your memory',
    icon: '🧠',
    category: 'Puzzle',
    component: MemoryGame,
  },
];

export default function GamesTab({ user, editMode }: GamesTabProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const selectedGameInfo = games.find(g => g.id === selectedGame);
  const GameComponent = selectedGameInfo?.component;

  if (selectedGame && GameComponent) {
    return (
      <div>
        <GameComponent onClose={() => setSelectedGame(null)} />
      </div>
    );
  }

  return (
    <>
      <h2 className="section-title">🎮 Play Games</h2>
      
      <div className="ai-box">
        <div className="ai-label">Available Games</div>
        <div className="ai-output">
          Choose a game to play! All games are playable directly in your browser.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card-enhanced"
            onClick={() => setSelectedGame(game.id)}
            style={{
              background: 'linear-gradient(135deg, var(--panel) 0%, var(--panel-soft) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            <div style={{
              fontSize: '48px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              {game.icon}
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              {game.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#8b90a8',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              {game.category}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-dim)',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {game.description}
            </div>
            <button className="btn" style={{ width: '100%' }}>
              Play Now
            </button>
          </div>
        ))}
      </div>

      <div className="ai-box" style={{ marginTop: '24px' }}>
        <div className="ai-label">Game Instructions</div>
        <div className="ai-output" style={{ fontSize: '13px', lineHeight: '1.8' }}>
          <strong>Snake:</strong> Use arrow keys to move, space to pause. Eat the red food to grow and score points!
          <br />
          <strong>Tic-Tac-Toe:</strong> Take turns placing X and O. Get three in a row to win!
          <br />
          <strong>Memory Game:</strong> Click cards to flip them. Match pairs of emojis to win!
        </div>
      </div>
    </>
  );
}

