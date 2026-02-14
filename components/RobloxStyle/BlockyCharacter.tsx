'use client';

import React from 'react';

interface BlockyCharacterProps {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  color?: string;
  shirtColor?: string;
  pantsColor?: string;
  hatColor?: string;
  size?: 'small' | 'medium' | 'large';
  animation?: 'idle' | 'walk' | 'jump' | 'wave';
}

/**
 * Roblox-style blocky character component
 * Creates a 3D blocky avatar similar to Roblox characters
 */
export default function BlockyCharacter({
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
  scale = 1,
  color = '#ff6b6b',
  shirtColor = '#4ecdc4',
  pantsColor = '#45b7d1',
  hatColor = '#f9ca24',
  size = 'medium',
  animation = 'idle'
}: BlockyCharacterProps) {
  const sizeMap = {
    small: 0.8,
    medium: 1,
    large: 1.2
  };

  const finalScale = scale * sizeMap[size];
  const baseSize = 20 * finalScale;
  const headSize = baseSize * 0.6;
  const torsoWidth = baseSize * 0.5;
  const torsoHeight = baseSize * 0.7;
  const limbSize = baseSize * 0.25;
  const limbLength = baseSize * 0.6;

  const animStyles: Record<string, React.CSSProperties> = {
    idle: {},
    walk: {
      animation: 'walkCycle 0.6s ease-in-out infinite'
    },
    jump: {
      animation: 'jumpCycle 0.5s ease-out'
    },
    wave: {
      animation: 'waveCycle 0.8s ease-in-out infinite'
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translateZ(${position.z}px) rotateY(${rotation.y}deg)`,
        transformStyle: 'preserve-3d',
        width: baseSize,
        height: baseSize * 1.8,
        ...animStyles[animation]
      }}
    >
      <style>{`
        @keyframes walkCycle {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          25% { transform: translateY(-2px) rotateX(2deg); }
          50% { transform: translateY(0px) rotateX(0deg); }
          75% { transform: translateY(-2px) rotateX(-2deg); }
        }
        @keyframes jumpCycle {
          0% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(-30px) scaleY(0.9); }
          100% { transform: translateY(0px) scaleY(1); }
        }
        @keyframes waveCycle {
          0%, 100% { transform: rotateZ(0deg); }
          25% { transform: rotateZ(20deg); }
          50% { transform: rotateZ(-10deg); }
          75% { transform: rotateZ(20deg); }
        }
      `}</style>
      
      {/* Head */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: headSize,
          height: headSize,
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: '4px',
          boxShadow: `
            0 4px 8px rgba(0,0,0,0.3),
            inset 0 2px 4px rgba(255,255,255,0.2),
            inset 0 -2px 4px rgba(0,0,0,0.2)
          `,
          border: '2px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Face */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          {/* Eyes */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#000',
                borderRadius: '50%',
                boxShadow: '0 0 4px rgba(0,0,0,0.5)'
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#000',
                borderRadius: '50%',
                boxShadow: '0 0 4px rgba(0,0,0,0.5)'
              }}
            />
          </div>
          {/* Mouth */}
          <div
            style={{
              width: '12px',
              height: '6px',
              border: '2px solid #000',
              borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              marginTop: '2px'
            }}
          />
        </div>
      </div>

      {/* Hat */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '-8px',
          transform: 'translateX(-50%)',
          width: headSize * 1.1,
          height: headSize * 0.3,
          background: `linear-gradient(135deg, ${hatColor} 0%, ${hatColor}dd 100%)`,
          borderRadius: '4px 4px 0 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.1)'
        }}
      />

      {/* Torso */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: headSize,
          transform: 'translateX(-50%)',
          width: torsoWidth,
          height: torsoHeight,
          background: `linear-gradient(135deg, ${shirtColor} 0%, ${shirtColor}dd 100%)`,
          borderRadius: '4px',
          boxShadow: `
            0 4px 8px rgba(0,0,0,0.3),
            inset 0 2px 4px rgba(255,255,255,0.2),
            inset 0 -2px 4px rgba(0,0,0,0.2)
          `,
          border: '2px solid rgba(255,255,255,0.1)'
        }}
      />

      {/* Arms */}
      <div
        style={{
          position: 'absolute',
          left: '-12px',
          top: headSize + 8,
          width: limbSize,
          height: limbLength,
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.1)',
          transform: 'rotateZ(-15deg)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '-12px',
          top: headSize + 8,
          width: limbSize,
          height: limbLength,
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.1)',
          transform: 'rotateZ(15deg)'
        }}
      />

      {/* Legs */}
      <div
        style={{
          position: 'absolute',
          left: '25%',
          top: headSize + torsoHeight,
          width: limbSize * 0.8,
          height: limbLength,
          background: `linear-gradient(135deg, ${pantsColor} 0%, ${pantsColor}dd 100%)`,
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.1)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '25%',
          top: headSize + torsoHeight,
          width: limbSize * 0.8,
          height: limbLength,
          background: `linear-gradient(135deg, ${pantsColor} 0%, ${pantsColor}dd 100%)`,
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.1)'
        }}
      />
    </div>
  );
}
