'use client';

import { useEffect, useRef } from 'react';

interface AvatarRunnerThumbnailProps {
  width?: number;
  height?: number;
}

export default function AvatarRunnerThumbnail({ width = 160, height = 120 }: AvatarRunnerThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Background gradient (sky to ground)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#87CEEB'); // Sky blue
    bgGradient.addColorStop(0.7, '#98D8C8'); // Light green
    bgGradient.addColorStop(1, '#2a3a4a'); // Dark ground
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Ground line
    const groundY = height * 0.75;
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Draw running avatar (simple stick figure style)
    const avatarX = width * 0.3;
    const avatarY = groundY - 20;
    
    // Head
    ctx.fillStyle = '#FFDBB3';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY - 35, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.strokeStyle = '#4169E1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(avatarX, avatarY - 27);
    ctx.lineTo(avatarX, avatarY - 5);
    ctx.stroke();
    
    // Arms (running pose)
    ctx.beginPath();
    ctx.moveTo(avatarX, avatarY - 20);
    ctx.lineTo(avatarX - 8, avatarY - 10);
    ctx.moveTo(avatarX, avatarY - 20);
    ctx.lineTo(avatarX + 8, avatarY - 5);
    ctx.stroke();
    
    // Legs (running pose)
    ctx.beginPath();
    ctx.moveTo(avatarX, avatarY - 5);
    ctx.lineTo(avatarX - 6, avatarY + 10);
    ctx.moveTo(avatarX, avatarY - 5);
    ctx.lineTo(avatarX + 6, avatarY + 8);
    ctx.stroke();

    // Coins floating
    for (let i = 0; i < 3; i++) {
      const coinX = width * 0.6 + i * 25;
      const coinY = groundY - 30 - Math.sin(Date.now() / 500 + i) * 5;
      
      // Gold coin
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(coinX, coinY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Coin shine
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(coinX - 2, coinY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Obstacle (red cube)
    const obstacleX = width * 0.8;
    const obstacleY = groundY - 15;
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(obstacleX - 8, obstacleY - 15, 16, 15);
    ctx.strokeStyle = '#CC0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacleX - 8, obstacleY - 15, 16, 15);

    // Score text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Score: 0', 10, 20);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText('Avatar Runner', width / 2, height - 10);
    ctx.fillText('Avatar Runner', width / 2, height - 10);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
}

