'use client';

import { useState, useEffect } from 'react';
import { User, PublishedGame } from '@/types';
import { getSkins, getPublished, getUsers } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import GamePlayer from '@/components/GamePlayer';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import Hypnosia from '../Games/Hypnosia';
import UnderwaterOddyseySeries from '../Games/UnderwaterOddyseySeries';
import SuperShowdown2 from '../Games/SuperShowdown2';
import SuperShowdown from '../Games/SuperShowdown';
import RedRover from '../Games/RedRover';
import JungleJourneySeries from '../Games/JungleJourneySeries';
import Chess from '../Games/Chess';
import FloorIsLava from '../Games/FloorIsLava';
import SuperShowdownCombined from '../Games/InsaneShowdown';

interface HomeTabProps {
  user: User;
  editMode: boolean;
  onResetPublished?: () => void;
}

interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  component: React.ComponentType<any>;
}

const builtInGames: GameInfo[] = [
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

export default function HomeTab({ user, editMode, onResetPublished }: HomeTabProps) {
  const [selectedGame, setSelectedGame] = useState<PublishedGame | null>(null);
  const [selectedBuiltInGame, setSelectedBuiltInGame] = useState<string | null>(null);
  const [published, setPublished] = useState<PublishedGame[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [skins, setSkins] = useState(getSkins());
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Refresh data - non-blocking, load immediately
  useEffect(() => {
    const refreshData = async () => {
      try {
        // Load in parallel without blocking
        const [publishedData, usersData] = await Promise.all([
          getPublished().catch(() => []),
          getUsers().catch(() => [])
        ]);
        const skinsData = getSkins();

        setPublished(Array.isArray(publishedData) ? publishedData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setSkins(Array.isArray(skinsData) ? skinsData : []);
      } catch (error) {
        // Silent error - don't block UI
        setPublished([]);
        setUsers([]);
        setSkins([]);
      }
    };
    // Load immediately
    refreshData();
    // Refresh every 5 seconds (less frequent to reduce load)
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle built-in game loading
  useEffect(() => {
    if (selectedBuiltInGame) {
      setIsLoading(true);
      setLoadError(null);
      const timeout = setTimeout(() => {
        setIsLoading((currentLoading) => {
          if (currentLoading) {
            setLoadError('Game is taking longer than expected to load. Please try again.');
            return false;
          }
          return currentLoading;
        });
      }, 10000);
      return () => clearTimeout(timeout);
    } else {
      setIsLoading(false);
      setLoadError(null);
    }
  }, [selectedBuiltInGame]);

  // Handle game component mount
  useEffect(() => {
    if (selectedBuiltInGame) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedBuiltInGame]);

  // Include published games only
  const publishedArray = Array.isArray(published) ? published : [];
  const sortedGames = publishedArray.slice().sort((a, b) => b.ts - a.ts);

  // Get friends - show first 8
  const friends = (user.friends || []).slice(0, 8);
  const usersArray = Array.isArray(users) ? users : [];
  const friendUsers = usersArray
    .filter(u => u && u.username && friends.includes(u.username))
    .slice(0, 8);

  // Handle built-in game selection
  const selectedGameInfo = builtInGames.find(g => g.id === selectedBuiltInGame);
  const GameComponent = selectedGameInfo?.component;

  // If a built-in game is selected, render it
  if (selectedBuiltInGame && GameComponent) {
    const handleClose = () => {
      setSelectedBuiltInGame(null);
      setIsLoading(false);
      setLoadError(null);
    };
    
    const supportsOnClose = ['hypnosia'].includes(selectedBuiltInGame);
    
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
        {selectedBuiltInGame === 'hypnosia' ? (
          <GameComponent onClose={handleClose} />
        ) : (
          <GameComponent />
        )}
      </div>
    );
  }

  // If a published game is selected, render it
  if (selectedGame) {
    return <GamePlayer game={selectedGame} onClose={() => setSelectedGame(null)} />;
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100%'
    }}>
      {/* Large Home Title - Roblox Style */}
      <h1 style={{
        fontSize: '36px',
        fontWeight: 'bold',
        margin: '0 0 40px 0',
        color: '#ffffff',
        lineHeight: '1.2'
      }}>
        Home
      </h1>

      {/* Built-in Games Section */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#ffffff',
          margin: '0 0 16px 0'
        }}>
          🎮 Play Games
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {builtInGames.map((game) => (
            <div
              key={game.id}
              className="game-card-enhanced"
              onClick={() => {
                setSelectedBuiltInGame(game.id);
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
      </div>

      {/* Friends Section - Roblox Style */}
      {friendUsers.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0
            }}>
              Friends ({friendUsers.length})
            </h2>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: '#00a2ff',
                textDecoration: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              See All +
            </a>
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 #1a1a1a',
            WebkitOverflowScrolling: 'touch'
          }}>
            {friendUsers.map((friend) => {
              if (!friend || !friend.username) return null;
              const friendSkin = skins.find(s => s && s.id === friend.equippedSkin) || (skins.length > 0 ? skins[0] : null);
              if (!friendSkin) return null;

              return (
                <div
                  key={friend.username}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '70px',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    border: '2px solid #00a2ff',
                    overflow: 'hidden',
                    background: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Avatar3DViewer
                        skin={friendSkin}
                        width={70}
                        height={70}
                        interactive={false}
                        animation="idle"
                      />
                    </div>
                    {/* Online indicator - green dot */}
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#00ff00',
                      border: '2px solid #1a1a1a',
                      zIndex: 10
                    }} />
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#ffffff',
                    textAlign: 'center',
                    maxWidth: '70px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: '500'
                  }}>
                    {escapeHTML(friend.username)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Section - Roblox Style */}
      {sortedGames.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0
            }}>
              Continue
            </h2>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: '#00a2ff',
                textDecoration: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              See All +
            </a>
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 #1a1a1a',
            WebkitOverflowScrolling: 'touch'
          }}>
            {sortedGames.slice(0, 10).map((game) => {
              if (!game || !game.ts) return null;

              return (
                <div
                  key={game.ts}
                  style={{
                    minWidth: '160px',
                    width: '160px',
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: game.playable && game.gameCode ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    border: '1px solid #333',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (game.playable && game.gameCode) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    if (game.playable && game.gameCode) {
                      setSelectedGame(game);
                    }
                  }}
                >
                  {/* Game Thumbnail */}
                  <div style={{
                    width: '100%',
                    height: '120px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {game.thumbnail ? (
                      <img
                        src={game.thumbnail}
                        alt={game.title || 'Game'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          // Replace with fallback
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 700;">
                                ${(game.title || 'G').charAt(0).toUpperCase()}
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '28px',
                        fontWeight: 700
                      }}>
                        {(game.title || 'G').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <div style={{ padding: '8px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.3'
                    }}>
                      {escapeHTML(game.title || 'Untitled Game')}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      by {escapeHTML(game.owner || 'Unknown')}
                    </div>
                    {game.playable && game.gameCode && (
                      <button
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          background: '#00a2ff',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0090e6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#00a2ff';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGame(game);
                        }}
                      >
                        Play
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friend Activity Section - Roblox Style */}
      {sortedGames.length > 10 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0
            }}>
              Friend Activity
            </h2>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: '#00a2ff',
                textDecoration: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              See All +
            </a>
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 #1a1a1a',
            WebkitOverflowScrolling: 'touch'
          }}>
            {sortedGames.slice(10, 20).map((game) => {
              if (!game || !game.ts) return null;

              return (
                <div
                  key={game.ts}
                  style={{
                    minWidth: '160px',
                    width: '160px',
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: game.playable && game.gameCode ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    border: '1px solid #333',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (game.playable && game.gameCode) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    if (game.playable && game.gameCode) {
                      setSelectedGame(game);
                    }
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '120px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {game.thumbnail ? (
                      <img
                        src={game.thumbnail}
                        alt={game.title || 'Game'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 700;">
                                ${(game.title || 'G').charAt(0).toUpperCase()}
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '28px',
                        fontWeight: 700
                      }}>
                        {(game.title || 'G').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.3'
                    }}>
                      {escapeHTML(game.title || 'Untitled Game')}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      by {escapeHTML(game.owner || 'Unknown')}
                    </div>
                    {game.playable && game.gameCode && (
                      <button
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          background: '#00a2ff',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0090e6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#00a2ff';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGame(game);
                        }}
                      >
                        Play
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedGames.length === 0 && friendUsers.length === 0 && (
        <div style={{
          background: '#2a2a2a',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          color: '#999',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>No published games yet.</div>
          <div style={{ fontSize: '14px' }}>Create your first game in the Create tab!</div>
        </div>
      )}
    </div>
  );
}
