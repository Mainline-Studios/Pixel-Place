'use client';

import { useEffect } from 'react';
import { useSound } from '@/contexts/SoundContext';

/**
 * Attaches sound effects to key UI interactions.
 * Tab nav and primary buttons get click; game cards, etc. get click.
 */
export default function SoundEffects() {
  const { playClick } = useSound();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Skip tab nav (has its own playTabSwitch), handle .btn and game cards
      if (target.closest?.('.header-nav')) return;
      const isPrimaryBtn = target.closest?.('.btn');
      const isGameCard = target.closest?.('.game-card-enhanced');
      if (isPrimaryBtn || isGameCard) playClick();
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [playClick]);

  return null;
}
