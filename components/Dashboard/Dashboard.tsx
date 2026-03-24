'use client';

import { useState, useEffect, useCallback } from 'react';
import { TabType, User } from '@/types';
import { useSound } from '@/contexts/SoundContext';
import { pathToTab, tabToPath } from '@/lib/routing';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import FloatingParticles from '../FloatingParticles';
import ScrollToTop from '../ScrollToTop';
import SiteSocialLinks from '../SiteSocialLinks';
import StatusPageLink from '../StatusPageLink';
import PyxTrainCta from '../PyxTrainCta';
import { useSecretTheme } from '@/contexts/SecretThemeContext';
import GamesTab from '../Tabs/GamesTab';
import CreateTab from '../Tabs/CreateTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CoinsTab from '../Tabs/CoinsTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const { playTabSwitch } = useSound();
  const { secretTheme } = useSecretTheme();
  const [currentTab, setCurrentTab] = useState<TabType>('games');
  const [editMode, setEditMode] = useState(false);

  // Sync tab with URL (path) on load and popstate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      const tab = pathToTab(window.location.pathname) as TabType;
      if (['games', 'avatarShop', 'coins', 'friends', 'settings', 'studio', 'donation'].includes(tab)) {
        setCurrentTab(tab);
      }
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    playTabSwitch();
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      const path = tabToPath(tab);
      if (window.location.pathname !== path) {
        window.history.replaceState({}, '', path);
      }
    }
  }, [playTabSwitch]);

  // Keyboard shortcuts: G=Games, C=Studio, V=Avatar Shop, P=Coins, F=Friends, O=Settings (avoid WASD/B/A)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const map: Record<string, TabType> = { g: 'games', c: 'studio', v: 'avatarShop', p: 'coins', f: 'friends', o: 'settings' };
      if (map[key]) {
        e.preventDefault();
        handleTabChange(map[key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleTabChange]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'games':
        return <GamesTab user={user} editMode={editMode} />;
      case 'studio':
        return <CreateTab user={user} editMode={editMode} />;
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
      case 'coins':
        return <CoinsTab user={user} editMode={editMode} />;
      case 'friends':
        return <FriendsTab user={user} editMode={editMode} />;
      case 'settings':
        return         (
          <SettingsTab
            user={user}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(!editMode)}
          />
        );
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div id="dashboard" style={{ position: 'relative' }}>
      <FloatingParticles />
      <TopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
      />
      <div className="pyx-train-cta-bar" aria-label="Train Pyx AI">
        <PyxTrainCta />
      </div>
      <div className="body-row">
        <div className="body-inner">
          <Sidebar user={user} />
          <section className="main-card">
            <div
              className="ixel-ace-brand"
              style={{
                textAlign: 'center',
                padding: '10px 16px',
                marginBottom: '12px',
                background: 'linear-gradient(90deg, rgba(255,60,60,0.2), rgba(255,80,80,0.15))',
                border: '1px solid var(--border)',
                borderRadius: 'var(--panel-radius)',
                fontSize: '20px',
                fontWeight: 700,
                color: '#ff9090',
                letterSpacing: '0.1em',
              }}
            >
              ixel ace
            </div>
            {renderTabContent()}
          </section>
        </div>
      </div>
      <footer style={{
        marginTop: '40px',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '13px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          <StatusPageLink />
        </div>
        <div style={{ marginBottom: 16, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <SiteSocialLinks variant="urls" />
        </div>
        <span style={{ background: 'linear-gradient(90deg, #00aaff, #00dd88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>© 2025 Pixel Place</span>
        <span style={{ margin: '0 12px', opacity: 0.5 }}>•</span>
        <span>Play. Create. Share.</span>
        <span style={{ margin: '0 12px', opacity: 0.5 }}>•</span>
        <span>Press G, S, C, P, F, or O to switch tabs</span>
      </footer>
      <ScrollToTop />
    </div>
  );
}




