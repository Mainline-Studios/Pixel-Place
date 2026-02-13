'use client';

import { useState, useEffect } from 'react';
import { User, PublishedGame, Skin } from '@/types';
import { getSkins, getPublished, getUsers } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import GamePlayer from '@/components/GamePlayer';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { GYM_PUMP_PRELOADED_GAME } from '@/lib/preloadedGames';
import GymPumpEngine from '@/components/Games/GymPumpEngine';
import Hypnosia from '@/components/Games/Hypnosia';
import UnderwaterOddyseySeries from '@/components/Games/UnderwaterOddyseySeries';
import SuperShowdown2 from '@/components/Games/SuperShowdown2';
import SuperShowdown from '@/components/Games/SuperShowdown';
import RedRover from '@/components/Games/RedRover';
import JungleJourneySeries from '@/components/Games/JungleJourneySeries';
import Chess from '@/components/Games/Chess';
import FloorIsLava from '@/components/Games/FloorIsLava';
import InsaneShowdown from '@/components/Games/InsaneShowdown';

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
    id: 'oceanlifePro',
    name: 'OceanLife Pro',
    description: 'Premium ocean explorer with expanded fauna, fishing, and deep-sea adventures!',
    icon: '🐠',
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
    component: InsaneShowdown,
  },
];

export default function HomeTab({ user, editMode, onResetPublished }: HomeTabProps) {
  const [selectedGame, setSelectedGame] = useState<PublishedGame | null>(null);
  const [selectedBuiltInGameId, setSelectedBuiltInGameId] = useState<string | null>(null);
  const [showGymPump, setShowGymPump] = useState(false);
  const [published, setPublished] = useState<PublishedGame[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [skins, setSkins] = useState<Skin[]>([]);
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
        const skinsData = await getSkins();
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

  // Include preloaded games
  const publishedArray = Array.isArray(published) ? published : [];
  const allGames = [...publishedArray];
  const sortedGames = allGames.slice().sort((a, b) => b.ts - a.ts);
  // Get friends - show first 8
  const friends = (user.friends || []).slice(0, 8);
  const usersArray = Array.isArray(users) ? users : [];
  const friendUsers = usersArray
    .filter(u => u && u.username && friends.includes(u.username))
    .slice(0, 8);

  if (showGymPump) {
    return <GymPumpEngine user={user} onClose={() => setShowGymPump(false)} />;
  }
  if (selectedGame) {
    return <GamePlayer game={selectedGame} onClose={() => setSelectedGame(null)} />;
  }
  // Built-in game selected – render its component
  const selectedBuiltIn = selectedBuiltInGameId
    ? builtInGames.find(g => g.id === selectedBuiltInGameId)
    : null;
  if (selectedBuiltIn) {
    const GameComponent = selectedBuiltIn.component;
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <button
          onClick={() => { setSelectedBuiltInGameId(null); setLoadError(null); }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            padding: '10px 20px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          ← Back
        </button>
        <GameComponent onClose={() => { setSelectedBuiltInGameId(null); setLoadError(null); }} />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100%'
    }}>
      {/* Welcome / Tagline */}
      <div style={{
        marginBottom: '32px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(0, 170, 255, 0.08) 0%, rgba(0, 170, 255, 0.04) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 170, 255, 0.2)'
      }}>
        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '15px', lineHeight: 1.6 }}>
          <strong>Pixel Place</strong> is a delightful and welcoming online game for kids and teens. Dive into games crafted by others, then unleash your creativity to design your own games for everyone to enjoy. You start with <strong>10 Pixel-Coins</strong> to personalize your avatar — head to the Avatar Shop to pick a style! We add new games regularly, and safety is our priority: the game is fully moderated.
        </p>
      </div>

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
                setSelectedBuiltInGameId(game.id);
                setIsLoading(false);
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
                      // Special handling for Gym Pump (React component game)
                      if (game.gameCode === 'builtin_gymPump' || game.id === 'gym-pump') {
                        setShowGymPump(true);
                      } else {
                        setSelectedGame(game);
                      }
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
                        background: game.id === 'gym-pump'
                          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: game.id === 'gym-pump' ? '48px' : '28px',
                        fontWeight: 700
                      }}>
                        {game.id === 'gym-pump' ? '💪' : (game.title || 'G').charAt(0).toUpperCase()}
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
                          // Special handling for Gym Pump (React component game)
                          if (game.gameCode === 'builtin_gymPump' || game.id === 'gym-pump') {
                            setShowGymPump(true);
                          } else {
                            setSelectedGame(game);
                          }
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
                      // Special handling for Gym Pump (React component game)
                      if (game.gameCode === 'builtin_gymPump' || game.id === 'gym-pump') {
                        setShowGymPump(true);
                      } else {
                        setSelectedGame(game);
                      }
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
                        background: game.id === 'gym-pump'
                          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: game.id === 'gym-pump' ? '48px' : '28px',
                        fontWeight: 700
                      }}>
                        {game.id === 'gym-pump' ? '💪' : (game.title || 'G').charAt(0).toUpperCase()}
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
                          // Special handling for Gym Pump (React component game)
                          if (game.gameCode === 'builtin_gymPump' || game.id === 'gym-pump') {
                            setShowGymPump(true);
                          } else {
                            setSelectedGame(game);
                          }
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
