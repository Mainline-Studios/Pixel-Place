'use client';

import StartupSplashAnimation from '@/components/StartupSplashAnimation';

export type SplashVariant = 'full' | 'quick';

interface SplashScreenProps {
  onComplete: () => void;
  variant?: SplashVariant;
}

/** First visit / logged-out: dot-burst canvas → Mainline → Pixel Place. */
export default function SplashScreen({ onComplete, variant = 'full' }: SplashScreenProps) {
  return <StartupSplashAnimation onComplete={onComplete} compact={variant === 'quick'} />;
}
