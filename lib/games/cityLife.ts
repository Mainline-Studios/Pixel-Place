import CityLife from '@/components/Games/CityLife';
import type { GameInfo } from './types';

export const cityLife: GameInfo = {
  id: 'cityLife',
  name: 'City Life',
  description: 'Roleplay to simulate adulthood and entrepreneurship - placed in St. Louis.',
  icon: '🏙️',
  category: 'Simulation',
  component: CityLife,
};
