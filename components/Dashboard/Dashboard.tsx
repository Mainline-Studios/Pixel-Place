'use client';

import { useState } from 'react';
import { TabType, User } from '@/types';
import { getInitials } from '@/lib/utils';
import { getPublished, savePublished } from '@/lib/storage';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import HomeTab from '../Tabs/HomeTab';
<<<<<<< HEAD
// DiscoverTab removed - merged into HomeTab
import PlayTab from '../Tabs/PlayTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CreateTab from '../Tabs/CreateTab';
=======
// DiscoverTab and PlayTab removed - merged into HomeTab
// CreateTab removed
import AvatarShopTab from '../Tabs/AvatarShopTab';
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
import StudioTab from '../Tabs/StudioTab';
import CoinsTab from '../Tabs/CoinsTab';
import ServersTab from '../Tabs/ServersTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
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
<<<<<<< HEAD
      // Discover tab was merged into Home tab - removed
      case 'play':
        return <PlayTab user={user} editMode={editMode} />;
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
      case 'createGame':
        return <CreateTab user={user} editMode={editMode} />;
=======
      // Discover tab and Play tab were merged into Home tab - removed
      // Create tab removed
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      case 'studio':
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
            onResetPublished={handleResetPublished}
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
        onTabChange={setCurrentTab}
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




