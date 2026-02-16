'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, PublishedGame } from '@/types';
import { getSkins, getPublished, getUsers } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import GamePlayer from '@/components/GamePlayer';
import Avatar3DViewer from '@/components/Avatar3DViewer';
// Games will be imported dynamically
import FullScreenGameWrapper from '../FullScreenGameWrapper';

interface HomeTabProps {
  user: User;
  editMode: boolean;
  onResetPublished?: () => void;
}

import { BUILT_IN_GAMES, getGameBackground } from '@/lib/games';

const builtInGames = BUILT_IN_GAMES;

export default function HomeTab({ user, editMode, onResetPublished }: HomeTabProps) {
  const [selectedGame, setSelectedGame] = useState<PublishedGame | null>(null);
  const [selectedBuiltInGame, setSelectedBuiltInGame] = useState<string | null>(null);
  const [published, setPublished] = useState<PublishedGame[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [skins, setSkins] = useState(getSkins());
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  // New loading screen - simple and reliable
  useEffect(() => {
    if (selectedBuiltInGame) {
      setIsLoading(true);
      setLoadError(null);
      setLoadingProgress(0);
    } else {
      setIsLoading(false);
      setLoadError(null);
      setLoadingProgress(0);
    }
  }, [selectedBuiltInGame]);

  // Loading progress and timer
  useEffect(() => {
    if (!isLoading || !selectedBuiltInGame) {
      setLoadingProgress(0);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 2, 100));
    }, 80);

    // Hide loading after 4 seconds
    const hideTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(progressInterval);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimeout);
    };
  }, [isLoading, selectedBuiltInGame]);

  // Include published games from API (community-published games)
  const publishedArray: any[] = Array.isArray(published) ? published : [];
  // Filter out any games that are missing required properties to prevent toLowerCase errors
  const validGames = publishedArray.filter(game => {
    try {
      if (!game || typeof game !== 'object') return false;
      if (!game.ts) return false;
      if (!game.title || typeof game.title !== 'string') return false;
      if (!game.owner || typeof game.owner !== 'string') return false;
      if (game.id !== undefined && typeof game.id !== 'string') return false;
      return true;
    } catch (error) {
      console.warn('Error filtering game:', error, game);
      return false;
    }
  });
  const sortedGames = validGames.slice().sort((a, b) => b.ts - a.ts);

  // Get friends - show first 8, filter out any undefined/null values
  const friends = (user.friends || []).filter(f => f && typeof f === 'string').slice(0, 8);
  const usersArray = Array.isArray(users) ? users : [];
  const friendUsers = usersArray
    .filter(u => u && u.username && typeof u.username === 'string' && friends.includes(u.username))
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
    const gameInfo = builtInGames.find(g => g.id === selectedBuiltInGame);
    const gameName = gameInfo?.name || 'Game';

    return (
      <FullScreenGameWrapper gameTitle={gameName} onExit={handleClose}>
        {isLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#181818',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{
                fontSize: '64px',
                margin: '0 0 20px 0',
                fontWeight: 'bold',
                background: 'linear-gradient(180deg, #fff 0%, #ccc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {gameName}
              </div>
              <div style={{
                fontSize: '18px',
                color: '#999',
                marginTop: '10px',
                fontWeight: 300
              }}>
                by System
              </div>
            </div>

            <div style={{ width: '500px', maxWidth: '90%' }}>
              <div style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '12px',
                textAlign: 'center',
                fontWeight: 300
              }}>
                Loading...
              </div>

              <div style={{
                width: '100%',
                height: '8px',
                background: '#2a2a2a',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #1a1a1a',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  width: `${loadingProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00A2FF 0%, #00D4FF 50%, #00A2FF 100%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '4px',
                  animation: 'loadingShimmer 1.5s linear infinite',
                  boxShadow: '0 0 10px rgba(0, 162, 255, 0.5)',
                  transition: 'width 0.3s ease-out'
                }} />
              </div>

              <div style={{
                marginTop: '30px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center',
                fontWeight: 300
              }}>
                <div style={{ marginBottom: '8px' }}>Initializing game engine...</div>
                <div style={{ marginBottom: '8px' }}>Loading assets...</div>
                <div>Preparing world...</div>
              </div>
            </div>

            <style>{`
              @keyframes loadingShimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
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
        {!isLoading && GameComponent && (
          <GameComponent onClose={handleClose} user={user} />
        )}
      </FullScreenGameWrapper>
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

      {/* Roblox-Style Game Categories - At Top */}
      {builtInGames.length > 0 && (
        <>
          {/* Recently Played */}
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
                Recently Played
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
              {builtInGames.slice(0, 5).filter(game => {
                try {
                  if (!game || typeof game !== 'object') return false;
                  if (!game.id || typeof game.id !== 'string') return false;
                  if (!game.name || typeof game.name !== 'string') return false;
                  if (!game.category || typeof game.category !== 'string') return false;
                  return true;
                } catch (error) {
                  console.warn('Error filtering builtInGame:', error, game);
                  return false;
                }
              }).map((game) => {
                if (!game || !game.id || !game.name || !game.category || typeof game.category !== 'string' || typeof game.name !== 'string' || typeof game.id !== 'string') return null;
                return (
                  <div
                    key={game.id}
                    className="game-card-enhanced"
                    onClick={() => {
                      setSelectedBuiltInGame(game.id);
                    }}
                    style={{
                      minWidth: '160px',
                      width: '160px',
                      background: '#2a2a2a',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '120px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: (game && game.background ? game.background : getGameBackground((game?.name && typeof game.name === 'string') ? game.name : '', (game?.id && typeof game.id === 'string') ? game.id : '')) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {game.icon}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        pointerEvents: 'none'
                      }} />
                    </div>
                    <div style={{ padding: '8px' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {game.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginBottom: '8px'
                      }}>
                        {(game.category && typeof game.category === 'string') ? game.category : 'Game'}
                      </div>
                      <button
                        className="btn"
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
                      >
                        Play
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending */}
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
                Trending
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
              {builtInGames.slice(0, 3).filter(game => {
                try {
                  if (!game || typeof game !== 'object') return false;
                  if (!game.id || typeof game.id !== 'string') return false;
                  if (!game.name || typeof game.name !== 'string') return false;
                  if (!game.category || typeof game.category !== 'string') return false;
                  return true;
                } catch (error) {
                  console.warn('Error filtering builtInGame:', error, game);
                  return false;
                }
              }).map((game) => {
                if (!game || !game.id || !game.name || !game.category || typeof game.category !== 'string' || typeof game.name !== 'string' || typeof game.id !== 'string') return null;
                return (
                  <div
                    key={`trending-${game.id}`}
                    className="game-card-enhanced"
                    onClick={() => {
                      setSelectedBuiltInGame(game.id);
                    }}
                    style={{
                      minWidth: '160px',
                      width: '160px',
                      background: '#2a2a2a',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '120px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: (game && game.background ? game.background : getGameBackground((game?.name && typeof game.name === 'string') ? game.name : '', (game?.id && typeof game.id === 'string') ? game.id : '')) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {game.icon}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        pointerEvents: 'none'
                      }} />
                    </div>
                    <div style={{ padding: '8px' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {game.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginBottom: '8px'
                      }}>
                        {(game.category && typeof game.category === 'string') ? game.category : 'Game'}
                      </div>
                      <button
                        className="btn"
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
                      >
                        Play
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New */}
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
                New
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
              {builtInGames.filter(game => {
                try {
                  if (!game || typeof game !== 'object') return false;
                  if (!game.id || typeof game.id !== 'string') return false;
                  if (!game.name || typeof game.name !== 'string') return false;
                  if (!game.category || typeof game.category !== 'string') return false;
                  return true;
                } catch (error) {
                  console.warn('Error filtering builtInGame:', error, game);
                  return false;
                }
              }).map((game) => {
                if (!game || !game.id || !game.name || !game.category || typeof game.category !== 'string' || typeof game.name !== 'string' || typeof game.id !== 'string') return null;
                return (
                  <div
                    key={`new-${game.id}`}
                    className="game-card-enhanced"
                    onClick={() => {
                      setSelectedBuiltInGame(game.id);
                    }}
                    style={{
                      minWidth: '160px',
                      width: '160px',
                      background: '#2a2a2a',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '120px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: (game && game.background ? game.background : getGameBackground((game?.name && typeof game.name === 'string') ? game.name : '', (game?.id && typeof game.id === 'string') ? game.id : '')) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {game.icon}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        pointerEvents: 'none'
                      }} />
                    </div>
                    <div style={{ padding: '8px' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {game.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginBottom: '8px'
                      }}>
                        {(game.category && typeof game.category === 'string') ? game.category : 'Game'}
                      </div>
                      <button
                        className="btn"
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
                      >
                        Play
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Liked Most */}
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
                Liked Most
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
              {[...builtInGames].reverse().slice(0, 4).filter(game => {
                try {
                  if (!game || typeof game !== 'object') return false;
                  if (!game.id || typeof game.id !== 'string') return false;
                  if (!game.name || typeof game.name !== 'string') return false;
                  if (!game.category || typeof game.category !== 'string') return false;
                  return true;
                } catch (error) {
                  console.warn('Error filtering builtInGame:', error, game);
                  return false;
                }
              }).map((game) => {
                if (!game || !game.id || !game.name || !game.category || typeof game.category !== 'string' || typeof game.name !== 'string' || typeof game.id !== 'string') return null;
                return (
                  <div
                    key={`liked-${game.id}`}
                    className="game-card-enhanced"
                    onClick={() => {
                      setSelectedBuiltInGame(game.id);
                    }}
                    style={{
                      minWidth: '160px',
                      width: '160px',
                      background: '#2a2a2a',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '120px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: (game && game.background ? game.background : getGameBackground((game?.name && typeof game.name === 'string') ? game.name : '', (game?.id && typeof game.id === 'string') ? game.id : '')) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {game.icon}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        pointerEvents: 'none'
                      }} />
                    </div>
                    <div style={{ padding: '8px' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {game.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginBottom: '8px'
                      }}>
                        {(game.category && typeof game.category === 'string') ? game.category : 'Game'}
                      </div>
                      <button
                        className="btn"
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
                      >
                        Play
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

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
            {sortedGames.slice(10, 20).filter(game => game && game.ts && game.title && game.owner).map((game) => {
              if (!game || !game.ts || !game.title || !game.owner) return null;

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
                    background: game.thumbnail ? 'transparent' : getGameBackground((game.title && typeof game.title === 'string') ? game.title : '', (game.id && typeof game.id === 'string') ? game.id : ''),
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
                          // Fallback to gradient background
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.style.background = getGameBackground((game.title && typeof game.title === 'string') ? game.title : '', (game.id && typeof game.id === 'string') ? game.id : '');
                            const fallback = document.createElement('div');
                            fallback.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.5);';
                            fallback.textContent = (game.title || 'G').charAt(0).toUpperCase();
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '32px',
                        fontWeight: 700,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {(game.title || 'G').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Overlay gradient for better text readability */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                      pointerEvents: 'none'
                    }} />
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
      {sortedGames.length === 0 && friendUsers.length === 0 && builtInGames.length === 0 && (
        <div style={{
          background: '#2a2a2a',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          color: '#999',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>No published games yet.</div>
          <div style={{ fontSize: '14px' }}>Games will come soon.</div>
        </div>
      )}

    </div>
  );
}
