import RedRover from '@/components/Games/RedRover';
import type { GameInfo } from './types';

export const redRover: GameInfo = {
  id: 'redRover',
  name: 'Red Rover',
  description: 'Classic team-based multiplayer game!',
  icon: '🏃',
  category: 'Multiplayer',
  component: RedRover,
  thumbnail: '/images/games/red-rover.svg',
};
