'use client';

import { useState, useEffect } from 'react';
import { User, UserMadeGame } from '@/types';
import { getUserMadeGames, deleteUserMadeGame } from '@/lib/storage';
import UserMadeGamePlayer from '../Games/UserMadeGamePlayer';
import GymPumpEngine from '../Games/GymPumpEngine';
import Hypnosia from '../Games/Hypnosia';
import UnderwaterOddyseySeries from '../Games/UnderwaterOddyseySeries';
import SuperShowdown2 from '../Games/SuperShowdown2';
import SuperShowdown from '../Games/SuperShowdown';
import RedRover from '../Games/RedRover';
import JungleJourneySeries from '../Games/JungleJourneySeries';
import Chess from '../Games/Chess';
import FloorIsLava from '../Games/FloorIsLava';
import SuperShowdownCombined from '../Games/InsaneShowdown';

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
  component: React.ComponentType<any>;
  props?: any;
}

// All available games
const games: GameInfo[] = [
  {
    id: 'gymPump',
    name: 'Gym Pump',
    description: 'Lift weights, build power, and climb the leaderboard!',
    icon: '💪',
    category: 'Action',
    component: GymPumpEngine,
  },
  {
    id: 'hypnosia',
    name: 'Hypnosia',
    description: 'Test your deduction skills in this mysterious game!',
    icon: '🔮',
    category: 'Puzzle',
    component: Hypnosia,
  },
  {
    id: 'underwaterOdyssey',
    name: 'Underwater Odyssey',
    description: 'Explore the depths of the ocean in this adventure series!',
    icon: '🌊',
    category: 'Adventure',
    component: UnderwaterOddyseySeries,
  },
  {
    id: 'superShowdown2',
    name: 'Super Showdown 2',
    description: 'Epic arena battles with powerful abilities!',
    icon: '⚔️',
    category: 'Action',
    component: SuperShowdown2,
  },
  {
    id: 'superShowdown',
    name: 'Super Showdown',
    description: 'Original arena combat experience!',
    icon: '🎯',
    category: 'Action',
    component: SuperShowdown,
  },
  {
    id: 'redRover',
    name: 'Red Rover',
    description: 'Classic team-based multiplayer game!',
    icon: '🏃',
    category: 'Multiplayer',
    component: RedRover,
  },
  {
    id: 'jungleJourney',
    name: 'Jungle Journey',
    description: 'Navigate through the jungle and collect fruits!',
    icon: '🌴',
    category: 'Adventure',
    component: JungleJourneySeries,
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Classic chess game - challenge yourself or play online!',
    icon: '♟️',
    category: 'Strategy',
    component: Chess,
  },
  {
    id: 'floorIsLava',
    name: 'Floor Is Lava',
    description: 'Jump from platform to platform - don\'t touch the lava!',
    icon: '🌋',
    category: 'Platformer',
    component: FloorIsLava,
  },
  {
    id: 'insaneShowdown',
    name: 'Insane Showdown',
    description: 'Ultimate combined arena battle experience!',
    icon: '🔥',
    category: 'Action',
    component: SuperShowdownCombined,
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
    alert(`Game "${gameTitle}" has been deleted.`);
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
    const handleClose = () => setSelectedGame(null);
    const gameInfo = games.find(g => g.id === selectedGame);
    
    // Components that support onClose prop
    const supportsOnClose = ['gymPump', 'hypnosia'].includes(selectedGame);
    
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
        {!supportsOnClose && (
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 1000,
              padding: '8px 16px',
              background: '#00a2ff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            ← Back
          </button>
        )}
        {selectedGame === 'gymPump' ? (
          <GameComponent user={user} onClose={handleClose} />
        ) : selectedGame === 'hypnosia' ? (
          <GameComponent onClose={handleClose} />
        ) : (
          <GameComponent />
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
          <strong>Gym Pump:</strong> Lift weights, build power, and climb the leaderboard! Use the game controls to play.
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
