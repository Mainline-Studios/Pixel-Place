'use client';

import { User, Skin, Accessory } from '@/types';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { useState, useEffect } from 'react';

interface SidebarProps {
  user: User;
  onNavigate?: (tab: string) => void;
}

export default function Sidebar({ user, onNavigate }: SidebarProps) {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [skinsData, accessoriesData] = await Promise.all([
        getSkins(),
        getAccessories()
      ]);
      setSkins(Array.isArray(skinsData) ? skinsData : []);
      setAccessories(Array.isArray(accessoriesData) ? accessoriesData : []);
    };
    loadData();
  }, []);

  const equippedSkin = skins.find(s => s.id === user.equippedSkin) || skins.find(s => s.id === 'starter_classic') || skins[0];
  // Get equipped face if available
  const equippedFace = user.equippedFace ? skins.find(s => s.id === user.equippedFace && s.isFace) : null;
  // equippedAccessories is an object, not an array: { hat: 'id', glasses: 'id', ... }
  const equippedAccessoriesList = Object.values(user.equippedAccessories || {}).map(id => 
    accessories.find(a => a.id === id)
  ).filter(Boolean) as any[];

  // Merge equipped accessories into skin for display
  const skinWithAccessories = equippedSkin ? {
    ...equippedSkin,
    accessories: [
      ...(equippedSkin.accessories || []),
      ...equippedAccessoriesList
    ]
  } : null;

  return (
    <aside className="sidebar-card">
      <div className="avatar-showcase" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        background: 'transparent'
      }}>
        {skinWithAccessories && (
          <Avatar3DViewer
            skin={skinWithAccessories}
            width={180}
            height={180}
            interactive={true}
            animation={skinWithAccessories.defaultAnimation || 'idle'}
            equippedFace={equippedFace || undefined}
          />
        )}
      </div>
      <div className="info-name">{user.username}</div>
      <div className="info-role">Role: {user.role}</div>
      <div className="info-gender">Gender: Boy</div>
      <div className="sidebar-sep"></div>
      <div 
        className="sidebar-link" 
        onClick={() => onNavigate?.('friends')}
        style={{ cursor: 'pointer' }}
      >
        Friends
      </div>
      <div 
        className="sidebar-link" 
        onClick={() => onNavigate?.('coins')}
        style={{ cursor: 'pointer' }}
      >
        Coins
      </div>
      <div 
        className="sidebar-link" 
        onClick={() => onNavigate?.('settings')}
        style={{ cursor: 'pointer' }}
      >
        Settings
      </div>
    </aside>
  );
}




