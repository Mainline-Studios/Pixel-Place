'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onBack?: () => void;
  gameName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export default class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game failed to load:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { error, showDetails } = this.state;
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px',
          background: 'var(--panel)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff4d4d', marginBottom: '16px', fontSize: '20px' }}>
            Game failed to load
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', maxWidth: '400px' }}>
            {error?.message || 'An unexpected error occurred. Try again or choose another game.'}
          </p>
          <button
            onClick={() => this.setState({ showDetails: !showDetails })}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            {showDetails ? 'Hide error' : 'View error'}
          </button>
          {showDetails && error && (
            <pre style={{
              width: '100%',
              maxHeight: '150px',
              overflow: 'auto',
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: '16px',
            }}>
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          )}
          {this.props.onBack && (
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onBack?.();
              }}
              style={{
                padding: '12px 24px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              ← Back
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
