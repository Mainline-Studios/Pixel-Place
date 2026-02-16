import Showdown from '@/components/Games/Showdown';
import type { GameInfo } from './types';

export const showdown: GameInfo = {
  id: 'showdown',
  name: 'Showdown',
  description: 'Neon arena combat with 8 powers and pixelcoins!',
  icon: '⚔️',
  category: 'Action',
  component: Showdown,
  thumbnail: '/images/games/showdown.svg',
  is3D: false,
};
