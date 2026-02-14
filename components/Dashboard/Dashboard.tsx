'use client';

import { useState, useEffect } from 'react';
import { TabType, User } from '@/types';
import { pathToTab, tabToPath } from '@/lib/routing';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import GamesTab from '../Tabs/GamesTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CoinsTab from '../Tabs/CoinsTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState<TabType>('games');
  const [editMode, setEditMode] = useState(false);

  // Sync tab with URL (path) on load and popstate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      const tab = pathToTab(window.location.pathname) as TabType;
      if (['games', 'avatarShop', 'coins', 'friends', 'settings', 'donation'].includes(tab)) {
        setCurrentTab(tab);
      }
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      const path = tabToPath(tab);
      if (window.location.pathname !== path) {
        window.history.replaceState({}, '', path);
      }
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'games':
        return <GamesTab user={user} editMode={editMode} />;
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
    <div id="dashboard">
      <TopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
      />
      <div className="body-row">
        <div className="body-inner">
          <Sidebar user={user} />
          <section className="main-card">{renderTabContent()}</section>
        </div>
      </div>
      <footer>© 2025 Pixel Place | All Rights Reserved</footer>
    </div>
  );
}




