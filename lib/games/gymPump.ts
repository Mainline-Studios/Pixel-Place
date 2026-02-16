import GymPumpEngine from '@/components/Games/GymPumpEngine';
import type { GameInfo } from './types';

export const gymPump: GameInfo = {
  id: 'gymPump',
  name: 'Gym Pump',
  description: 'Lift weights, build power, and climb the leaderboard!',
  icon: '💪',
  category: 'Action',
  component: GymPumpEngine,
  thumbnail: '/images/games/gym-pump.svg',
};
