'use client';

import { useState, useEffect, useRef } from 'react';
import { Skin } from '@/types';
import Avatar3DViewer from './Avatar3DViewer';

interface FaceThumbProps {
  face: Skin;
  width?: number;
  height?: number;
}

/**
 * FaceThumb - Shows a face on a generic avatar body for preview
 * Faces are applied to the head only, body uses default colors
 */
export default function FaceThumb({ face, width = 80, height = 80 }: FaceThumbProps) {
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Lazy load - only render when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Create a preview skin that combines the face with a generic body
  // Ensure face has colors, use defaults if missing
  const previewSkin: Skin = {
    ...face,
    colors: {
      head: face.colors?.head || '#f4c2a1', // Use face color for head
      torso: '#4d536f', // Generic body color
      arm: '#3a3f56', // Generic arm color
      legs: '#3a3f56' // Generic leg color
    }
  };

  if (!face || hasError) {
    return (
      <div
        ref={containerRef}
        style={{
          width,
          height,
          background: '#333',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '10px'
        }}
      >
        {hasError ? 'Error' : 'Loading...'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      {isVisible ? (
        <Avatar3DViewer
          skin={previewSkin}
          width={width}
          height={height}
          interactive={false}
          animation={face.defaultAnimation || 'idle'}
        />
      ) : (
        <div style={{ width, height, background: '#333', borderRadius: '8px' }} />
      )}
    </div>
  );
}
