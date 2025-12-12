'use client';

import { useState, useEffect } from 'react';
import { Accessory, Skin } from '@/types';
import { getSkins, findSkin } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';

interface Accessory3DThumbnailProps {
  accessory: Accessory;
  width?: number;
  height?: number;
}

export default function Accessory3DThumbnail({ accessory, width = 80, height = 80 }: Accessory3DThumbnailProps) {
  const [skins, setSkins] = useState<Skin[]>([]);

  useEffect(() => {
    const loadSkins = async () => {
      const skinsData = await getSkins();
      setSkins(skinsData);
    };
    loadSkins();
  }, []);

  // Get default skin to show character wearing the accessory
  const defaultSkin = findSkin(skins, 'starter_classic');
  
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


