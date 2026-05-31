'use client';

import StartupSplashAnimation from '@/components/StartupSplashAnimation';

export type SplashVariant = 'first' | 'quick';

interface SplashScreenProps {
  onComplete: () => void;
  variant?: SplashVariant;
  audioEnabled?: boolean;
}

/** First app open: Mainline presents → dot story → logo → login. */
export default function SplashScreen({
  onComplete,
  variant = 'quick',
  audioEnabled = true,
}: SplashScreenProps) {
  return (
    <StartupSplashAnimation
      onComplete={onComplete}
      firstOpen={variant === 'first'}
      audioEnabled={audioEnabled}
    />
  );
}
