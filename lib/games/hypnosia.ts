import Hypnosia from '@/components/Games/Hypnosia';
import type { GameInfo } from './types';

export const hypnosia: GameInfo = {
  id: 'hypnosia',
  name: 'Hypnosia',
  description: 'Test your deduction skills in this mysterious game!',
  icon: '🔍',
  category: 'Puzzle',
  component: Hypnosia,
  thumbnail: '/images/games/hypnosia.svg',
};
