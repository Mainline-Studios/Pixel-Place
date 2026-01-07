'use client';

import { useEffect, useRef } from 'react';

interface TagGameThumbnailProps {
  width?: number;
  height?: number;
}

export default function TagGameThumbnail({ width = 160, height = 120 }: TagGameThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Background (playground/field)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#87CEEB'); // Sky
    bgGradient.addColorStop(0.6, '#90EE90'); // Grass
    bgGradient.addColorStop(1, '#228B22'); // Dark grass
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw players (colored circles)
    const players = [
      { x: width * 0.25, y: height * 0.4, color: '#4a90e2', isIt: true }, // "It" player (blue, larger)
      { x: width * 0.5, y: height * 0.6, color: '#2ecc71', isIt: false },
      { x: width * 0.75, y: height * 0.35, color: '#e74c3c', isIt: false },
      { x: width * 0.4, y: height * 0.75, color: '#f39c12', isIt: false },
    ];

    players.forEach((player) => {
      // Player circle
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.isIt ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // "It" indicator (crown or highlight)
      if (player.isIt) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 15);
        ctx.lineTo(player.x - 4, player.y - 10);
        ctx.lineTo(player.x, player.y - 8);
        ctx.lineTo(player.x + 4, player.y - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Movement trail (dotted line)
      if (!player.isIt) {
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + 15, player.y - 10);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText('Tag', width / 2, height - 10);
    ctx.fillText('Tag', width / 2, height - 10);
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

