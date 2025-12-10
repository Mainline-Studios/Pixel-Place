'use client';

import { useState, useEffect } from 'react';
import { TabType, User } from '@/types';
import { getInitials } from '@/lib/utils';
import { getPublished, savePublished } from '@/lib/storage';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import HomeTab from '../Tabs/HomeTab';
import DiscoverTab from '../Tabs/DiscoverTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CreateTab from '../Tabs/CreateTab';
import StudioTab from '../Tabs/StudioTab';
import CoinsTab from '../Tabs/CoinsTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';
import DonationTab from '../Tabs/DonationTab';
import AICoderTab from '../Tabs/AICoderTab';
import GamesTab from '../Tabs/GamesTab';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [editMode, setEditMode] = useState(false);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['home', 'discover', 'games', 'avatarShop', 'createGame', 'studio', 'coins', 'friends', 'settings', 'donation', 'aiCoder'].includes(hash)) {
        setCurrentTab(hash as TabType);
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleResetPublished = () => {
    if (user.role !== 'admin') return;
    savePublished([]);
    alert('All published games cleared.');
    if (currentTab === 'discover') {
      // Force re-render
      setCurrentTab('home');
      setTimeout(() => setCurrentTab('discover'), 0);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab user={user} editMode={editMode} />;
      case 'discover':
        return <DiscoverTab user={user} editMode={editMode} onResetPublished={handleResetPublished} />;
      case 'games':
        return <GamesTab user={user} editMode={editMode} />;
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
      case 'createGame':
        return <CreateTab user={user} editMode={editMode} />;
      case 'studio':
        return <StudioTab user={user} editMode={editMode} />;
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
      case 'donation':
        return <DonationTab user={user} editMode={editMode} />;
      case 'aiCoder':
        return <AICoderTab user={user} editMode={editMode} />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div id="dashboard">
      <TopBar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.location.hash = tab;
        }}
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
      <footer>
        <div style={{ marginBottom: '8px' }}>
          <a 
            href="https://creativecommons.org/licenses/by-nd-nc/4.0/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'var(--text-dim)', 
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '18px' }}>©</span>
            <span>Creative Commons BY-ND-NC 4.0</span>
          </a>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', opacity: 0.7 }}>
          Pixel Place by Mainline Studios 2025
        </div>
      </footer>
    </div>
  );
}




