'use client';

import { Accessory } from '@/types';
import { getSkins } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';

interface Accessory3DThumbnailProps {
  accessory: Accessory;
  width?: number;
  height?: number;
}

export default function Accessory3DThumbnail({ accessory, width = 80, height = 80 }: Accessory3DThumbnailProps) {
  // Get default skin to show character wearing the accessory
  const skins = getSkins();
  const defaultSkin = skins.find(s => s.id === 'starter_classic') || skins[0];
  
  // Create a skin object with just this accessory for preview
  const previewSkin = defaultSkin ? {
    ...defaultSkin,
    accessories: [accessory]
  } : null;

  if (!previewSkin) {
    return (
      <div style={{
        width: `${width}px`,
        height: `${height}px`,
        background: '#333',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontSize: '12px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff'
    }}>
      <Avatar3DViewer
        skin={previewSkin}
        width={width}
        height={height}
        interactive={true}
        animation="idle"
      />
    </div>
  );
}


