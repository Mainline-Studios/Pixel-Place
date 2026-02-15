'use client';

import { TabType, User, Skin, Accessory } from '@/types';
import Image from 'next/image';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { useState, useEffect, useRef } from 'react';

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User;
  onLogout: () => void;
}

const TABS: { key: TabType; label: string; adminOnly?: boolean }[] = [
  { key: 'home', label: 'Home' },
  { key: 'avatarShop', label: 'Avatar Shop' },
  { key: 'coins', label: 'Pixel Coins' },
  { key: 'friends', label: 'Friends' },
  { key: 'settings', label: 'Settings' },
];

export default function TopBar({ currentTab, onTabChange, user, onLogout }: TopBarProps) {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

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
    setMenuOpen(false);
    onLogout();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="topbar" style={{ position: 'relative', zIndex: 100000 }}>
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
          {TABS
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
        <div className="userbox" style={{ position: 'relative', zIndex: 100001 }} ref={menuRef}>
          <div
            className="avatar-top"
            onClick={toggleMenu}
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
              transition: 'opacity 0.2s',
              border: menuOpen ? '2px solid #00a2ff' : '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            title="Click to open menu"
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
          
          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                background: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #333',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                minWidth: '180px',
                zIndex: 100001,
                overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '8px 0',
                borderBottom: '1px solid #333'
              }}>
                <div style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}>
                  {user.username}
                </div>
                <div style={{
                  padding: '0 16px 8px',
                  fontSize: '12px',
                  color: '#999'
                }}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </div>
              </div>
              <div style={{ padding: '4px 0' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
