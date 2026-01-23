'use client';

import React, { useState, useEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';

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
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:18',message:'ErrorBoundary caught error',data:{error:error.message,stack:error.stack,componentStack:errorInfo.componentStack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '20px', color: '#fff', background: '#1a1d29'}}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({hasError: false, error: null})}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user } = useUser();
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:40',message:'AppContent render',data:{hasUser:!!user,userId:user?.username,willRenderDashboard:!!user,willRenderLogin:!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [user]);
  // #endregion

  return (
    <>
      {user ? <Dashboard user={user} /> : <Login />}
      <InstallPrompt />
    </>
  );
}

export default function Home() {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:65',message:'Home component render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }, []);
  // #endregion
  
  // Catch any unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:70',message:'Unhandled error',data:{message:event.message,filename:event.filename,lineno:event.lineno,colno:event.colno,error:event.error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
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
