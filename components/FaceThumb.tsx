'use client';

import { useState, useEffect, useRef } from 'react';
import { Skin } from '@/types';
import Avatar3DViewer from './Avatar3DViewer';
import Skin2DPreview from './Skin2DPreview';

interface FaceThumbProps {
  face: Skin;
  width?: number;
  height?: number;
  previewMode?: '2d' | '3d';
}

/**
 * FaceThumb - Shows a face on a generic avatar body for preview
 * Faces are applied to the head only, body uses default colors
 */
export default function FaceThumb({ face, width = 80, height = 80, previewMode = '3d' }: FaceThumbProps) {
  const [has3DError, setHas3DError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);
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

  useEffect(() => {
    if (previewMode === '3d') {
      setHas3DError(false);
      setIs3DReady(false);
    }
  }, [previewMode, face?.id]);

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

  if (!face) {
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
        Loading...
      </div>
    );
  }

  const show3D = previewMode === '3d' && isVisible && !has3DError;
  const showSpinner = previewMode === '3d' && isVisible && !is3DReady && !has3DError;
  const show2D = previewMode === '2d' || !is3DReady || has3DError;

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
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      {show2D && <Skin2DPreview skin={previewSkin} width={width} height={height} />}
      {show3D && (
        <div style={{ position: 'absolute', inset: 0, opacity: is3DReady ? 1 : 0, transition: 'opacity 0.2s' }}>
          <Avatar3DViewer
            skin={previewSkin}
            width={width}
            height={height}
            interactive={false}
            animation={face.defaultAnimation || 'idle'}
            onReady={() => setIs3DReady(true)}
            onError={() => setHas3DError(true)}
          />
        </div>
      )}
      {showSpinner && (
        <div className="avatar-preview-spinner">
          <div className="avatar-preview-spinner-ring" />
        </div>
      )}
    </div>
  );
}
