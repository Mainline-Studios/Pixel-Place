'use client';

import { useState } from 'react';
import { TabType, User } from '@/types';
import { getInitials } from '@/lib/utils';
import { getPublished, savePublished } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import HomeTab from '../Tabs/HomeTab';
// DiscoverTab, PlayTab, GamesTab, CreateTab, StudioTab, and ServersTab removed
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CoinsTab from '../Tabs/CoinsTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const { setUser, updateUser } = useUser();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [editMode, setEditMode] = useState(false);

  const handleResetPublished = () => {
    if (user.role !== 'admin') return;
    savePublished([]);
    // Silent success - no alert
    // Force re-render if on home tab
    if (currentTab === 'home') {
      setCurrentTab('home');
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab user={user} editMode={editMode} />;
      // Discover tab and Play tab were merged into Home tab - removed
      // Create tab removed
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} updateUser={updateUser} />;
      case 'coins':
        return <CoinsTab user={user} editMode={editMode} />;
      case 'friends':
        return <FriendsTab user={user} editMode={editMode} />;
      case 'settings':
        return (
          <SettingsTab
            user={user}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(!editMode)}
            onResetPublished={handleResetPublished}
          />
        );
      default:
        return <div>Unknown tab</div>;
    }
  };

  const handleLogout = () => {
    // Clear user session
    setUser(null);
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('pixelPlaceLoggedInUser');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  };

  return (
    <div id="dashboard">
      <TopBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onLogout={handleLogout}
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




