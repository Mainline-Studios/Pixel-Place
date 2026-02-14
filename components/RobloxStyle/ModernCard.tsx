'use client';

import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: React.CSSProperties;
}

/**
 * Modern Roblox-style card component
 * Features glassmorphism, gradients, and smooth shadows
 */
export default function ModernCard({
  children,
  title,
  icon,
  variant = 'default',
  style = {}
}: ModernCardProps) {
  const variants = {
    default: {
      background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    },
    elevated: {
      background: 'linear-gradient(145deg, rgba(30, 30, 50, 0.98) 0%, rgba(25, 35, 65, 0.98) 100%)',
      border: '2px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
    },
    outlined: {
      background: 'rgba(26, 26, 46, 0.8)',
      border: '3px solid rgba(0, 162, 255, 0.5)',
      boxShadow: '0 4px 16px rgba(0, 162, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }
  };

  const variantStyle = variants[variant];

  return (
    <div
      style={{
        ...variantStyle,
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Shine overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          opacity: 0.5
        }}
      />
      
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {icon && (
            <span style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
              {icon}
            </span>
          )}
          <h3
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(180deg, #ffffff 0%, #bdc3c7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {title}
          </h3>
        </div>
      )}
      
      {children}
    </div>
  );
}
