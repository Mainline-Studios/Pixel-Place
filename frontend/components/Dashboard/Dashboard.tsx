'use client';

import { useState, useEffect, useCallback } from 'react';
import { TabType, User } from '@/types';
import { useSound } from '@/contexts/SoundContext';
import { pathToTab, tabToPath } from '@/lib/routing';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import FloatingParticles from '../FloatingParticles';
import ScrollToTop from '../ScrollToTop';
import GamesTab from '../Tabs/GamesTab';
import CreateTab from '../Tabs/CreateTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CoinsTab from '../Tabs/CoinsTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';
import ProgressionTab from '../Tabs/ProgressionTab';
import FactionsTab from '../Tabs/FactionsTab';
import PremiumTab from '../Tabs/PremiumTab';
import ParentControlsTab from '../Tabs/ParentControlsTab';
import { useTranslation } from 'react-i18next';
import { isBackendConfigured } from '@/lib/backendV1';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const { t } = useTranslation('dashboard');
  const { playTabSwitch } = useSound();
  const [currentTab, setCurrentTab] = useState<TabType>('games');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      const tab = pathToTab(window.location.pathname) as TabType;
      const allowed = [
        'games',
        'avatarShop',
        'coins',
        'friends',
        'settings',
        'studio',
        'donation',
        ...(isBackendConfigured()
          ? (['progression', 'factions', 'premium', 'parent'] as const)
          : []),
      ];
      if (allowed.includes(tab)) {
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

  useEffect(() => {
    const onNav = (e: Event) => {
      const tab = (e as CustomEvent<{ tab: string }>).detail?.tab;
      if (tab) handleTabChange(tab as TabType);
    };
    window.addEventListener('pixelplace-navigate', onNav);
    return () => window.removeEventListener('pixelplace-navigate', onNav);
  }, [handleTabChange]);

  // Keyboard shortcuts: G=Games, C=Studio, V=Avatar Shop, P=Coins, F=Friends, O=Settings (avoid WASD/B/A)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const map: Record<string, TabType> = {
        g: 'games',
        c: 'studio',
        v: 'avatarShop',
        p: 'coins',
        f: 'friends',
        o: 'settings',
      };
      if (isBackendConfigured()) {
        map.r = 'progression';
        map.t = 'factions';
        map.y = 'parent';
      }
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
      case 'progression':
        return <ProgressionTab user={user} editMode={editMode} />;
      case 'factions':
        return <FactionsTab user={user} editMode={editMode} />;
      case 'premium':
        return <PremiumTab user={user} editMode={editMode} />;
      case 'parent':
        return <ParentControlsTab user={user} editMode={editMode} />;
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
        return <div>{t('unknownTab')}</div>;
    }
  };

  return (
    <div id="dashboard" className="relative flex min-h-screen flex-col">
      <FloatingParticles />
      <TopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
      />
      <div className="flex flex-1 justify-center px-4 pb-10 pt-6 md:px-6">
        <div className="flex w-full max-w-[1400px] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <Sidebar user={user} onNavigate={handleTabChange} />
          <section className="relative flex min-h-[min(600px,72vh)] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-lg md:p-8">
            {renderTabContent()}
          </section>
        </div>
      </div>
      <footer className="mt-auto border-t border-border/80 bg-muted/30 px-4 py-8 text-center text-xs text-muted-foreground md:text-sm">
        <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text font-semibold text-transparent dark:from-sky-400 dark:to-emerald-400">
          {t('footerCopyright')}
        </span>
        <span className="mx-3 opacity-40">•</span>
        <span>{t('footerTagline')}</span>
        <span className="mx-3 opacity-40">•</span>
        <span className="hidden sm:inline">{t('footerShortcuts')}</span>
      </footer>
      <ScrollToTop />
    </div>
  );
}




