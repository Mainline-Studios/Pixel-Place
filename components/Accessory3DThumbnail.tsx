'use client';

import { Accessory } from '@/types';
import Accessory3DViewer from '@/components/Accessory3DViewer';

interface Accessory3DThumbnailProps {
  accessory: Accessory;
  skin?: any;
  equippedAccessories?: any;
  width?: number;
  height?: number;
}

export default function Accessory3DThumbnail({ accessory, width = 80, height = 80 }: Accessory3DThumbnailProps) {
  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent'
    }}>
      <Accessory3DViewer
        accessory={accessory}
        width={width}
        height={height}
        interactive={true}
      />
    </div>
  );
}





