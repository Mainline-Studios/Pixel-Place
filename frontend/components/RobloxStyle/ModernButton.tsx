'use client';

import React from 'react';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  style?: React.CSSProperties;
}

/**
 * Modern Roblox-style button component
 * Features rounded corners, gradients, shadows, and hover effects
 */
export default function ModernButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  style = {}
}: ModernButtonProps) {
  const variants = {
    primary: {
      background: 'linear-gradient(145deg, #00a2ff 0%, #007acc 100%)',
      hover: 'linear-gradient(145deg, #00b3ff 0%, #0088dd 100%)',
      shadow: '0 6px 20px rgba(0, 162, 255, 0.4)',
      hoverShadow: '0 8px 24px rgba(0, 162, 255, 0.6)'
    },
    secondary: {
      background: 'linear-gradient(145deg, #6c757d 0%, #5a6268 100%)',
      hover: 'linear-gradient(145deg, #7d848a 0%, #6a7278 100%)',
      shadow: '0 6px 20px rgba(108, 117, 125, 0.4)',
      hoverShadow: '0 8px 24px rgba(108, 117, 125, 0.6)'
    },
    success: {
      background: 'linear-gradient(145deg, #28a745 0%, #218838 100%)',
      hover: 'linear-gradient(145deg, #34ce57 0%, #28a745 100%)',
      shadow: '0 6px 20px rgba(40, 167, 69, 0.4)',
      hoverShadow: '0 8px 24px rgba(40, 167, 69, 0.6)'
    },
    danger: {
      background: 'linear-gradient(145deg, #dc3545 0%, #c82333 100%)',
      hover: 'linear-gradient(145deg, #e4606d 0%, #dc3545 100%)',
      shadow: '0 6px 20px rgba(220, 53, 69, 0.4)',
      hoverShadow: '0 8px 24px rgba(220, 53, 69, 0.6)'
    },
    warning: {
      background: 'linear-gradient(145deg, #ffc107 0%, #e0a800 100%)',
      hover: 'linear-gradient(145deg, #ffcd39 0%, #ffc107 100%)',
      shadow: '0 6px 20px rgba(255, 193, 7, 0.4)',
      hoverShadow: '0 8px 24px rgba(255, 193, 7, 0.6)'
    }
  };

  const sizes = {
    small: {
      padding: '8px 16px',
      fontSize: '13px',
      borderRadius: '8px'
    },
    medium: {
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: '10px'
    },
    large: {
      padding: '16px 32px',
      fontSize: '18px',
      borderRadius: '12px'
    }
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...sizeStyle,
        background: disabled ? 'linear-gradient(145deg, #6c757d 0%, #5a6268 100%)' : variantStyle.background,
        color: '#ffffff',
        border: 'none',
        fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : variantStyle.shadow,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: icon ? '8px' : '0',
        width: fullWidth ? '100%' : 'auto',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = variantStyle.hover;
          e.currentTarget.style.boxShadow = variantStyle.hoverShadow;
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = variantStyle.background;
          e.currentTarget.style.boxShadow = variantStyle.shadow;
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        }
      }}
    >
      {icon && <span style={{ fontSize: '1.2em' }}>{icon}</span>}
      {children}
      {/* Shine effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          transition: 'left 0.5s'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.left = '100%';
          }
        }}
      />
    </button>
  );
}
