'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
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

interface PlayTabProps {
  user: User;
  editMode: boolean;
}

interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  component: React.ComponentType<any>;
}

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

export default function PlayTab({ user, editMode }: PlayTabProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedGameInfo = games.find(g => g.id === selectedGame);
  const GameComponent = selectedGameInfo?.component;

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:120',message:'PlayTab render',data:{selectedGame,hasGameComponent:!!GameComponent,isLoading,loadError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [selectedGame, GameComponent, isLoading, loadError]);
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:123',message:'selectedGame changed',data:{selectedGame,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Reset loading state when game changes
    if (selectedGame) {
      setIsLoading(true);
      setLoadError(null);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:127',message:'Setting isLoading to true',data:{selectedGame},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:132',message:'Timeout fired',data:{selectedGame},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setIsLoading((currentLoading) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:135',message:'Checking isLoading in timeout',data:{currentLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          if (currentLoading) {
            setLoadError('Game is taking longer than expected to load. Please try again.');
            return false;
          }
          return currentLoading;
        });
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setIsLoading(false);
      setLoadError(null);
    }
  }, [selectedGame]);

  // Handle game component mount
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:150',message:'GameComponent mount effect',data:{hasGameComponent:!!GameComponent,selectedGame,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (GameComponent && selectedGame) {
      // Give component a moment to render
      const timer = setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:155',message:'Setting isLoading to false after 500ms',data:{selectedGame},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [GameComponent, selectedGame]);

  if (selectedGame && GameComponent) {
    const handleClose = () => {
      setSelectedGame(null);
      setIsLoading(false);
      setLoadError(null);
    };
    
    const supportsOnClose = ['gymPump', 'hypnosia'].includes(selectedGame);
    
    // #region agent log
    useEffect(() => {
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlayTab.tsx:170',message:'Rendering game container',data:{selectedGame,isLoading,hasGameComponent:!!GameComponent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    }, [selectedGame, isLoading, GameComponent]);
    // #endregion
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: '100%', background: 'var(--bg-main)' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #00aaff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ color: '#ffffff', fontSize: '16px' }}>Loading game...</div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        {loadError && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ff4d4d',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            {loadError}
            <button
              onClick={() => {
                setLoadError(null);
                setIsLoading(false);
              }}
              style={{
                marginLeft: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        {!supportsOnClose && (
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 999,
              padding: '8px 16px',
              background: '#00aaff',
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
            onClick={() => {
              setSelectedGame(game.id);
              setIsLoading(true);
              setLoadError(null);
            }}
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
    </>
  );
}
