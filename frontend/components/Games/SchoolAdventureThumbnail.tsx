'use client';

import { useEffect, useRef } from 'react';

interface SchoolAdventureThumbnailProps {
  width?: number;
  height?: number;
}

export default function SchoolAdventureThumbnail({ width = 160, height = 120 }: SchoolAdventureThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.6);

    // Ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    // School building
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(width * 0.2, height * 0.25, width * 0.6, height * 0.4);
    
    // Roof
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.25);
    ctx.lineTo(width * 0.5, height * 0.1);
    ctx.lineTo(width * 0.9, height * 0.25);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#4169E1';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(width * 0.3 + i * (width * 0.15), height * 0.35, width * 0.08, height * 0.12);
    }

    // Door
    ctx.fillStyle = '#654321';
    ctx.fillRect(width * 0.48, height * 0.55, width * 0.05, height * 0.12);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText('School', width / 2, height - 20);
    ctx.fillText('School', width / 2, height - 20);
    ctx.strokeText('Adventure', width / 2, height - 8);
    ctx.fillText('Adventure', width / 2, height - 8);
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












