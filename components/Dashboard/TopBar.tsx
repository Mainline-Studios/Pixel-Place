'use client';

import { TabType, User, Skin, Accessory } from '@/types';
import Image from 'next/image';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { useUser } from '@/contexts/UserContext';
import { useMobileBeta } from '@/contexts/MobileBetaContext';
import { useState, useEffect } from 'react';

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User;
}

const TABS: { key: TabType; label: string; shortcut?: string; adminOnly?: boolean }[] = [
  { key: 'games', label: 'Games', shortcut: 'G' },
  { key: 'studio', label: 'Game Studio', shortcut: 'C' },
  { key: 'avatarShop', label: 'Avatar Shop', shortcut: 'V' },
  { key: 'coins', label: 'Pixel Coins', shortcut: 'P' },
  { key: 'friends', label: 'Friends', shortcut: 'F' },
  { key: 'settings', label: 'Settings', shortcut: 'O' },
];

export default function TopBar({ currentTab, onTabChange, user }: TopBarProps) {
  const { setUser } = useUser();
  const { isMobileBeta } = useMobileBeta();
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

  const equippedSkin = skins.find(s => s.id === user.equippedSkin) || skins.find(s => s.id === 'starter_classic') || (skins.length > 0 ? skins[0] : null);
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

  const handleLogout = () => {
    // Clear user session
    setUser(null);
    // Clear sessionStorage (which will be done automatically by UserContext useEffect, but we can also do it here)
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('pixelPlaceLoggedInUser');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/logo.png"
            alt="Pixel Place Logo"
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
            priority
          />
          <span>PIXEL PLACE</span>
          {isMobileBeta && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '4px 8px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(52,245,197,0.28), rgba(244,114,182,0.22))',
                border: '1px solid rgba(52,245,197,0.45)',
                color: '#b8fff0',
              }}
              title="Touch-friendly layout — HistoriMac hidden. Change in Settings."
            >
              MOBILE β
            </span>
          )}
        </div>
        <div className="header-nav">
          {TABS
            .filter(tab => !tab.adminOnly || user.role === 'admin' || user.role === 'head_admin')
            .map((tab) => (
              <button
                key={tab.key}
                data-tab={tab.key}
                className={currentTab === tab.key ? 'active' : ''}
                onClick={() => onTabChange(tab.key)}
                title={tab.shortcut ? `${tab.label} (press ${tab.shortcut})` : tab.label}
              >
                {tab.label}
                {tab.shortcut && (
                  <span style={{ opacity: 0.6, fontSize: '11px', marginLeft: '4px', fontWeight: 500 }}>({tab.shortcut})</span>
                )}
              </button>
            ))}
        </div>
        <div className="userbox" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'linear-gradient(135deg, rgba(52,245,197,0.12) 0%, rgba(244,114,182,0.1) 100%)',
              borderRadius: '999px',
              border: '1px solid rgba(52,245,197,0.35)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#34f5c5',
              boxShadow: '0 0 20px rgba(52,245,197,0.15)',
            }}
          >
            <span style={{ fontSize: '16px' }}>🪙</span>
            <span>{(user.coins ?? 0).toLocaleString()}</span>
          </div>
          <div
            className="avatar-top"
            onClick={handleLogout}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            title={`${user.username} — Click to log out`}
          >
            {skinWithAccessories && (
              <Avatar3DViewer
                skin={skinWithAccessories}
                width={40}
                height={40}
                interactive={false}
                animation={skinWithAccessories.defaultAnimation || 'idle'}
                equippedFace={equippedFace || undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
