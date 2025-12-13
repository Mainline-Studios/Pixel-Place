'use client';

import { useState, useEffect } from 'react';
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
import DonationTab from '../Tabs/DonationTab';
import AICoderTab from '../Tabs/AICoderTab';
import GamesTab from '../Tabs/GamesTab';
import AdminPanelTab from '../Tabs/AdminPanelTab';
import ReportTab from '../Tabs/ReportTab';
import Image from 'next/image';

import { toast } from '@/lib/toast';
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
      if (hash && ['home', 'discover', 'games', 'avatarShop', 'createGame', 'studio', 'coins', 'friends', 'settings', 'donation', 'aiCoder', 'adminPanel', 'report'].includes(hash)) {
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
    toast.info('All published games cleared.');
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
      case 'donation':
        return <DonationTab user={user} editMode={editMode} />;
      case 'aiCoder':
        return <AICoderTab user={user} editMode={editMode} />;
      case 'adminPanel':
        return <AdminPanelTab user={user} editMode={editMode} />;
      case 'report':
        return <ReportTab user={user} editMode={editMode} />;
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
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Image
            src="/logo.png"
            alt="Pixel Place Logo"
            width={16}
            height={16}
            style={{ objectFit: 'contain' }}
          />
          <span>Pixel Place by Mainline Studios 2025</span>
        </div>
      </footer>
    </div>
  );
}




