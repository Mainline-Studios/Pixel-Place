'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { PixelPlaceAPI } from '@/lib/pixelPlaceAPI';

interface GymPumpEngineProps {
  onClose?: () => void;
  user?: any;
}

declare global {
  interface Window {
    GymPumpEngine?: any;
    pixelPlaceAPI?: PixelPlaceAPI;
  }
}

export default function GymPumpEngine({ onClose, user }: GymPumpEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const apiRef = useRef<PixelPlaceAPI | null>(null);
  const { user: contextUser } = useUser();
  const currentUser = user || contextUser;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState<{ power: number; coins: number; level: number } | null>(null);

  // Load game engine scripts dynamically
  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        '/gym-pump/js/engine/GameEngine.js',
        '/gym-pump/js/engine/Physics.js',
        '/gym-pump/js/engine/Renderer.js',
        '/gym-pump/js/entities/Player.js',
        '/gym-pump/js/entities/Platform.js',
        '/gym-pump/js/entities/Weight.js',
        '/gym-pump/js/entities/VIPPlatform.js',
        '/gym-pump/js/levels/LevelManager.js',
        '/gym-pump/js/api/PixelPlaceAPI.js',
        '/gym-pump/src/game/GymPumpEngine.js'
      ];

      // Check if already loaded
      if (typeof window.GymPumpEngine !== 'undefined') {
        return;
      }

      // Try to load scripts (will fail silently if files don't exist)
      for (const src of scripts) {
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => {
              // Script not found - that's okay, might be loaded another way
              resolve(null);
            };
            document.head.appendChild(script);
          });
        } catch (e) {
          // Ignore errors - files might not exist yet
        }
      }
    };

    loadScripts();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !currentUser) return;

    const initGame = async () => {
      try {
        // Initialize PixelPlace API
        const api = new PixelPlaceAPI('gym-pump', currentUser.username);
        apiRef.current = api;
        window.pixelPlaceAPI = api;

        // Connect to game
        await api.connectGame('gym-pump');

        // Wait a bit for scripts to load if needed
        let attempts = 0;
        while (typeof window.GymPumpEngine === 'undefined' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        // Check if GymPumpEngine is available (loaded via script tags)
        if (typeof window.GymPumpEngine !== 'undefined') {
          // Initialize the game engine
          const canvas = canvasRef.current;
          const gymPumpEngine = new window.GymPumpEngine(canvas, {
            connectGame: (gameId: string) => api.connectGame(gameId),
            sendGameScore: (gameId: string, data: any) => api.sendGameScore(gameId, data),
            getGameLeaderboard: (gameId: string, limit: number) => api.getGameLeaderboard(gameId, limit),
            syncGameProgress: (gameId: string, data: any) => api.syncGameProgress(gameId, data)
          });

          await gymPumpEngine.init();
          engineRef.current = gymPumpEngine;

          // Set up score polling
          const scoreInterval = setInterval(() => {
            if (gymPumpEngine.getScore) {
              const currentScore = gymPumpEngine.getScore();
              setScore(currentScore);
            }
          }, 1000);

          setIsLoading(false);

          // Cleanup
          return () => {
            clearInterval(scoreInterval);
            if (gymPumpEngine.destroy) {
              gymPumpEngine.destroy();
            }
          };
        } else {
          // Game engine not loaded - show instructions
          setError('Gym Pump Engine files not found. Please add the game engine files to your project.');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error initializing Gym Pump:', err);
        setError(err.message || 'Failed to initialize game');
        setIsLoading(false);
      }
    };

    const cleanup = initGame();

    return () => {
      if (engineRef.current && engineRef.current.destroy) {
        try {
          engineRef.current.destroy();
        } catch (e) {
          console.error('Error destroying game engine:', e);
        }
      }
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn();
        });
      }
    };
  }, [currentUser]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (engineRef.current && engineRef.current.resize) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        engineRef.current.resize(width, height);
      } else if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to play Gym Pump.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Loading Screen */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#181818',
            zIndex: 15000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '20px' }}>💪</div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Gym Pump</div>
          <div style={{ fontSize: '14px', color: '#999' }}>Loading game engine...</div>
        </div>
      )}

      {/* Error Screen */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 16000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <div
            style={{
              background: '#1a1a1a',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              border: '2px solid #ff4444',
              boxShadow: '0 8px 32px rgba(255, 68, 68, 0.3)'
            }}
          >
            <h2 style={{ color: '#ff4444', marginBottom: '16px', fontSize: '24px' }}>
              ⚠️ Game Engine Not Found
            </h2>
            <div
              style={{
                color: '#fff',
                marginBottom: '20px',
                fontSize: '16px',
                lineHeight: '1.6',
                backgroundColor: '#2a2a2a',
                padding: '16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {error}
            </div>
            <div style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>
              <strong>To integrate Gym Pump:</strong>
              <br />
              1. Copy the Gym Pump engine files to your project
              <br />
              2. Include them in your HTML or load them dynamically
              <br />
              3. The engine should expose a global GymPumpEngine class
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        id="gymPumpCanvas"
        width={1280}
        height={720}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />

      {/* Score Display */}
      {score && !isLoading && !error && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            zIndex: 10001
          }}
        >
          <div>Power: {score.power}</div>
          <div>Coins: {score.coins}</div>
          <div>Level: {score.level}</div>
        </div>
      )}

      {/* Close Button */}
      {onClose && !isLoading && !error && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            background: 'rgba(255, 68, 68, 0.8)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10001
          }}
        >
          Close (ESC)
        </button>
      )}
    </div>
  );
}

