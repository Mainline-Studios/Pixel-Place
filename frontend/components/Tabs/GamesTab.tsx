'use client';

import { useState, useMemo } from 'react';
import { User } from '@/types';
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
import PixelStudioGame from '../Games/PixelStudioGame';
import PixelRushRacing from '../Games/PixelRushRacing';

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
  /** Shown when Educational mode is on — calmer / learning-oriented picks */
  educational?: boolean;
  component: React.ComponentType<any>;
  props?: any;
}

// All available games (single catalog — no separate user-made section)
const games: GameInfo[] = [
  {
    id: 'pixelRush',
    name: 'Pixel Rush Racing',
    description:
      '3D neon circuit racing — WASD, checkpoints, obstacles, crash sparks, skins, and live lobbies (up to 200 drivers).',
    icon: '🏎️',
    thumbnail: '/images/games/showdown.svg',
    category: 'Racing',
    is3D: true,
    educational: true,
    component: PixelRushRacing,
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
    educational: true,
    component: Hypnosia,
  },
  {
    id: 'underwaterOdyssey',
    name: 'Underwater Odyssey',
    description: 'Explore the depths of the ocean in this adventure series!',
    icon: '🌊',
    thumbnail: '/images/games/underwater-odyssey.svg',
    category: 'Adventure',
    educational: true,
    component: UnderwaterOddyseySeries,
  },
  {
    id: 'oceanlifePro',
    name: 'OceanLife Pro',
    description: 'Premium ocean explorer with expanded fauna, fishing, and deep-sea adventures!',
    icon: '🐠',
    thumbnail: '/images/games/underwater-odyssey.svg',
    category: 'Adventure',
    educational: true,
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
    educational: true,
    component: CelestialSeriesExploration,
  },
  {
    id: 'redRover',
    name: 'Red Rover',
    description: 'Classic team-based multiplayer game!',
    icon: '🏃',
    thumbnail: '/images/games/red-rover.svg',
    category: 'Adventure',
    educational: true,
    component: RedRover,
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Classic chess game - challenge yourself or play online!',
    icon: '♟️',
    thumbnail: '/images/games/chess.svg',
    category: 'Strategy',
    educational: true,
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
    educational: true,
    component: JungleJourneySeries,
  },
  {
    id: 'pixelStudio',
    name: 'Pixel Studio',
    description: '3D editor & engine — build scenes, terrain, materials, and play-test like Roblox Studio.',
    icon: '🧱',
    thumbnail: '/images/games/showdown.svg',
    category: 'Creative',
    educational: true,
    is3D: true,
    component: PixelStudioGame,
  },
];

export default function GamesTab({ user, editMode }: GamesTabProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const trust = user.authBackend === 'postgres' ? user.backendPayload?.trust : undefined;
  const educationalOn = !!trust?.educationalModeEnabled;
  const safeOn = !!trust?.safeModeEnabled;

  const visibleGames = useMemo(() => {
    if (!educationalOn) return games;
    return games.filter((g) => g.educational);
  }, [educationalOn]);

  const selectedGameInfo = visibleGames.find((g) => g.id === selectedGame);
  const GameComponent = selectedGameInfo?.component;

  if (selectedGame && GameComponent) {
    const handleClose = () => {
      setSelectedGame(null);
    };
    
    // Components that support onClose prop
    const supportsOnClose = ['gymPump', 'hypnosia'].includes(selectedGame);
    
    // Prepare props based on game type - pass user to games that need it
    const baseProps = selectedGame === 'gymPump' 
      ? { user, onClose: handleClose }
      : selectedGame === 'hypnosia'
      ? { onClose: handleClose }
      : selectedGame === 'showdown'
      ? { user }
      : selectedGame === 'chess'
      ? { user, onClose: handleClose }
      : selectedGame === 'pixelRush'
      ? { user }
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

      {(safeOn || educationalOn) && (
        <div className="ai-box" style={{ marginBottom: 16 }}>
          <div className="ai-label">{safeOn && educationalOn ? 'Safe + Educational' : safeOn ? 'Safe Mode' : 'Educational mode'}</div>
          <div className="ai-output" style={{ lineHeight: 1.7 }}>
            {safeOn && (
              <p style={{ marginBottom: educationalOn ? 8 : 0 }}>
                Safe Mode still applies to chat, creation tools, and other areas of Pixel Place — the Games tab is a
                curated built-in catalog only.
              </p>
            )}
            {educationalOn && (
              <p style={{ margin: 0 }}>
                Showing a calmer, education-oriented slice of the built-in catalog (puzzles, exploration, strategy).
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="ai-box">
        <div className="ai-label">Available Games</div>
        <div className="ai-output">
          Choose a game to play! All games are playable directly in your browser.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {visibleGames.map((game) => (
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
          <strong>Pixel Rush Racing:</strong> WASD drive, hit checkpoints in order, avoid red cubes — crash sparks earn
          style points. Open Racing skins to unlock wraps with race credits or Pixel Coins.
          <br />
          <strong>Gym Pump:</strong> Lift weights, build power, and climb the leaderboard! Use the game controls to play.
        </div>
      </div>
    </>
  );
}
