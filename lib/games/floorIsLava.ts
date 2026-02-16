import FloorIsLava from '@/components/Games/FloorIsLava';
import type { GameInfo } from './types';

export const floorIsLava: GameInfo = {
  id: 'floorIsLava',
  name: 'Floor Is Lava',
  description: "Jump from platform to platform - don't touch the lava!",
  icon: '🌋',
  category: 'Platformer',
  component: FloorIsLava,
};
