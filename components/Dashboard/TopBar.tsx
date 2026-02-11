'use client';

<<<<<<< HEAD
import { TabType, User, Skin, Accessory } from '@/types';
=======
import { TabType, User } from '@/types';
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
import Image from 'next/image';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { useUser } from '@/contexts/UserContext';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User;
}

const tabs: { key: TabType; label: string; adminOnly?: boolean }[] = [
  { key: 'home', label: 'Home' },
<<<<<<< HEAD
  { key: 'play', label: 'Play' },
  { key: 'createGame', label: 'Create' },
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  { key: 'avatarShop', label: 'Avatar Shop' },
  { key: 'coins', label: 'Pixel Coins' },
  { key: 'friends', label: 'Friends' },
  { key: 'settings', label: 'Settings' },
];

export default function TopBar({ currentTab, onTabChange, user }: TopBarProps) {
  const { setUser } = useUser();
<<<<<<< HEAD
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
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

  // Guard against undefined user
  if (!user) {
    return (
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image
              src="/logo.png"
              alt="Pixel Place Logo"
              width={32}
              height={32}
<<<<<<< HEAD
              style={{ objectFit: 'contain', borderRadius: '8px' }}
=======
              style={{ objectFit: 'contain' }}
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
              priority
            />
            <span>PIXEL PLACE</span>
          </div>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const equippedSkin = skins.find(s => s.id === user.equippedSkin) || skins.find(s => s.id === 'starter_classic') || (skins.length > 0 ? skins[0] : null);
  // Get equipped face if available
  const equippedFace = user.equippedFace ? skins.find(s => s.id === user.equippedFace && s.isFace) : null;
=======
  const skins = getSkins();
  const accessories = getAccessories();
  const equippedSkin = skins.find(s => s.id === user.equippedSkin) || skins.find(s => s.id === 'starter_classic') || (skins.length > 0 ? skins[0] : null);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
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
        </div>
        <div className="header-nav">
          {tabs
            .filter(tab => !tab.adminOnly || user.role === 'admin')
            .map((tab) => (
              <button
                key={tab.key}
                data-tab={tab.key}
                className={currentTab === tab.key ? 'active' : ''}
                onClick={() => onTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
        </div>
        <div className="userbox">
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
            title="Click to log out"
          >
            {skinWithAccessories && (
              <Avatar3DViewer
                skin={skinWithAccessories}
                width={40}
                height={40}
                interactive={false}
                animation={skinWithAccessories.defaultAnimation || 'idle'}
<<<<<<< HEAD
                equippedFace={equippedFace || undefined}
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
              />
            )}
          </div>
          <div className="user-texts">
            <div className="username-top">{user.username}</div>
<<<<<<< HEAD
            <div className="role-top" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>{user.role}</span>
              {user.safetyPoints !== undefined && (
                <span style={{ 
                  color: '#4a90e2', 
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  🛡️ {user.safetyPoints.toLocaleString()}
                </span>
              )}
            </div>
=======
            <div className="role-top">{user.role}</div>
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
          </div>
        </div>
      </div>
    </div>
  );
}
