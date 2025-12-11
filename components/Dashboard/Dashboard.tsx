'use client';

import { useState } from 'react';
import { TabType, User } from '@/types';
import { getInitials } from '@/lib/utils';
import { getPublished, savePublished } from '@/lib/storage';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import HomeTab from '../Tabs/HomeTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CreateTab from '../Tabs/CreateTab';
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
    alert('All published games cleared.');
    if (currentTab === 'home') {
      // Force re-render
      setCurrentTab('settings');
      setTimeout(() => setCurrentTab('home'), 0);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab user={user} editMode={editMode} onResetPublished={handleResetPublished} />;
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
      case 'createGame':
        return <CreateTab user={user} editMode={editMode} />;
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
        username={user.username}
        role={user.role}
        avatarInitials={getInitials(user.username)}
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




