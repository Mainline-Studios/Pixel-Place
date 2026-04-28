'use client';

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'error':
        return {
          background: '#5a1f1f',
          border: '1px solid #8b2d2d',
          color: '#ff6b6b'
        };
      case 'success':
        return {
          background: '#1f5a1f',
          border: '1px solid #2d8b2d',
          color: '#6bff6b'
        };
      case 'warning':
        return {
          background: '#5a4a1f',
          border: '1px solid #8b7d2d',
          color: '#ffd46b'
        };
      default:
        return {
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          color: 'var(--text)'
        };
    }
  };

  return (
    <div
      className="toast-item"
      style={{
        ...getToastStyles(),
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 10000
      }}
    >
      <span style={{ flex: 1, fontSize: '14px' }}>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          marginLeft: '12px',
          fontSize: '20px',
          lineHeight: '1',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for toast events
    const handleToast = (event: CustomEvent<Omit<Toast, 'id'>>) => {
      const newToast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...event.detail
      };
      setToasts(prev => [...prev, newToast]);
    };

    window.addEventListener('showToast' as any, handleToast as EventListener);
    return () => {
      window.removeEventListener('showToast' as any, handleToast as EventListener);
    };
  }, []);

  const handleClose = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} onClose={handleClose} />
        </div>
      ))}
    </div>
  );
}

// Helper function to show a toast
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  const event = new CustomEvent('showToast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
}
