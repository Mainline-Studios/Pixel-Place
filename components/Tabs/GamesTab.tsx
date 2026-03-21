'use client';

import { useState, useEffect } from 'react';
import { User, UserMadeGame } from '@/types';
import { getUserMadeGames, deleteUserMadeGame } from '@/lib/storage';
import { subscribeToUserMadeGames } from '@/lib/firestoreClient';
import { useSecretTheme } from '@/contexts/SecretThemeContext';
import UserMadeGamePlayer from '../Games/UserMadeGamePlayer';
import FilteredText, { FilteredUsername } from '../FilteredText';
import GameErrorBoundary from '../GameErrorBoundary';
import GymPumpEngine from '../Games/GymPumpEngine';
import Hypnosia from '../Games/Hypnosia';
import UnderwaterOddyseySeries from '../Games/UnderwaterOddyseySeries';
import Showdown from '../Games/Showdown';
import SuperShowdown from '../Games/SuperShowdown';
import SuperShowdown2 from '../Games/SuperShowdown2';
import SuperShowdown2D from '../Games/SuperShowdown2D';
import InsaneShowdown from '../Games/InsaneShowdown';
import CelestialSeriesExploration from '../Games/CelestialSeriesExploration';
import RedRover from '../Games/RedRover';
import JungleJourneySeries from '../Games/JungleJourneySeries';
import Chess from '../Games/Chess';
import FloorIsLava from '../Games/FloorIsLava';
import VoidArcade from '../Games/VoidArcade';
import EcoHero from '../Games/EcoHero';
import HistoriMac from '../Games/HistoriMac';
import SquishBubbles from '../Games/SquishBubbles';
import SquishSlime from '../Games/SquishSlime';

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
    id: 'historiMac',
    name: 'HistoriMac',
    description:
      'Classic Mac & NeXT in the browser (Infinite Mac). Pick a version, read the lore, then play. Tip: the faint italic line likes to be clicked.',
    icon: '🖥️',
    category: 'Arcade',
    component: HistoriMac,
  },
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
    id: 'oceanlifePro',
    name: 'OceanLife Pro',
    description: 'Premium ocean explorer with expanded fauna, fishing, and deep-sea adventures!',
    icon: '🐠',
    thumbnail: '/images/games/underwater-odyssey.svg',
    category: 'Adventure',
    component: UnderwaterOddyseySeries,
  },
  {
    id: 'showdown',
    name: 'Showdown',
    description: 'Neon arena combat — 8 powers, pixelcoins, pickups!',
    icon: '⚔️',
    thumbnail: '/images/games/showdown.svg',
    category: 'Action',
    is3D: false,
    component: Showdown,
  },
  {
    id: 'superShowdown',
    name: 'Super Showdown',
    description: '3D arena combat with original powers and entities!',
    icon: '⚔️',
    thumbnail: '/images/games/showdown.svg',
    category: 'Action',
    component: SuperShowdown,
  },
  {
    id: 'superShowdown2',
    name: 'Super Showdown 2',
    description: 'New powers: mud, parasite, harmony, regen, hex, lunar, soleil, doppelganger!',
    icon: '⚔️',
    thumbnail: '/images/games/showdown.svg',
    category: 'Action',
    component: SuperShowdown2,
  },
  {
    id: 'superShowdown2D',
    name: 'Super Showdown 2D',
    description: '2D arena combat — fast-paced pixel brawling!',
    icon: '⚔️',
    thumbnail: '/images/games/showdown.svg',
    category: 'Action',
    is3D: false,
    component: SuperShowdown2D,
  },
  {
    id: 'insaneShowdown',
    name: 'Insane Showdown',
    description: 'Combined arena — all powers, whirlpools, black holes, doppelgangers!',
    icon: '⚔️',
    thumbnail: '/images/games/showdown.svg',
    category: 'Action',
    component: InsaneShowdown,
  },
  {
    id: 'celestialSeries',
    name: 'Celestial Series',
    description: 'Explore the Solar System — dock at Earth, Moon, Mars, and beyond!',
    icon: '🪐',
    thumbnail: '/images/games/hypnosia.svg',
    category: 'Adventure',
    component: CelestialSeriesExploration,
  },
  {
    id: 'redRover',
    name: 'Red Rover',
    description: 'Classic team-based multiplayer game!',
    icon: '🏃',
    thumbnail: '/images/games/red-rover.svg',
    category: 'Adventure',
    component: RedRover,
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
    description: 'Platformer where the floor is lava! Vote for maps and survive.',
    icon: '🔥',
    thumbnail: '/images/games/floor-is-lava.svg',
    category: 'Action',
    component: FloorIsLava,
  },
  {
    id: 'jungleJourney',
    name: 'Jungle Journey',
    description: 'Explore a dense jungle with trees, swamps, animals, and mysterious fruits!',
    icon: '🌴',
    thumbnail: '/images/games/jungle-journey.svg',
    category: 'Adventure',
    component: JungleJourneySeries,
  },
  {
    id: 'voidArcade',
    name: 'Void Arcade',
    description: 'Multi-game arcade: Void Crawler, Star Fury, Crystal Keep, Neon Drift. Pick a game and play!',
    icon: '🕹️',
    category: 'Arcade',
    component: VoidArcade,
  },
  {
    id: 'ecoHero',
    name: 'Eco Hero — City Cleanup',
    description: 'Keep the city clean, complete missions, chat with AI citizens after the game!',
    icon: '🌱',
    category: 'Arcade',
    component: EcoHero,
  },
];

const SECRET_GAMES_IXEL_ACE: GameInfo[] = [
  {
    id: 'squishBubbles',
    name: 'Squish Bubbles',
    description: 'Pop the bubbles! Simple 2D click game.',
    icon: '🫧',
    category: '2D',
    is3D: false,
    component: SquishBubbles,
  },
  {
    id: 'squishSlime',
    name: 'Squish Slime',
    description: 'Squish the slime with your cursor!',
    icon: '🟢',
    category: '2D',
    is3D: false,
    component: SquishSlime,
  },
];

export default function GamesTab({ user, editMode }: GamesTabProps) {
  const { secretTheme } = useSecretTheme();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedUserGame, setSelectedUserGame] = useState<UserMadeGame | null>(null);
  const [userMadeGames, setUserMadeGames] = useState<UserMadeGame[]>([]);

  const gamesList = secretTheme === 'ixelace' ? [...games, ...SECRET_GAMES_IXEL_ACE] : games;

  // Real-time games from Firestore (instant updates when games are added/edited in Firebase Console)
  useEffect(() => {
    const unsub = subscribeToUserMadeGames((games) => {
      setUserMadeGames(games as UserMadeGame[]);
    });
    return () => unsub();
  }, []);

  // Fallback initial load from API (e.g. if Firestore client not ready)
  useEffect(() => {
    getUserMadeGames().then((games) => {
      if (games.length > 0) setUserMadeGames((prev) => prev.length === 0 ? games : prev);
    });
  }, []);

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    if (!confirm(`Delete game "${gameTitle}"? This action cannot be undone.`)) return;
    await deleteUserMadeGame(gameId);
    const games = await getUserMadeGames();
    setUserMadeGames(games);
    alert(`Game "${gameTitle}" has been deleted.`);
  };

  const selectedGameInfo = gamesList.find(g => g.id === selectedGame);
  const GameComponent = selectedGameInfo?.component;

  if (selectedUserGame) {
    return (
      <GameErrorBoundary onBack={() => setSelectedUserGame(null)} gameName={selectedUserGame.title}>
        <div className="game-cursor-zone" style={{ width: '100%', minHeight: '100%' }}>
          <UserMadeGamePlayer game={selectedUserGame} user={user} onClose={() => setSelectedUserGame(null)} />
        </div>
      </GameErrorBoundary>
    );
  }

  if (selectedGame && GameComponent) {
    const handleClose = () => {
      setSelectedGame(null);
      setSelectedUserGame(null);
    };
    
    // Components that support onClose prop
    const supportsOnClose = ['gymPump', 'hypnosia', 'voidArcade', 'ecoHero', 'historiMac', 'squishBubbles', 'squishSlime'].includes(selectedGame);
    
    // Prepare props based on game type - pass user to games that need it
    const baseProps = selectedGame === 'gymPump'
      ? { user, onClose: handleClose }
      : selectedGame === 'hypnosia'
      ? { onClose: handleClose }
      : selectedGame === 'voidArcade'
      ? { onClose: handleClose }
      : selectedGame === 'ecoHero'
      ? { onClose: handleClose }
      : selectedGame === 'historiMac'
      ? { onClose: handleClose }
      : selectedGame === 'squishBubbles' || selectedGame === 'squishSlime'
      ? { onClose: handleClose }
      : selectedGame === 'showdown'
      ? { user }
      : selectedGame === 'chess'
      ? { user, onClose: handleClose }
      : {};
    const gameProps = { ...selectedGameInfo?.props, ...baseProps };
    
    return (
      <GameErrorBoundary onBack={handleClose} gameName={selectedGameInfo?.name}>
      <div key={selectedGame} className="game-cursor-zone" style={{ position: 'relative', width: '100%', minHeight: '100%' }}>        {!supportsOnClose && (
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
      </GameErrorBoundary>
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
        {gamesList.map((game) => (
          <div
            key={game.id}
            className="game-card-enhanced"
            style={{
              background: 'linear-gradient(135deg, var(--panel) 0%, var(--panel-soft) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              cursor: 'default',
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
            <button
              type="button"
              className="btn"
              onClick={() => setSelectedGame(game.id)}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'linear-gradient(180deg, #00b4ff 0%, #0090d6 100%)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 4px 16px rgba(0, 162, 255, 0.45)',
              }}
            >
              <span style={{ fontSize: '18px' }} aria-hidden>▶</span>
              Play
            </button>
          </div>
        ))}
      </div>

      <div className="ai-box" style={{ marginTop: '24px' }}>
        <div className="ai-label">Game Instructions</div>
        <div className="ai-output" style={{ fontSize: '13px', lineHeight: '1.8' }}>
          <strong>Gym Pump:</strong> Lift weights, build power, and climb the leaderboard! Use the game controls to play.        </div>
      </div>

      {userMadeGames.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '40px' }}>🎨 User-Made Games</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {userMadeGames.map((game) => (
              <div
                key={game.id}
                className="game-card-enhanced"
                style={{
                  background: 'linear-gradient(135deg, var(--panel) 0%, var(--panel-soft) 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)',
                  cursor: 'default',
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
                  <FilteredText text={game.title} />
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
                  <FilteredText text={game.desc || ''} />
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#8b90a8',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  By: <FilteredUsername username={game.owner || ''} currentUsername={user.username || ''} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      fontSize: '16px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      background: 'linear-gradient(180deg, #00b4ff 0%, #0090d6 100%)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      boxShadow: '0 4px 16px rgba(0, 162, 255, 0.45)',
                    }}
                    onClick={() => setSelectedUserGame(game)}
                  >
                    <span style={{ fontSize: '18px' }} aria-hidden>▶</span>
                    Play
                  </button>
                  {(user.role === 'admin' || user.role === 'head_admin') && (
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
