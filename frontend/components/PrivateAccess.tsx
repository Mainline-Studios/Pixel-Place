'use client';

import { useState, useEffect } from 'react';

interface PrivateAccessProps {
  children: React.ReactNode;
}

export default function PrivateAccess({ children }: PrivateAccessProps) {
  // Get access password from environment or use default
  const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'pixelplace2026';
  
  // Check auth immediately - no loading state needed
  const checkAuth = () => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage?.getItem('pixelPlaceAccess') === 'granted';
    } catch {
      return false;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Update auth status on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = checkAuth();
      if (auth) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ACCESS_PASSWORD) {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('pixelPlaceAccess', 'granted');
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error saving session:', error);
        setIsAuthenticated(true);
      }
    } else {
      setError('Incorrect access password. Please contact the owner for access.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #1a2340 50%, #0f1625 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'rgba(26, 29, 41, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 28px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 170, 255, 0.2)',
          maxWidth: '400px',
          width: '90%',
          border: '1px solid rgba(0, 170, 255, 0.3)',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{
            color: '#00aaff',
            marginBottom: '8px',
            fontSize: '32px',
            fontWeight: '900',
            letterSpacing: '4px',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(0, 170, 255, 0.8), 0 0 20px rgba(0, 170, 255, 0.6), 0 0 30px rgba(0, 170, 255, 0.4)'
          }}>
            🔒 Private Access
          </h1>
          <p style={{
            color: '#aaa',
            marginBottom: '24px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            This app is private. Enter the access password to continue.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access password"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                background: 'rgba(15, 20, 35, 0.8)',
                border: '1px solid rgba(0, 170, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            {error && (
              <div style={{
                color: '#ff4444',
                fontSize: '14px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#00aaff',
                color: '#fff',
                border: '1px solid rgba(0, 170, 255, 0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 0 20px rgba(0, 170, 255, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#00bfff';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 170, 255, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#00aaff';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 170, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Access App
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

