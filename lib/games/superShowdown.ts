import SuperShowdown from '@/components/Games/SuperShowdown';
import type { GameInfo } from './types';

export const superShowdown: GameInfo = {
  id: 'superShowdown',
  name: 'Super Showdown',
  description: 'Original arena combat experience!',
  icon: '⚔️',
  category: 'Action',
  component: SuperShowdown,
  thumbnail: '/images/games/showdown.svg',
};
