import SuperShowdown2D from '@/components/Games/SuperShowdown2D';
import type { GameInfo } from './types';

export const superShowdown2D: GameInfo = {
  id: 'superShowdown2D',
  name: 'Super Showdown 2D',
  description: '2D arena battles with powerful abilities!',
  icon: '⚔️',
  category: 'Action',
  component: SuperShowdown2D,
  thumbnail: '/images/games/showdown.svg',
  is3D: false,
};
