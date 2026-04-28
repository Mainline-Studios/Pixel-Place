'use client';

import { useEffect, useRef } from 'react';

interface SnakeGameThumbnailProps {
  width?: number;
  height?: number;
}

export default function SnakeGameThumbnail({ width = 160, height = 120 }: SnakeGameThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Dark background (game board)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Grid pattern
    const gridSize = 8;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw snake (green segments)
    const snakeSegments = [
      { x: width * 0.3, y: height * 0.5 },
      { x: width * 0.35, y: height * 0.5 },
      { x: width * 0.4, y: height * 0.5 },
      { x: width * 0.45, y: height * 0.5 },
      { x: width * 0.5, y: height * 0.5 },
    ];

    snakeSegments.forEach((segment, index) => {
      if (index === 0) {
        // Head (blue)
        ctx.fillStyle = '#4a90e2';
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, 6, 0, Math.PI * 2);
        ctx.fill();
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4a90e2';
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Body (green)
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(segment.x - 5, segment.y - 5, 10, 10);
      }
    });

    // Food (red circle)
    const foodX = width * 0.7;
    const foodY = height * 0.5;
    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(foodX, foodY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(foodX, foodY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Score text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('Score: 0', 8, 15);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText('Snake', width / 2, height - 8);
    ctx.fillText('Snake', width / 2, height - 8);
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

