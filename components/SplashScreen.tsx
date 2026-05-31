'use client';

import StartupSplashAnimation from '@/components/StartupSplashAnimation';

interface SplashScreenProps {
  onComplete: () => void;
  audioEnabled?: boolean;
}

export default function SplashScreen({ onComplete, audioEnabled = true }: SplashScreenProps) {
  return <StartupSplashAnimation onComplete={onComplete} audioEnabled={audioEnabled} />;
}
