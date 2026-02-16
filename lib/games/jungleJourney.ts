import JungleJourneySeries from '@/components/Games/JungleJourneySeries';
import type { GameInfo } from './types';

export const jungleJourney: GameInfo = {
  id: 'jungleJourney',
  name: 'Jungle Journey',
  description: 'Navigate through the jungle and collect fruits!',
  icon: '🌴',
  category: 'Adventure',
  component: JungleJourneySeries,
  thumbnail: '/images/games/underwater-odyssey.svg',
};
