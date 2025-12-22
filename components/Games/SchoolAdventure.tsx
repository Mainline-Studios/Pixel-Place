'use client';

import { useEffect, useRef, useState } from 'react';
import { User } from '@/types';

interface SchoolAdventureProps {
  user: User;
  onClose?: () => void;
}

export default function SchoolAdventure({ user, onClose }: SchoolAdventureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState('Welcome to School Adventure!');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Simple school scene
    const draw = () => {
      // Sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

      // Ground
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

      // School building
      ctx.fillStyle = '#D3D3D3';
      ctx.fillRect(200, 150, 400, 250);
      
      // Roof
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.moveTo(150, 150);
      ctx.lineTo(400, 80);
      ctx.lineTo(650, 150);
      ctx.closePath();
      ctx.fill();

      // Windows
      ctx.fillStyle = '#4169E1';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(250 + i * 120, 200, 60, 80);
      }

      // Door
      ctx.fillStyle = '#654321';
      ctx.fillRect(380, 320, 40, 80);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText('School Adventure', canvas.width / 2, 50);
      ctx.fillText('School Adventure', canvas.width / 2, 50);

      // Instructions
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText('Explore the school and collect items!', canvas.width / 2, canvas.height - 50);
    };

    draw();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#1a1a1a',
      padding: '24px',
      overflow: 'auto',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>🏫 School Adventure</h3>
        {onClose && (
          <button onClick={onClose} style={{ 
            padding: '8px 16px', 
            fontSize: '14px',
            background: '#00a2ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Close
          </button>
        )}
      </div>

      <div style={{
        background: '#2a2a2a',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            maxWidth: '800px',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            border: '2px solid #333',
            borderRadius: '8px'
          }} 
        />
      </div>

      <div style={{
        background: '#2a2a2a',
        borderRadius: '8px',
        padding: '16px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '16px' }}>{message}</p>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#999' }}>
          Use WASD or Arrow Keys to move • Space to interact
        </p>
      </div>
    </div>
  );
}



