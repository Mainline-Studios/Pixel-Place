'use client';

import React, { useState, useEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';
<<<<<<< HEAD
import SplashScreen from '@/components/SplashScreen';
import BreakReminder from '@/components/BreakReminder';
import { getPlaytimeTracker } from '@/lib/playtimeTracker';
import { User } from '@/types';
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

// Error boundary for catching render errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
<<<<<<< HEAD
    console.error('ErrorBoundary caught error:', error, errorInfo);
=======
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:18',message:'ErrorBoundary caught error',data:{error:error.message,stack:error.stack,componentStack:errorInfo.componentStack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  }

  render() {
    if (this.state.hasError) {
      return (
<<<<<<< HEAD
        <div style={{padding: '20px', color: '#fff', background: '#1a1d29', minHeight: '100vh'}}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <pre style={{fontSize: '12px', overflow: 'auto', maxHeight: '400px'}}>{this.state.error?.stack}</pre>
          <button onClick={() => this.setState({hasError: false, error: null})} style={{padding: '10px 20px', marginTop: '10px', cursor: 'pointer'}}>Try again</button>
=======
        <div style={{padding: '20px', color: '#fff', background: '#1a1d29'}}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({hasError: false, error: null})}>Try again</button>
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user } = useUser();
<<<<<<< HEAD
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const prevUserRef = React.useRef<User | null>(null);

  // Show popup when user signs in and start playtime tracking
  useEffect(() => {
    if (user && !prevUserRef.current) {
      // User just signed in
      const offlineStatus = typeof window !== 'undefined' && sessionStorage.getItem('pixelPlaceOffline') === 'true';
      setIsOffline(offlineStatus);
      setPopupMessage(offlineStatus 
        ? 'Not connected. You can still play offline games! Your data will sync when you reconnect.' 
        : 'Logged in Successfully');
      setShowPopup(true);
      // Auto-hide popup after 4 seconds for offline mode (longer to read message)
      setTimeout(() => {
        setShowPopup(false);
      }, offlineStatus ? 5000 : 3000);

      // Start playtime tracking
      if (typeof window !== 'undefined') {
        const tracker = getPlaytimeTracker();
        tracker.startTracking(user.username);
      }
    } else if (!user && prevUserRef.current) {
      // User logged out - stop tracking
      const tracker = getPlaytimeTracker();
      tracker.stopTracking();
    }
    prevUserRef.current = user;

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        const tracker = getPlaytimeTracker();
        tracker.stopTracking();
      }
    };
  }, [user]);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <>
          {user ? <Dashboard user={user} /> : <Login />}
          <InstallPrompt />
          {user && <BreakReminder />}
        </>
      )}
      
      {/* Status Popup */}
      {showPopup && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: isOffline ? '#ff9800' : '#4caf50',
            color: '#ffffff',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 10000,
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {isOffline ? '⚠️ Not Connected' : '✅ Logged in Successfully'}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {popupMessage}
              </div>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
      
      {/* Ensure background is visible - avoid pure black */}
      <style jsx global>{`
        html, body {
          background: #1a1d29 !important;
          background-image: radial-gradient(circle at 20% 20%, #2a2e3d 0%, #1a1d29 60%) !important;
          color: #f2f2f5 !important;
          min-height: 100vh;
        }
      `}</style>
=======
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:40',message:'AppContent render',data:{hasUser:!!user,userId:user?.username,willRenderDashboard:!!user,willRenderLogin:!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [user]);
  // #endregion

  return (
    <>
      {user ? <Dashboard user={user} /> : <Login />}
      <InstallPrompt />
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    </>
  );
}

export default function Home() {
<<<<<<< HEAD
  // Catch any unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
=======
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:65',message:'Home component render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }, []);
  // #endregion
  
  // Catch any unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:70',message:'Unhandled error',data:{message:event.message,filename:event.filename,lineno:event.lineno,colno:event.colno,error:event.error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
