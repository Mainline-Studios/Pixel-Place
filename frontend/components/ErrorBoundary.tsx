'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Image from 'next/image';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#0f1117',
          color: '#f2f2f5',
        }}>
          <Image
            src="/error-icon.png"
            alt="Something went wrong"
            width={120}
            height={120}
            style={{ marginBottom: '24px', borderRadius: '16px' }}
          />
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#f2f2f5',
          }}>
            Oops! Something went wrong
          </h1>
          <p style={{
            fontSize: '16px',
            marginBottom: '24px',
            color: '#8b90a8',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            We experienced an error and are currently in the process of fixing it.
          </p>
          <button
            onClick={() => this.setState({ showDetails: !showDetails })}
            style={{
              background: 'transparent',
              border: '1px solid #3a3f57',
              color: '#8b90a8',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            {showDetails ? 'Hide error' : 'View error'}
          </button>
          {showDetails && error && (
            <pre style={{
              maxWidth: '90%',
              maxHeight: '200px',
              overflow: 'auto',
              background: '#1a1d24',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#c9cdd8',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: '24px',
            }}>
              {error.message}
              {error.stack && `\n\n${error.stack}`}
              {errorInfo?.componentStack && `\n\nComponent stack:\n${errorInfo.componentStack}`}
            </pre>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #2a2f45 0%, #3a415e 100%)',
                border: '1px solid #3a3f57',
                color: '#f2f2f5',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(0, 0, 0, .8), 0 0 20px rgba(255, 255, 255, .07)',
              }}
            >
              Try again
            </button>
            <a
              href="/games"
              onClick={() => {
                try { sessionStorage.setItem('pixelPlaceSkipSplash', '1'); } catch {}
              }}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #00aa88 0%, #008866 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0, 170, 136, 0.4)',
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
