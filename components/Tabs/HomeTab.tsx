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

interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  component: React.ComponentType<any>;
  background?: string; // CSS gradient or image URL
}

// Helper function to get game background based on game title/type
function getGameBackground(gameTitle: string, gameId?: string): string {
  const title = (gameTitle || '').toLowerCase();
  const id = (gameId || '').toLowerCase();
  
  // Match games by title or ID
  if (title.includes('showdown') || id.includes('showdown')) {
    return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)';
  }
  if (title.includes('chess') || id.includes('chess')) {
    return 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)';
  }
  if (title.includes('lava') || id.includes('lava')) {
    return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%)';
  }
  if (title.includes('underwater') || title.includes('odyssey') || id.includes('underwater')) {
    return 'linear-gradient(135deg, #00d4ff 0%, #0099cc 50%, #006699 100%)';
  }
  if (title.includes('jungle') || id.includes('jungle')) {
    return 'linear-gradient(135deg, #2d5016 0%, #3d6b1f 50%, #4a7c23 100%)';
  }
  if (title.includes('rover') || id.includes('rover')) {
    return 'linear-gradient(135deg, #ff4757 0%, #ff6348 50%, #ff4757 100%)';
  }
  if (title.includes('hypnosia') || id.includes('hypnosia')) {
    return 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #6c5ce7 100%)';
  }
  if (title.includes('studio') || id.includes('studio')) {
    return 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #00b894 100%)';
  }
  if (title.includes('gym') || id.includes('gym')) {
    return 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #fd79a8 100%)';
  }
  
  // Default gradient based on first letter
  const firstChar = title.charAt(0);
  const gradients: Record<string, string> = {
    'a': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'b': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'c': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'd': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'e': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'f': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'g': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'h': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'i': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'j': 'linear-gradient(135deg, #ff8a80 0%, #ea6100 100%)',
    'k': 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    'l': 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
    'm': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'n': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'o': 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    'p': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'q': 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)',
    'r': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    's': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    't': 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)',
    'u': 'linear-gradient(135deg, #30e3eb 0%, #b721ff 100%)',
    'v': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'w': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'x': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'y': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'z': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  };
  
  return gradients[firstChar] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

import Hypnosia from '../Games/Hypnosia';
import UnderwaterOddyseySeries from '../Games/UnderwaterOddyseySeries';
import SuperShowdown2 from '../Games/SuperShowdown2';
import SuperShowdown from '../Games/SuperShowdown';
import RedRover from '../Games/RedRover';
import JungleJourneySeries from '../Games/JungleJourneySeries';
import FloorIsLava from '../Games/FloorIsLava';
import InsaneShowdown from '../Games/InsaneShowdown';
import HideAndSeek from '../Games/HideAndSeek';
import GhostInTheDark from '../Games/GhostInTheDark';
import CityLife from '../Games/CityLife';
import CelestialSeriesExploration from '../Games/CelestialSeriesExploration';
import SuperShowdown2D from '../Games/SuperShowdown2D';
import GameStudio from '../Games/GameStudio';
import GymPump from '../Games/GymPump';

const builtInGames: GameInfo[] = [
  {
    id: 'hypnosia',
    name: 'Hypnosia Puzzle',
    description: 'Test your deduction skills in this mysterious game!',
    icon: '🔮',
    category: 'Puzzle',
    component: Hypnosia,
    background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #6c5ce7 100%)'
  },
  {
    id: 'underwaterOdyssey',
    name: 'Underwater Odyssey Adventure',
    description: 'Explore the depths of the ocean in this adventure series!',
    icon: '🌊',
    category: 'Adventure',
    component: UnderwaterOddyseySeries,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 50%, #006699 100%)'
  },
  {
    id: 'superShowdown2',
    name: 'Super Showdown 2',
    description: 'Epic arena battles with powerful abilities!',
    icon: '⚔️',
    category: 'Action',
    component: SuperShowdown2,
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)'
  },
  {
    id: 'superShowdown',
    name: 'Super Showdown',
    description: 'Original arena combat experience!',
    icon: '🎯',
    category: 'Action',
    component: SuperShowdown,
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)'
  },
  {
    id: 'redRover',
    name: 'Red Rover',
    description: 'Classic team-based multiplayer game!',
    icon: '🏃',
    category: 'Multiplayer',
    component: RedRover,
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 50%, #ff4757 100%)'
  },
  {
    id: 'jungleJourney',
    name: 'Jungle Journey Adventure',
    description: 'Navigate through the jungle and collect fruits!',
    icon: '🌴',
    category: 'Adventure',
    component: JungleJourneySeries,
    background: 'linear-gradient(135deg, #2d5016 0%, #3d6b1f 50%, #4a7c23 100%)'
  },
  {
    id: 'floorIsLava',
    name: 'Floor Is Lava',
    description: 'Jump from platform to platform - don\'t touch the lava!',
    icon: '🌋',
    category: 'Platformer',
    component: FloorIsLava,
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%)'
  },
  {
    id: 'insaneShowdown',
    name: 'Insane Showdown',
    description: 'Ultimate combined arena battle experience!',
    icon: '🔥',
    category: 'Action',
    component: InsaneShowdown,
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)'
  },
  {
    id: 'hideAndSeek',
    name: 'Hide and Seek',
    description: 'Hide from seekers or find the hiders!',
    icon: '👻',
    category: 'Multiplayer',
    component: HideAndSeek,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'ghostInTheDark',
    name: 'Ghost In The Dark',
    description: 'Survive the darkness and escape the ghost!',
    icon: '👻',
    category: 'Horror',
    component: GhostInTheDark,
    background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #2c2c2c 100%)'
  },
  {
    id: 'cityLife',
    name: 'City Life',
    description: 'Live your life in the city!',
    icon: '🏙️',
    category: 'Simulation',
    component: CityLife,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'celestialSeries',
    name: 'Celestial Series Exploration',
    description: 'Explore the cosmos and discover new worlds!',
    icon: '🌌',
    category: 'Adventure',
    component: CelestialSeriesExploration,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  },
  {
    id: 'superShowdown2D',
    name: 'Super Showdown 2D',
    description: '2D arena combat experience!',
    icon: '🎮',
    category: 'Action',
    component: SuperShowdown2D,
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)'
  },
  {
    id: 'gameStudio',
    name: 'Game Studio',
    description: 'Create your own games! Multiplayer game creation platform.',
    icon: '🎮',
    category: 'Creation',
    component: GameStudio,
    background: 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #00b894 100%)'
  },
  {
    id: 'gymPump',
    name: 'Gym Pump',
    description: 'Build your strength and power! Pump iron and level up!',
    icon: '💪',
    category: 'Fitness',
    component: GymPump,
    background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #fd79a8 100%)'
  }
];

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

  // Include published games only - filter out any malformed games
  const publishedArray = Array.isArray(published) ? published : [];
  // Filter out any games that are missing required properties to prevent toLowerCase errors
  const validGames = publishedArray.filter(game => 
    game && 
    typeof game === 'object' && 
    game.ts && 
    game.title && 
    typeof game.title === 'string' &&
    game.owner &&
    typeof game.owner === 'string'
  );
  const sortedGames = validGames.slice().sort((a, b) => b.ts - a.ts);

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
            {sortedGames.slice(0, 10).filter(game => game && game.ts && game.title && game.owner).map((game) => {
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
                  {/* Game Thumbnail/Background - Roblox Style */}
                  <div style={{
                    width: '100%',
                    height: '120px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: game.thumbnail ? 'transparent' : getGameBackground(game.title || '', game.id),
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
                            parent.style.background = getGameBackground(game.title || '', game.id);
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
                    background: game.thumbnail ? 'transparent' : getGameBackground(game.title || '', game.id),
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
                            parent.style.background = getGameBackground(game.title || '', game.id);
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
          <div style={{ fontSize: '14px' }}>Create your first game in the Create tab!</div>
        </div>
      )}

      {/* Built-in Games Section - At Bottom */}
      {builtInGames.length > 0 && (
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
            {[...builtInGames].reverse().filter(game => game && game.id && game.name).map((game) => (
            <div
              key={game.id}
              className="game-card-enhanced"
              onClick={() => {
                setSelectedBuiltInGame(game.id);
              }}
              style={{
                background: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #333',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
              }}
            >
              {/* Game Background/Thumbnail - Roblox Style */}
              <div style={{
                width: '100%',
                height: '180px',
                position: 'relative',
                overflow: 'hidden',
                background: game.background || getGameBackground(game.name, game.id),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: '64px',
                  textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {game.icon}
                </div>
                {/* Overlay gradient for better text readability */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                  pointerEvents: 'none'
                }} />
              </div>
              
              {/* Game Info */}
              <div style={{ padding: '16px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: '#ffffff',
                  textAlign: 'center'
                }}>
                  {game.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}>
                  {game.category || 'Game'}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#ccc',
                  textAlign: 'center',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  minHeight: '40px'
                }}>
                  {game.description}
                </div>
                <button 
                  className="btn" 
                  style={{ 
                    width: '100%',
                    background: '#00a2ff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0090e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#00a2ff';
                  }}
                >
                  Play Now
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
