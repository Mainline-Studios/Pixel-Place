import ChessGame from '@/components/Games/Chess';
import type { GameInfo } from './types';

export const chess: GameInfo = {
  id: 'chess',
  name: 'Chess',
  description: 'Classic chess game - challenge yourself or play online!',
  icon: '♟️',
  category: 'Strategy',
  component: ChessGame,
  thumbnail: '/images/games/chess.svg',
};
