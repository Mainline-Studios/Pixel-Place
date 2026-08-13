'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, UserMadeGame } from '@/types';
import { getUserMadeGames, deleteUserMadeGame } from '@/lib/storage';
import { subscribeToUserMadeGames } from '@/lib/firestoreClient';
import { useSecretTheme } from '@/contexts/SecretThemeContext';
import UserMadeGamePlayer from '../Games/UserMadeGamePlayer';
import { FilteredUsername } from '../FilteredText';
import GameErrorBoundary from '../GameErrorBoundary';
import GymPumpEngine from '../Games/GymPumpEngine';
import Hypnosia from '../Games/Hypnosia';
import UnderwaterOddyseySeries from '../Games/UnderwaterOddyseySeries';
import OceanLifePro from '../Games/OceanLifePro';
import BaseballDiamond from '../Games/BaseballDiamond';
import Showdown from '../Games/Showdown';
import CelestialSeriesExploration from '../Games/CelestialSeriesExploration';
import RedRover from '../Games/RedRover';
import JungleJourneySeries from '../Games/JungleJourneySeries';
import Chess from '../Games/Chess';
import FloorIsLava from '../Games/FloorIsLava';
import VoidArcade from '../Games/VoidArcade';
import EcoHero from '../Games/EcoHero';
import CoasterControl from '../Games/CoasterControl';
import HistoriMac from '../Games/HistoriMac';
import AnimationTest from '../Games/AnimationTest';
import WorldGenerator from '../Games/WorldGenerator';
import ObstacleCourse from '../Games/ObstacleCourse';
import OpenWorldPlaza from '../Games/OpenWorldPlaza';
import PetHabitat from '../Games/PetHabitat';
import { useMobileBeta } from '@/contexts/MobileBetaContext';
import SquishBubbles from '../Games/SquishBubbles';
import SquishSlime from '../Games/SquishSlime';
import LocalizeText, { FilteredThenLocalize } from '@/components/LocalizeText';
import { useUser } from '@/contexts/UserContext';
import { FriendsStrip } from '@/components/FriendsStrip';
import {
  getGuestGameOfTheDayId,
  guestGameOfTheDayDateKey,
  isGuestPlayableGameId,
} from '@/lib/guestMode';

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
    id: 'animationTest',
    name: 'Animation Test',
    description: 'Preview Pixel Placer animations and test free skin switching for avatar motion checks.',
    icon: '🎞️',
    category: 'Tools',
    component: AnimationTest,
  },
  {
    id: 'worldGenerator',
    name: 'World Generator',
    description:
      'Describe a world, preview a live sketch, then render a cloud flythrough powered by LingBot World — no local model download.',
    icon: '🌍',
    category: 'Tools',
    component: WorldGenerator,
  },
  {
    id: 'obstacleCourse',
    name: 'Obstacle Course',
    description: 'Run the Pixel Placer obstacle course with WASD + Space controls and camera drag/zoom.',
    icon: '🧱',
    category: 'Action',
    component: ObstacleCourse,
  },
  {
    id: 'openWorldPlaza',
    name: 'Open World Plaza',
    description:
      'Explore a shared plaza — Play joins a global server (max 15), Private Play makes a secret invite link.',
    icon: '🌳',
    category: 'Multiplayer',
    is3D: true,
    component: OpenWorldPlaza,
  },
  {
    id: 'petHabitat',
    name: 'Pet Habitat',
    description:
      'Pick a habitat and animal, feed them at the food shop, gear up, and visit friends in public or private worlds.',
    icon: '🐾',
    category: 'Multiplayer',
    is3D: true,
    component: PetHabitat,
  },
  {
    id: 'historiMac',
    name: 'HistoriMac',
    description:
      'Classic Mac & NeXT in the browser (Infinite Mac). Pick a version, read the lore, then play. Tip: the faint italic line likes to be clicked.',
    icon: '🖥️',
    thumbnail: '/images/games/historimac-play.png',
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
    id: 'coasterControl',
    name: 'Coaster Control',
    description:
      'RCT2-style park sim: 100+ rides, scenarios, sandbox mode, and smooth guest animations.',
    icon: '🎢',
    thumbnail: '/images/games/coaster-control.svg',
    category: 'Simulation',
    component: CoasterControl,
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
    component: OceanLifePro,
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
    id: 'baseballDiamond',
    name: 'Baseball Diamond',
    description: 'Rule-based baseball with counts, innings, outs, walks, and base-running.',
    icon: '⚾',
    category: 'Sports',
    component: BaseballDiamond,
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
  const { isMobileBeta } = useMobileBeta();
  const { updateUser } = useUser();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playWithFriend, setPlayWithFriend] = useState<string | null>(null);
  /** Deep link: `#historimac=versionId` redirects to `/historimac/:id` (invite); else HistoriMac boot */
  const [historiMacBootVersionId, setHistoriMacBootVersionId] = useState<string | null>(null);
  const [selectedUserGame, setSelectedUserGame] = useState<UserMadeGame | null>(null);
  const [userMadeGames, setUserMadeGames] = useState<UserMadeGame[]>([]);
  const [favoriteGameIds, setFavoriteGameIds] = useState<string[]>([]);
  const [pendingLaunchGameId, setPendingLaunchGameId] = useState<string | null>(null);

  const guestGameOfTheDayId = useMemo(
    () => (user.isGuest ? getGuestGameOfTheDayId() : null),
    [user.isGuest],
  );
  const guestGameOfTheDayDate = useMemo(
    () => (user.isGuest ? guestGameOfTheDayDateKey() : null),
    [user.isGuest],
  );

  const gamesList = useMemo(() => {
    let list = secretTheme === 'ixelace' ? [...games, ...SECRET_GAMES_IXEL_ACE] : games;
    if (isMobileBeta) list = list.filter((g) => g.id !== 'historiMac');
    if (user.isGuest) list = list.filter((g) => isGuestPlayableGameId(g.id));
    return list;
  }, [secretTheme, isMobileBeta, user.isGuest]);

  useEffect(() => {
    if (isMobileBeta && selectedGame === 'historiMac') setSelectedGame(null);
  }, [isMobileBeta, selectedGame]);

  useEffect(() => {
    setFavoriteGameIds(Array.isArray(user.favoriteGameIds) ? user.favoriteGameIds : []);
  }, [user.favoriteGameIds]);

  const toggleFavorite = (gameId: string) => {
    setFavoriteGameIds((prev) => {
      const next = prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId];
      void updateUser({ favoriteGameIds: next } as Partial<User>);
      return next;
    });
  };

  // Real-time games from Firestore (instant updates when games are added/edited in Firebase Console)
  useEffect(() => {
    if (user.isGuest) {
      setUserMadeGames([]);
      return;
    }
    const unsub = subscribeToUserMadeGames((games) => {
      setUserMadeGames(games as UserMadeGame[]);
    });
    return () => unsub();
  }, [user.isGuest]);

  // Fallback initial load from API (e.g. if Firestore client not ready)
  useEffect(() => {
    if (user.isGuest) return;
    getUserMadeGames().then((games) => {
      if (games.length > 0) setUserMadeGames((prev) => prev.length === 0 ? games : prev);
    });
  }, [user.isGuest]);

  // /games?playUserGame=<id> opens the selected user-made game immediately.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gameId = new URLSearchParams(window.location.search).get('playUserGame');
    setPendingLaunchGameId(gameId && gameId.trim() ? gameId.trim() : null);
  }, []);

  useEffect(() => {
    if (!pendingLaunchGameId || selectedUserGame) return;
    const match = userMadeGames.find((g) => g.id === pendingLaunchGameId);
    if (!match) return;
    setSelectedUserGame(match);
    setPendingLaunchGameId(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('playUserGame');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [pendingLaunchGameId, selectedUserGame, userMadeGames]);

  // HistoriMac: #historimac=versionId → canonical invite URL; bare #historimac opens picker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, '').trim();
      const lower = raw.toLowerCase();
      if (!lower.startsWith('historimac')) return;
      const eq = raw.indexOf('=');
      const id = eq >= 0 ? raw.slice(eq + 1).trim() : '';
      if (id) {
        const next = `${window.location.origin}/historimac/${encodeURIComponent(id)}`;
        if (window.location.pathname.startsWith('/historimac/')) return;
        window.location.replace(next);
        return;
      }
      setSelectedGame('historiMac');
      setHistoriMacBootVersionId(null);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
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
  const favoriteGames = gamesList.filter((g) => favoriteGameIds.includes(g.id));
  const guestGameOfTheDay = guestGameOfTheDayId
    ? gamesList.find((g) => g.id === guestGameOfTheDayId) || games.find((g) => g.id === guestGameOfTheDayId) || null
    : null;

  useEffect(() => {
    if (!user.isGuest || !selectedGame) return;
    if (!isGuestPlayableGameId(selectedGame)) setSelectedGame(null);
  }, [user.isGuest, selectedGame]);

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
      setPlayWithFriend(null);
    };
    
    // Components that support onClose prop
    const supportsOnClose = ['gymPump', 'hypnosia', 'voidArcade', 'ecoHero', 'historiMac', 'animationTest', 'worldGenerator', 'obstacleCourse', 'openWorldPlaza', 'petHabitat', 'squishBubbles', 'squishSlime', 'coasterControl'].includes(selectedGame);
    
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
      ? {
          onClose: handleClose,
          bootVersionId: historiMacBootVersionId,
          onBootVersionConsumed: () => setHistoriMacBootVersionId(null),
        }
      : selectedGame === 'animationTest'
      ? { user, onClose: handleClose }
      : selectedGame === 'worldGenerator'
      ? { user, onClose: handleClose }
      : selectedGame === 'obstacleCourse'
      ? { user, onClose: handleClose }
      : selectedGame === 'openWorldPlaza'
      ? {
          user,
          onClose: handleClose,
          playWithFriend: playWithFriend || undefined,
        }
      : selectedGame === 'petHabitat'
      ? {
          user,
          onClose: handleClose,
          playWithFriend: playWithFriend || undefined,
        }
      : selectedGame === 'squishBubbles' || selectedGame === 'squishSlime'
      ? { onClose: handleClose }
      : selectedGame === 'coasterControl'
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
            ← <LocalizeText text="Back" />
          </button>
        )}
        <GameComponent key={selectedGame} {...gameProps} />
      </div>
      </GameErrorBoundary>
    );
  }

  return (
    <>
      <h2 className="section-title">
        🎮 <LocalizeText text="Play Games" as="span" />
      </h2>

      {!user.isGuest ? (
      <FriendsStrip
        user={user}
        selectedFriend={playWithFriend}
        onSelectFriend={setPlayWithFriend}
        onPlayWithFriend={(friendUsername) => {
          setPlayWithFriend(friendUsername);
          setSelectedGame('openWorldPlaza');
        }}
      />
      ) : null}

      {isMobileBeta && (
        <div
          className="ai-box"
          style={{ marginBottom: 16, borderColor: 'rgba(0, 212, 255, 0.35)', background: 'rgba(0, 40, 60, 0.2)' }}
        >
          <div className="ai-label">
            <LocalizeText text="Mobile beta" />
          </div>
          <div className="ai-output">
            <LocalizeText
              as="span"
              text="Simplified layout for phones and tablets. HistoriMac is hidden (needs desktop). Showdown includes an on-screen D-pad. Add "
            />
            <code style={{ fontSize: 12 }}>?desktop=1</code>
            <LocalizeText as="span" text=" to the URL to try the full site once." />
          </div>
        </div>
      )}
      
      <div className="ai-box">
        <div className="ai-label">
          <LocalizeText text="Available Games" />
        </div>
        <div className="ai-output">
          {user.isGuest ? (
            <LocalizeText text="Guests can play 2D offline games, plus today’s 3D online Guest Game of the Day." />
          ) : (
            <LocalizeText text="Choose a game to play! All games are playable directly in your browser." />
          )}
        </div>
      </div>

      {user.isGuest && guestGameOfTheDay ? (
        <div
          className="ai-box"
          style={{
            marginTop: 16,
            border: '1px solid rgba(56,189,248,0.45)',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(15,23,42,0.35) 100%)',
          }}
        >
          <div className="ai-label" style={{ color: '#7dd3fc' }}>
            Guest Game of the Day · {guestGameOfTheDayDate}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 42 }} aria-hidden>
              {guestGameOfTheDay.icon}
            </span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{guestGameOfTheDay.name}</div>
              <div className="smalltext" style={{ margin: '4px 0 0' }}>
                Today’s rotating 3D online game. Comes back on another day.
              </div>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => setSelectedGame(guestGameOfTheDay.id)}
              style={{
                padding: '12px 18px',
                fontWeight: 800,
                background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              ▶ Play today’s game
            </button>
          </div>
        </div>
      ) : null}

      {favoriteGames.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '20px' }}>
            ⭐ <LocalizeText text="Favorite Games" as="span" />
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginTop: '12px' }}>
            {favoriteGames.map((game) => (
              <button
                key={`favorite-${game.id}`}
                type="button"
                className="btn"
                onClick={() => setSelectedGame(game.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <span style={{ fontSize: 18 }} aria-hidden>{game.icon}</span>
                <span style={{ fontWeight: 700 }}>{game.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

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
            <button
              type="button"
              className="btn"
              onClick={() => toggleFavorite(game.id)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2,
                borderRadius: 999,
                width: 36,
                height: 36,
                padding: 0,
                display: 'grid',
                placeItems: 'center',
                background: favoriteGameIds.includes(game.id)
                  ? 'rgba(250, 204, 21, 0.22)'
                  : 'rgba(0,0,0,0.35)',
                border: favoriteGameIds.includes(game.id)
                  ? '1px solid rgba(250, 204, 21, 0.7)'
                  : '1px solid rgba(255,255,255,0.3)',
              }}
              title={favoriteGameIds.includes(game.id) ? 'Remove favorite' : 'Add favorite'}
              aria-label={favoriteGameIds.includes(game.id) ? 'Remove favorite' : 'Add favorite'}
            >
              <span style={{ fontSize: 18 }} aria-hidden>{favoriteGameIds.includes(game.id) ? '★' : '☆'}</span>
            </button>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              <LocalizeText text={game.name} />
              {user.isGuest && game.id === guestGameOfTheDayId ? (
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7dd3fc', marginTop: 4 }}>
                  Guest Game of the Day
                </div>
              ) : null}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#8b90a8',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              <LocalizeText text={game.category} />
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-dim)',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              <LocalizeText text={game.description} />
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
              <LocalizeText text="Play" />
            </button>
          </div>
        ))}
      </div>

      {!user.isGuest ? (
      <div className="ai-box" style={{ marginTop: '24px' }}>
        <div className="ai-label">
          <LocalizeText text="Game Instructions" />
        </div>
        <div className="ai-output" style={{ fontSize: '13px', lineHeight: '1.8' }}>
          <strong>
            <LocalizeText text="Gym Pump:" as="span" />
          </strong>{' '}
          <LocalizeText
            as="span"
            text="Lift weights, build power, and climb the leaderboard! Use the game controls to play."
          />
        </div>
      </div>
      ) : null}

      {userMadeGames.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '40px' }}>
            🎨 <LocalizeText text="User-Made Games" as="span" />
          </h2>
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
                  <FilteredThenLocalize text={game.title} />
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#8b90a8',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  <LocalizeText text="User-Made" />
                </div>
                {typeof game.gameId === 'number' && game.gameId > 0 && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#c7d2fe',
                      textAlign: 'center',
                      marginBottom: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {`Game #${game.gameId}`}
                  </div>
                )}
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}>
                  <FilteredThenLocalize text={game.desc || ''} />
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#8b90a8',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <LocalizeText text="By:" as="span" />{' '}
                  <FilteredUsername username={game.owner || ''} currentUsername={user.username || ''} />
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
                    <LocalizeText text="Play" />
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
                {typeof game.gameId === 'number' && game.gameId > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <a
                      className="btn"
                      href={`/game/${game.gameId}`}
                      style={{ flex: 1, fontSize: 12, padding: '8px 10px', textAlign: 'center' }}
                      title="Open game page"
                    >
                      Open Page
                    </a>
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: 12, padding: '8px 10px' }}
                      onClick={() => {
                        if (typeof window === 'undefined') return;
                        const shareUrl = `${window.location.origin}/game/${game.gameId}`;
                        if (navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            alert('Game page link copied.');
                          }).catch(() => {
                            alert(shareUrl);
                          });
                        } else {
                          alert(shareUrl);
                        }
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
