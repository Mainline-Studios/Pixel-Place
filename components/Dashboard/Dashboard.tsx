'use client';

import { useState, useEffect } from 'react';
import { TabType, User } from '@/types';
import { tabToPath, navigateToTab } from '@/lib/routing';
import { getPublished, savePublished } from '@/lib/storage';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import GameErrorBoundary from '../GameErrorBoundary';
import HomeTab from '../Tabs/HomeTab';
import PlayTab from '../Tabs/PlayTab';
import GamesTab from '../Tabs/GamesTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CreateTab from '../Tabs/CreateTab';
import StudioTab from '../Tabs/StudioTab';
import CoinsTab from '../Tabs/CoinsTab';
import ServersTab from '../Tabs/ServersTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';
import DonationTab from '../Tabs/DonationTab';

interface DashboardProps {
  user: User;
  initialTab?: string;
  isPreview?: boolean;
}

export default function Dashboard({ user, initialTab = 'home', isPreview }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState<TabType>(
    (initialTab as TabType) || 'home'
  );

  // Sync when parent passes new initialTab (e.g. browser back/forward)
  useEffect(() => {
    if (initialTab && initialTab !== currentTab) {
      setCurrentTab(initialTab as TabType);
    }
  }, [initialTab]);

  // Listen for programmatic navigation (e.g. from AICoderTab, GameStudioTab)
  useEffect(() => {
    const handler = (e: CustomEvent<{ tab: string }>) => {
      const tab = e.detail?.tab as TabType | undefined;
      if (tab) {
        setCurrentTab(tab);
        const path = tabToPath(tab);
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', path);
        }
      }
    };
    window.addEventListener('pixelplace-navigate', handler as EventListener);
    return () => window.removeEventListener('pixelplace-navigate', handler as EventListener);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    const path = tabToPath(tab);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', path);
    }
  };
  const [editMode, setEditMode] = useState(false);

  const handleResetPublished = () => {
    if (user.role !== 'admin') return;
    savePublished([]);
    // Silent success - no alert. Force re-render if on home tab
    if (currentTab === 'home') {
      setCurrentTab('games');
      setCurrentTab('home');
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab user={user} editMode={editMode} />;
      // Discover tab was merged into Home tab - removed
      case 'play':
        return <PlayTab user={user} editMode={editMode} />;
      case 'games':
        return <GamesTab user={user} editMode={editMode} />;
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
      case 'createGame':
        return <CreateTab user={user} editMode={editMode} />;      case 'studio':
        return <StudioTab user={user} editMode={editMode} />;
      case 'coins':
        return <CoinsTab user={user} editMode={editMode} />;
      case 'servers':
        return <ServersTab user={user} editMode={editMode} />;
      case 'friends':
        return <FriendsTab user={user} editMode={editMode} />;
      case 'settings':
        return (
          <SettingsTab
            user={user}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(!editMode)}
          />
        );
      case 'donation':
        return <DonationTab user={user} editMode={editMode} />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div id="dashboard">
      <TopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
      />
      <div className="body-row">
        <div className="body-inner">
          <Sidebar user={user} onNavigate={(tab) => handleTabChange(tab as TabType)} />
          <section className="main-card">
            <GameErrorBoundary onBack={() => handleTabChange('home')}>
              {renderTabContent()}
            </GameErrorBoundary>
          </section>
        </div>
      </div>
      <footer>© 2025 Pixel Place | All Rights Reserved | Support: <a href="mailto:support@pixelplaceofficial.com">support@pixelplaceofficial.com</a></footer>
    </div>
  );
}




