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
  thumbnail?: string; // gameplay image path, e.g. /images/games/gym-pump.png
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
    thumbnail: '/images/games/gym-pump.svg',
    category: 'Action',
    component: GymPumpEngine,
  },
  {
    id: 'hypnosia',
    name: 'Hypnosia',
    description: 'Test your deduction skills in this mysterious game!',
    icon: '🔮',
    thumbnail: '/images/games/hypnosia.svg',
    category: 'Puzzle',
    component: Hypnosia,
  },
  {
    id: 'underwaterOdyssey',
    name: 'Underwater Odyssey',
    description: 'Explore the depths of the ocean in this adventure series!',
    icon: '🌊',
    thumbnail: '/images/games/underwater-odyssey.svg',
    category: 'Adventure',
    component: UnderwaterOddyseySeries,
  },
  {
    id: 'superShowdown2',
    name: 'Super Showdown 2',
    description: 'Epic arena battles with powerful abilities!',
    icon: '⚔️',
    thumbnail: '/images/games/super-showdown-2.svg',
    category: 'Action',
    component: SuperShowdown2,
  },
  {
    id: 'superShowdown',
    name: 'Super Showdown',
    description: 'Original arena combat experience!',
    icon: '🎯',
    thumbnail: '/images/games/super-showdown.svg',
    category: 'Action',
    component: SuperShowdown,
  },
  {
    id: 'redRover',
    name: 'Red Rover',
    description: 'Classic team-based multiplayer game!',
    icon: '🏃',
    thumbnail: '/images/games/red-rover.svg',
    category: 'Multiplayer',
    component: RedRover,
  },
  {
    id: 'jungleJourney',
    name: 'Jungle Journey',
    description: 'Navigate through the jungle and collect fruits!',
    icon: '🌴',
    thumbnail: '/images/games/jungle-journey.svg',
    category: 'Adventure',
    component: JungleJourneySeries,
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Classic chess game - challenge yourself or play online!',
    icon: '♟️',
    thumbnail: '/images/games/chess.svg',
    category: 'Strategy',
    component: Chess,
  },
  {
    id: 'floorIsLava',
    name: 'Floor Is Lava',
    description: 'Jump from platform to platform - don\'t touch the lava!',
    icon: '🌋',
    thumbnail: '/images/games/floor-is-lava.svg',
    category: 'Platformer',
    component: FloorIsLava,
  },
  {
    id: 'insaneShowdown',
    name: 'Insane Showdown',
    description: 'Ultimate combined arena battle experience!',
    icon: '🔥',
    thumbnail: '/images/games/insane-showdown.svg',
    category: 'Action',
    component: SuperShowdownCombined,
  },
];

export default function GamesTab({ user, editMode }: GamesTabProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:118',message:'GamesTab render start',data:{selectedGame:null,selectedUserGame:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:120',message:'After useState selectedGame',data:{selectedGame},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const [selectedUserGame, setSelectedUserGame] = useState<UserMadeGame | null>(null);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:121',message:'After useState selectedUserGame',data:{selectedUserGame},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const [userMadeGames, setUserMadeGames] = useState<UserMadeGame[]>([]);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:122',message:'After useState userMadeGames',data:{userMadeGamesCount:userMadeGames.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:123',message:'useEffect called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:139',message:'Before early returns check',data:{selectedGame,selectedUserGame,hasGameComponent:!!GameComponent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (selectedUserGame) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:142',message:'Early return selectedUserGame',data:{selectedUserGame:selectedUserGame.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return (
      <div>
        <UserMadeGamePlayer game={selectedUserGame} user={user} onClose={() => setSelectedUserGame(null)} />
      </div>
    );
  }

  if (selectedGame && GameComponent) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GamesTab.tsx:150',message:'Early return selectedGame',data:{selectedGame},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const handleClose = () => {
      setSelectedGame(null);
      setSelectedUserGame(null);
    };
    
    // Components that support onClose prop
    const supportsOnClose = ['gymPump', 'hypnosia'].includes(selectedGame);
    
    // Prepare props based on game type - pass user to games that need it
    const gameProps = selectedGame === 'gymPump' 
      ? { user, onClose: handleClose }
      : selectedGame === 'hypnosia'
      ? { onClose: handleClose }
      : ['superShowdown', 'superShowdown2', 'insaneShowdown'].includes(selectedGame)
      ? { user }
      : {};
    
    return (
      <div key={selectedGame} style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
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
        <GameComponent key={selectedGame} {...gameProps} />
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
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px',
              background: 'var(--panel-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {game.thumbnail ? (
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    (el.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                  }}
                />
              ) : null}
              <span
                style={{
                  fontSize: '48px',
                  lineHeight: 1,
                  display: game.thumbnail ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-hidden
              >
                {game.icon}
              </span>
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
