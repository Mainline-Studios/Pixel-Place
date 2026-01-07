'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was just installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '90%',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Install Pixel Place</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Add to home screen for a better experience
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'white',
            color: '#4a90e2',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Later
        </button>
      </div>
    </div>
  );
}










