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
}

export default class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game failed to load:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred. Try again or choose another game.'}
          </p>
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
