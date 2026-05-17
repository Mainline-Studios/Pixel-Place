'use client';

import { TabType, User, Skin, Accessory } from '@/types';
import Image from 'next/image';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { useUser } from '@/contexts/UserContext';
import { useMobileBeta } from '@/contexts/MobileBetaContext';
import { useSiteLanguage } from '@/contexts/SiteLanguageContext';
import { useStyle } from '@/components/StyleProvider';
import LocalizeText from '@/components/LocalizeText';
import { isSupportedLocale } from '@/lib/locale';
import { useState, useEffect, useRef, type CSSProperties } from 'react';

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User;
}

const coinChipStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.15) 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 193, 7, 0.3)',
  fontSize: '14px',
  fontWeight: 600,
  color: '#ffc107',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const TABS: { key: TabType; label: string; shortcut?: string; adminOnly?: boolean }[] = [
  { key: 'games', label: 'Games', shortcut: 'G' },
  { key: 'studio', label: 'Game Studio', shortcut: 'C' },
  { key: 'avatarShop', label: 'Avatar Shop', shortcut: 'V' },
  { key: 'coins', label: 'Pixel Coins', shortcut: 'P' },
  { key: 'friends', label: 'Friends', shortcut: 'F' },
  { key: 'report', label: 'Safety', shortcut: 'R' },
  { key: 'settings', label: 'Settings', shortcut: 'O' },
];

export default function TopBar({ currentTab, onTabChange, user }: TopBarProps) {
  const { setUser } = useUser();
  const { style } = useStyle();
  const compactNav = style === 'minimalist';
  const loudNav = style === 'maximalist';
  const { isMobileBeta } = useMobileBeta();
  const { locale, setLocale, localeChoices } = useSiteLanguage();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const equippedSkin = skins.find(s => s.id === user.equippedSkin) || skins.find(s => s.id === 'pixel_placer') || (skins.length > 0 ? skins[0] : null);
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

  const handleOpenUserPage = () => {
    if (typeof window === 'undefined') return;
    const id = Number(user.userId || 0);
    if (Number.isInteger(id) && id > 0) {
      window.location.href = `/user/${id}`;
      return;
    }
    alert('Your profile id is not available yet. Sign out and sign back in, then try again.');
  };

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className={`brand${loudNav ? ' brand--max' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Image
            src="/logo.png"
            alt="Pixel Place Logo"
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
            priority
          />
          <span>PIXEL PLACE</span>
          {loudNav && (
            <span className="brand-max-tag" aria-hidden>
              EXTRA
            </span>
          )}
          {isMobileBeta && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '4px 8px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(129,140,248,0.18))',
                border: '1px solid rgba(56,189,248,0.35)',
                color: '#7dd3fc',
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
                title={
                  compactNav
                    ? tab.label
                    : tab.shortcut
                      ? `${tab.label} (press ${tab.shortcut})`
                      : tab.label
                }
              >
                <LocalizeText text={tab.label} />
                {tab.shortcut && !compactNav && (
                  <span style={{ opacity: 0.55, fontSize: '9px', marginLeft: '3px', fontWeight: 500 }}>({tab.shortcut})</span>
                )}
              </button>
            ))}
        </div>
        <div className="userbox" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim, #9aa3b2)' }}>
            <span className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
              Language
            </span>
            {!compactNav && <span aria-hidden>🌐</span>}
            <select
              value={locale}
              onChange={(e) => {
                const v = e.target.value;
                if (isSupportedLocale(v)) setLocale(v);
              }}
              style={{
                maxWidth: 200,
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid var(--border, rgba(255,255,255,0.15))',
                background: 'rgba(0,0,0,0.25)',
                color: 'inherit',
                fontSize: 12,
              }}
            >
              {localeChoices.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={`topbar-coin-balance${loudNav ? ' topbar-coin-balance--max' : ''}`}
            onClick={() => onTabChange('coins')}
            title="Buy Pixel Coins — open Pixel Coins tab"
            style={
              compactNav
                ? {
                    ...coinChipStyle,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                  }
                : coinChipStyle
            }
          >
            {!compactNav && <span style={{ fontSize: '16px' }}>🪙</span>}
            <span>{compactNav ? `Coins ${(user.coins ?? 0).toLocaleString()}` : (user.coins ?? 0).toLocaleString()}</span>
          </button>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.06)',
              }}
              title={user.username}
            >
              <div
                className="avatar-top"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                }}
              >
                {skinWithAccessories && (
                  <Avatar3DViewer
                    skin={skinWithAccessories}
                    width={28}
                    height={28}
                    interactive={false}
                    animation={skinWithAccessories.defaultAnimation || 'idle'}
                    equippedFace={equippedFace || undefined}
                  />
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.username}
              </span>
              <span aria-hidden style={{ opacity: 0.75, fontSize: 11 }}>▼</span>
            </button>
            {menuOpen && (
              <div
                className="ai-box"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  minWidth: 170,
                  padding: 8,
                  zIndex: 1200,
                }}
              >
                <button
                  type="button"
                  className="btn"
                  style={{ width: '100%', marginBottom: 6, textAlign: 'left', justifyContent: 'flex-start' }}
                  onClick={() => {
                    setMenuOpen(false);
                    handleOpenUserPage();
                  }}
                >
                  User
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
