import { PublishedGame } from '@/types';

// Gym Pump Game - Preloaded (ONLY GAME)
export const GYM_PUMP_PRELOADED_GAME: PublishedGame = {
  title: 'Gym Pump',
  desc: 'Lift weights, build power, and climb the leaderboard!',
  owner: 'System',
  ts: Date.now() - 172800000, // 2 days ago to ensure it appears
  gameCode: 'builtin_gymPump', // Special identifier for React component games
  thumbnail: undefined, // Will use emoji fallback
  playable: true,
  multiplayer: false,
  id: 'gym-pump'
};

// All other games have been removed - only Gym Pump remains