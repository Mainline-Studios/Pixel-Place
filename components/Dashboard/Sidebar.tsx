'use client';

import { User, Skin, Accessory } from '@/types';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { FilteredUsername } from '@/components/FilteredText';
import { formatGenderForDisplay } from '@/lib/formatGenderDisplay';
import LocalizeText from '@/components/LocalizeText';
import { useStyle } from '@/components/StyleProvider';
import { useState, useEffect } from 'react';

interface SidebarProps {
  user: User;
  onNavigate?: (tab: 'friends' | 'coins' | 'settings' | 'report') => void;
}

export default function Sidebar({ user, onNavigate }: SidebarProps) {
  const { style } = useStyle();
  const loudSidebar = style === 'maximalist';
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

  const equippedSkin = skins.find(s => s.id === user.equippedSkin) || skins.find(s => s.id === 'pixel_placer') || skins[0];
  // Get equipped face if available
  const equippedFace = user.equippedFace ? skins.find(s => s.id === user.equippedFace && s.isFace) : null;  // equippedAccessories is an object, not an array: { hat: 'id', glasses: 'id', ... }
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
      <div className="info-name"><FilteredUsername username={user.username || ''} currentUsername={user.username || ''} /></div>
      <div className="info-role">
        <LocalizeText text="Role:" /> {user.role}
      </div>
      <div className="info-gender">
        <LocalizeText text="Gender:" /> {formatGenderForDisplay(user.gender)}
      </div>
      <div className="sidebar-sep"></div>
      {loudSidebar && (
        <div className="sidebar-max-extra" aria-hidden>
          <div className="sidebar-max-extra-title">Loot stash</div>
          <div className="sidebar-max-extra-row">
            <span className="sidebar-max-pill">🪙 {Number(user.coins ?? 0).toLocaleString('en-US')}</span>
            <span className="sidebar-max-pill">{String(user.role || 'player').toUpperCase()}</span>
          </div>
          <div className="sidebar-max-extra-quote">&quot;More pixels, more problems.&quot;</div>
        </div>
      )}
      <div 
        className="sidebar-link" 
        onClick={() => onNavigate?.('friends')}
        style={{ cursor: 'pointer' }}
      >
        <LocalizeText text="Friends" />
      </div>
      <div 
        className="sidebar-link" 
        onClick={() => onNavigate?.('coins')}
        style={{ cursor: 'pointer' }}
      >
        <LocalizeText text="Coins" />
      </div>
      <div 
        className="sidebar-link" 
        onClick={() => onNavigate?.('settings')}
        style={{ cursor: 'pointer' }}
      >
        <LocalizeText text="Settings" />
      </div>
      <div
        className="sidebar-link"
        onClick={() => onNavigate?.('report')}
        style={{ cursor: 'pointer' }}
      >
        <LocalizeText text="Safety" />
      </div>
    </aside>
  );
}




