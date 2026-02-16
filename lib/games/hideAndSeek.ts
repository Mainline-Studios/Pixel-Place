import HideAndSeek from '@/components/Games/HideAndSeek';
import type { GameInfo } from './types';

export const hideAndSeek: GameInfo = {
  id: 'hideAndSeek',
  name: 'Hide and Seek',
  description: 'Classic childhood game - hide and try not to get caught!',
  icon: '🙈',
  category: 'Multiplayer',
  component: HideAndSeek,
};
