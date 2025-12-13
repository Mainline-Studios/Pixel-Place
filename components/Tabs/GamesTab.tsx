'use client';

import { useState, useEffect } from 'react';
import { User, UserMadeGame } from '@/types';
import { getUserMadeGames, deleteUserMadeGame } from '@/lib/storage';
import UserMadeGamePlayer from '../Games/UserMadeGamePlayer';
import SnakeGame from '../Games/SnakeGame';
import TicTacToe from '../Games/TicTacToe';
import MemoryGame from '../Games/MemoryGame';
import AvatarRunner3D from '../Games/AvatarRunner3D';
import AvatarCollector3D from '../Games/AvatarCollector3D';
import TagGame from '../Games/TagGame';
import AIExperimentTest from '../Games/AIExperimentTest';

import { toast } from '@/lib/toast';
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
  is3D?: boolean;
  component: React.ComponentType<{ user?: User; onClose?: () => void }>;
}

const games: GameInfo[] = [
  {
    id: 'avatarRunner',
    name: '3D Avatar Runner',
    description: 'Run with your avatar! Collect coins and avoid obstacles',
    icon: '🏃',
    category: '3D Action',
    is3D: true,
    component: AvatarRunner3D,
  },
  {
    id: 'avatarCollector',
    name: '3D Avatar Collector',
    description: 'Control your avatar to collect gems in a 3D world',
    icon: '💎',
    category: '3D Adventure',
    is3D: true,
    component: AvatarCollector3D,
  },
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
  {
    id: 'tag',
    name: 'Tag Game',
    description: 'Play tag with friends or CPU! Wait in lobby for 3+ players',
    icon: '🏃',
    category: 'Action',
    component: TagGame,
  },
  {
    id: 'aiExperiment',
    name: 'AI Experiment Test',
    description: 'Text-to-speech experiment - type and hear your words',
    icon: '🤖',
    category: 'Experiment',
    component: AIExperimentTest,
  },
];

export default function GamesTab({ user, editMode }: GamesTabProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedUserGame, setSelectedUserGame] = useState<UserMadeGame | null>(null);
  const [userMadeGames, setUserMadeGames] = useState<UserMadeGame[]>([]);

  useEffect(() => {
    const loadGames = async () => {
      const games = await getUserMadeGames();
      setUserMadeGames(games);
    };
    loadGames();
  }, []);

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    if (!confirm(`Delete game "${gameTitle}"? This action cannot be undone.`)) return;
    await deleteUserMadeGame(gameId);
    const games = await getUserMadeGames();
    setUserMadeGames(games);
    toast.info('Game "${gameTitle}" has been deleted.');
  };

  const selectedGameInfo = games.find(g => g.id === selectedGame);
  const GameComponent = selectedGameInfo?.component;

  if (selectedUserGame) {
    return (
      <div>
        <UserMadeGamePlayer game={selectedUserGame} user={user} onClose={() => setSelectedUserGame(null)} />
      </div>
    );
  }

  if (selectedGame && GameComponent) {
    return (
      <div>
        {selectedGameInfo?.is3D ? (
          <GameComponent user={user} onClose={() => setSelectedGame(null)} />
        ) : (
          <GameComponent onClose={() => setSelectedGame(null)} />
        )}
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
          <strong>3D Avatar Runner:</strong> Use A/D or Arrow Keys to move left/right. Collect gold coins and avoid red obstacles! Your purchased avatar appears in the game.
          <br />
          <strong>3D Avatar Collector:</strong> Use W/A/S/D or Arrow Keys to move. Collect colorful gems with your avatar in a 3D world!
          <br />
          <strong>Snake:</strong> Use arrow keys to move, space to pause. Eat the red food to grow and score points!
          <br />
          <strong>Tic-Tac-Toe:</strong> Take turns placing X and O. Get three in a row to win!
          <br />
          <strong>Memory Game:</strong> Click cards to flip them. Match pairs of emojis to win!
          <br />
          <strong>Tag Game:</strong> Wait in lobby for 3+ players or play with CPU. Use W/A/S/D to move and avoid the player marked "IT"!
        </div>
      </div>

      {userMadeGames.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '40px' }}>🎨 User-Made Games</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {userMadeGames.map((game) => (
              <div
                key={game.id}
                className="game-card-enhanced"
                onClick={() => setSelectedUserGame(game)}
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
                  🎮
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  {game.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#8b90a8',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  User-Made
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}>
                  {game.desc}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#8b90a8',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  By: {game.owner}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setSelectedUserGame(game); }}>
                    Play Now
                  </button>
                  {user.role === 'admin' && (
                    <button 
                      className="btn" 
                      style={{ 
                        background: '#ff4d4d', 
                        borderColor: '#ff4d4d',
                        padding: '10px 16px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGame(game.id, game.title);
                      }}
                      title="Delete game"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}


