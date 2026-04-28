import { PublishedGame } from '@/types';

// Built-in games that use React components
// These will be registered as published games with special gameCode identifiers
export const BUILTIN_GAMES: PublishedGame[] = [
  {
    title: 'Hypnosia',
    desc: 'Test your deduction skills in this mysterious game!',
    owner: 'System',
    ts: Date.now() - 86400000 * 7, // 7 days ago
    playable: true,
    gameCode: 'builtin_hypnosia',
    thumbnail: undefined,
  },
  {
    title: 'Underwater Odyssey',
    desc: 'Explore the depths of the ocean in this adventure series!',
    owner: 'System',
    ts: Date.now() - 86400000 * 6,
    playable: true,
    gameCode: 'builtin_underwaterOdyssey',
    thumbnail: undefined,
  },
  {
    title: 'OceanLife Pro',
    desc: 'Premium ocean explorer with expanded fauna, fishing, and deep-sea adventures!',
    owner: 'System',
    ts: Date.now() - 86400000 * 5.5,
    playable: true,
    gameCode: 'builtin_oceanlifePro',
    thumbnail: undefined,
  },
  {
    title: 'Super Showdown 2',
    desc: 'Epic arena battles with powerful abilities!',
    owner: 'System',
    ts: Date.now() - 86400000 * 5,
    playable: true,
    gameCode: 'builtin_superShowdown2',
    thumbnail: undefined,
  },
  {
    title: 'Super Showdown',
    desc: 'Original arena combat experience!',
    owner: 'System',
    ts: Date.now() - 86400000 * 4,
    playable: true,
    gameCode: 'builtin_superShowdown',
    thumbnail: undefined,
  },
  {
    title: 'Red Rover',
    desc: 'Classic team-based multiplayer game!',
    owner: 'System',
    ts: Date.now() - 86400000 * 3,
    playable: true,
    gameCode: 'builtin_redRover',
    thumbnail: undefined,
  },
  {
    title: 'Jungle Journey',
    desc: 'Navigate through the jungle and collect fruits!',
    owner: 'System',
    ts: Date.now() - 86400000 * 2,
    playable: true,
    gameCode: 'builtin_jungleJourney',
    thumbnail: undefined,
  },
  {
    title: 'Chess',
    desc: 'Classic chess game - challenge yourself or play online!',
    owner: 'System',
    ts: Date.now() - 86400000 * 1,
    playable: true,
    gameCode: 'builtin_chess',
    thumbnail: undefined,
  },
  {
    title: 'Floor Is Lava',
    desc: 'Jump from platform to platform - don\'t touch the lava!',
    owner: 'System',
    ts: Date.now() - 86400000 * 0.5,
    playable: true,
    gameCode: 'builtin_floorIsLava',
    thumbnail: undefined,
  },
  {
    title: 'Insane Showdown',
    desc: 'Ultimate combined arena battle experience!',
    owner: 'System',
    ts: Date.now() - 86400000 * 0.25,
    playable: true,
    gameCode: 'builtin_insaneShowdown',
    thumbnail: undefined,
  },
  // Note: HideAndSeek, GhostInTheDark, and CityLife are HTML files, not React components
  // They can be added later if converted to React components
  {
    title: 'Celestial Series Exploration',
    desc: 'Explore the cosmos and discover celestial wonders!',
    owner: 'System',
    ts: Date.now() - 86400000 * 11,
    playable: true,
    gameCode: 'builtin_celestialSeries',
    thumbnail: undefined,
  },
  {
    title: 'Super Showdown 2D',
    desc: '2D arena battles with powerful abilities!',
    owner: 'System',
    ts: Date.now() - 86400000 * 14,
    playable: true,
    gameCode: 'builtin_superShowdown2D',
    thumbnail: undefined,
  },
  // Note: InternationalSportsHQ and MusicalMayhem are not React components
  // They can be added later if converted to React components
];
