import { PublishedGame } from '@/types';

<<<<<<< HEAD
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
=======
// No preloaded games - all games are user-published
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
